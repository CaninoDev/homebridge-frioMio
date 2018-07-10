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
    this.powerState = 0
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
  }

  syncStates () {
    switch (this.powerState) {
      case 0:
        this.Active.updateValue(Characteristic.Active.INACTIVE)
        break
      case 1:
        this.Active.updateValue(Characteristic.Active.ACTIVE)
        break
    }

    this.CurrentTemperature.updateValue(this.temperature)
  }

  setActive (state, callback) {
    var accessory = this
    var power = accessory.powerState
    accessory.log('state: ' + state)

    if (state === accessory.powerState) {
      let err = `${accessory.name}'s is out of sync. Please reset...'`
      callback(err)
    } else {
      accessory.lirc.send(accessory.commands.power, function (err) {
        if (err) {
          callback(err)
        } else {
          accessory.powerState = power ? 0 : 1
        }
      })
    }
    this.syncStates()
    callback()
  }

  /* framework interface */
  getServices () {
    return this.services
  }
}
