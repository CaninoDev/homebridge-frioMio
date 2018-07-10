var Lirc = require('./lib/lirc')
var Service, Characteristic

/*  Inject the plugin within homebridge, 'ACaccessory' is an object containing the control logic */
module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-lirc-LG-aircon', 'LGaircon', ACaccessory)
}

/* Platform constructor,
 * config may be null.
 */
class ACaccessory {
  constructor (log, config) {
    /* General Attributes */
    this.name = config.name
    this.log = log
    this.manufacturer = config.manufacturer
    this.model = config.model
    this.serial = config.serial

    /* Initial States */
    this.powerState = 1
    this.mode = 'econ'
    this.temperature = 15.5667
    this.services = []

    /* Initiate IR remote */
    this.lirc = new Lirc(config.lirc)
    this.commands = config.commands

    this.log(`Initializing ${this.name}...`)

    this.addServices()
    this.bindCharacteristics()
    this.syncStates()
  }

  addServices () {
    this.heaterCoolerService = new Service.HeaterCooler(this.name)
    this.services.push(this.heaterCoolerService)

    this.informationService = new Service.AccessoryInformation()
    this.services.push(this.informationService)
  }

  bindCharacteristics () {
    /* Required characteristics for Service.HeaterCooler */
    this.Active = this.heaterCoolerService.getCharacteristic(Characteristic.Active)
    this.Active.on('set', this.setActive.bind(this))

    this.CurrentTemperature = this.heaterCoolerService.getCharacteristic(Characteristic.CurrentTemperature)

    this.CurrentHeaterCoolerState = this.heaterCoolerService.getCharacteristic(Characteristic.CurrentHeaterCoolerState)

    this.TargetHeaterCoolerState = this.heaterCoolerService.getCharacteristic(Characteristic.TargetHeaterCoolerState)
    this.TargetHeaterCoolerState
      .setProps({validValues:
      [Characteristic.TargetHeatingCoolingState.OFF, Characteristic.TargetHeatingCoolingState.COOL, Characteristic.TargetHeatingCoolingState.AUTO]})
      .on('set', this.setTargetHeaterCoolerState.bind(this))
  }

  syncStates () {
    var accessory = this
    var currentPowerState = this.powerState
    if (currentPowerState === this.Active) {
      this.log('powerstate synced')
    } else {
      this.lirc.send(this.commands.power, function (err) {
        if (err) {
          accessory.log(err)
        } else {
          accessory.powerState ? accessory.Active.updateValue(Characteristic.Active.ACTIVE) : accessory.Active.updateValue(Characteristic.Active.INACTIVE)
        }
      })
    }
    this.CurrentTemperature.updateValue(this.temperature)
  }

  setTargetHeaterCoolerState (state, callback) {
    callback()
    this.log(`setTargetHeaterCooler::state: ${state}`)
  }

  setActive (state, callback) {
    var accessory = this
    var power = accessory.powerState
    accessory.log('setActive::state: ' + state)
    accessory.powerState = power ? 0 : 1
    this.syncStates()
    callback()
  }

  /* framework interface */
  getServices () {
    return this.services
  }
}
