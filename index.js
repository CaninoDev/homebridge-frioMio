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
class LGaircon {
  constructor (log, config) {
    /* General Attributes */
    this.name = config.name
    this.serialNumber = config.serial
    this.model = config.model
    this.manufacturer = config.manufacturer
    this.log = log
    this.service = []

    /* Initial States */
    this.powerState = 0
    this.mode = 'cool'
    this.acTemperatureSetting = 60
    this.temperatureDisplayUnits = config.temperatureUnit.toUpperCase() === 'CELSIUS' ? Characteristic.TemperatureDisplayUnits.CELSIUS : Characteristic.TemperatureDisplayUnits.FAHRENHEIT

    /* Bring it all together */
    this.log(`Initializing ${this.name}...`)

    this.addServices()
    this.bindCharacteristics()
  }
}
