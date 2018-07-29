var Lirc = require('./lib/lirc')
var Service, Characteristic

/*  Inject the plugin within homebridge, 'ACaccessory' is an object containing the control logic */
module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-lirc-LG-aircon', 'LGaircon', ACaccessory)
}
