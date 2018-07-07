const Lirc = require ('./lirc')
var Service, Characteristic

/** Inject the plugin within homebridge. 'airCond_LG' is an object containing the control logic
*/
module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-dev', 'dev', airConditionerAccessory)
}

/** Platform constructor,
 * config may be null
 */
function airConditionerAccessory(log, config) {
  this.log = log
  this.lirc = new Lirc(config.lirc)
  this.name = config.name
  this.manufacturer = config.manufacturer
  this.model = config.model
  this.serialNum = config.SerialNumber
  this.power = config.initialPowerState
  this.tempSetting = config.initialTemp
  this.mode = config.initialMode
  this.speed = config.speed
  this.commands = config.commands
  this.log("Starting LIRC device " + this.name +"...")
}
/** Define the getter and setter function for powerstate
*/

airConditionerAccessory.prototype.getPowerState = function(callback) {
  var powerOn = this.power > 0
  this.log(`State for the ${this.name} is ${this.power}`)
  callback(null, powerOn)
}

airConditionerAccessory.prototype.setPowerState = function(powerOn, callback) {
  var self = this;
  var shouldSwitchState = true

  if(powerOn == self.power) {
    callback(null, self.power)
    shouldSwitchState = false
  }
  
  this.lirc.send(self.commands.power, function(err) {
    if(!err) {
      if (shouldSwitchState) {
        self.power = powerOn ? 1 : 0
      }
      self.log("Set state to %s", self.power)
    }
    callback(err, self.state)
  })
}
/** Define the prototype
 * getServices provides the protoype function
 * informationService is readable and represents information about the device
 * powerSwitchService is writable and will use REST to get & set state
 */

airConditionerAccessory.prototype.getServices = function() {
  let informationService = new Service.AccessoryInformation()
  informationService
    .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
    .setCharacteristic(Characteristic.Model, this.model)
    .setCharacteristic(Characteristic.SerialNumber, this.serialNum)

  let powerSwitchService = new Service.Switch(this.name)
  powerSwitchService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getPowerState.bind(this))
    .on('set', this.setPowerState.bind(this))

    this.informationService = informationService
    this.powerSwitchService = powerSwitchService

    console.log('this.commands.power: ', this.commands.power)
    return [informationService, powerSwitchService]
}
