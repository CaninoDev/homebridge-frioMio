const Service, Characteristic
const request = require('request')
const url = require('url')

/** Inject the plugin within homebridge. 'mySwitch' is an object containing the control logic
*/
module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebrdige.hap.Characteristic
  homebridge.registerAccessory('switch-plugin', 'MyAwesomeSwitch', MySwitch)
}
/** Define the fake-switch prototype:
 * getServices provides the protoype function
 * informationService is readable and represents information about the device
 * switchService is writable and will use REST to get & set state
 */

mySwitch.prototype = {
  getServices: function () {
    let informationService = new Service.AccessoryInformation()
    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'My Swtich Manufacturer')
      .setCharacteristic(Characteristic.Model, 'My switch model')
      .setCharacteristic(Characteristic.SerialNumber, '123-456-789')

    let switchService = new Service.Switch('My switch')
    switchService
      .getCharacteristic(Characteristic.On)
        .on('get', this.getSwitchOnCharacteristic.bind(this))
        .on('set', this.setSwitchOnCharacteristic.bind(this))

    this.informationService = informationService
    this.switchService = switchService
    return [informationService, switchService]
  },

  getSwitchOnCharacteristic: function (next) {
    const me = this
    request({
      url: me.getUrl,
      method: 'GET',
    },
      function (error, responsem, body) {
        if (error) {
          me.log('STATUS: ' + response.statusCode)
          me.log(error.message);
          return next(error);
        }
        return next();
    })
  },

  setSwitchOnCharacteristic: function (on, next) {
    const me = this;
    request({
      url: me.postUrl,
      body: {'targetState': on},
      method: 'POST',
      headers: {'Content-type': 'application/json'}
    },
    function (error, response) {
      if (error) {
        me.log('STATUS: ' + response.statusCode)
        me.log(error.message)
        return next(error)
      }
      return next()
    })
  }   
}


