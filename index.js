var Lirc = require('./lib/lirc')
var Service, Characteristic

/*  Inject the plugin within homebridge, 'ACaccessory' is an object containing the control logic */
module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-frioMio', 'LGaircon', LGaircon)
}
/* Platform constructor,
 * config may be null.
 */
class LGaircon {
  constructor (log, config) {
    /* General Attributes */
    this.name = config.name
    this.serialNumber = config.serial
    this.model = config.model
    this.manufacturer = config.manufacturer
    this.log = log
    this.services = []

    /* Initial States */
    this.powerState = 0
    this.mode = 'cool'
    this.acTemperatureSetting = 60
    this.temperatureDisplayUnits = config.temperatureUnit.toUpperCase() === 'CELSIUS' ? Characteristic.TemperatureDisplayUnits.CELSIUS : Characteristic.TemperatureDisplayUnits.FAHRENHEIT

    /* Initialize IR remote */
    this.lirc = new Lirc(config.lirc)
    this.lirc.commands = config.commands

    /* Bring it all together */
    this.log(`Initializing ${this.name}...`)

    this.addServices()
    this.bindCharacteristics()
  }

  addServices () {
    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial)

    this.services.push(this.informationService)
  }

  /* framework interface */
  getServices () {
    return this.services
  }
}
