var Lirc = require('./lib/lirc')
var Service, Characteristic

/*  Inject the plugin within homebridge, 'acAccessory' is an object containing the control logic */
module.exports = function(homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-lirc-LG-aircon', 'LGaircon', acAccessory)
}

/* Platform constructor,
 * config may be null.
 */
function acAccessory(log, config) {
  this.name = config.name
  this.log = log
  this.manufacturer = config.manufacturer
  this.model = config.model
  this.serial = config.serial

  this.powerState = 0
  this.mode

  this.lirc = new Lirc(config.lirc)
  this.commands = config.commands

  this.log(`Initializing ${this.name}...`)
}

acAccessory.prototype.getActive = function(callback) {
  var accessory = this
  if (accessory.power) {
    callback(null, Characteristic.Active.ACTIVE)
  } else {
    callback(null, Characteristic.Active.INACTIVE)
  }
}

acAccessory.prototype.setActive = function(state, callback) {
  var accessory = this
  var power = accessory.powerState
  accessory.log('state: ' + state)


  if (state == accessory.powerState) {
    accessory.log(`${accessory.name}'s is out of sync. Please reset...'`)
  } else {
    accessory.lirc.send(accessory.commands.power, function(err) {
      if(err) {
        callback(err)
      } else {
        accessory.powerState = power ? 0 : 1
      }
    })
  }
  callback()
}

acAccessory.prototype.getServices = function () {
  this.informationService = new Service.AccessoryInformation()
  this.informationService
    .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
    .setCharacteristic(Characteristic.Model, this.model)
    .setCharacteristic(Characteristic.SerialNumber, this.serial)

  this.HeaterCoolerService = new Service.HeaterCooler(this.name)
  this.HeaterCoolerService
    .getCharacteristic(Characteristic.Active)
    .on('get', this.getActive.bind(this))
    .on('set', this.setActive.bind(this))

  return [this.informationService, this.HeaterCoolerService]
}
