/* Sourced from rodrobin's NPM package https://www.npmjs.com/package/homebridge-lirc */
var net = require('net');

module.exports = function Lirc(config) {
	var promisedSendKey = function(key) {
		return new Promise(function(resolve, reject) {
			sendKey(key, resolve, reject);
		});
	};

	var sendKey = function(key, resolve, reject) {
		var client = net.connect({host: config.host, port: config.port || 8765}, function() {
			var command = 'SEND_ONCE ' + config.remote + ' ' + key;
			console.log('connected to host about to issue command(s): ' + command);
			config.test || client.write(command + '\r\n');
			client.end();
			setTimeout(resolve, config.delay || 250);
		});

		client.on('error', function(error) {
			console.log("failed to communicate with host");
			reject(error);
		});
	};

	var sendKeys = function(keys) {
		return keys.reduce(function(collector, key) {
			return collector.then(function() { return promisedSendKey(key); } );
		}, Promise.resolve());
	};

	this.send = function(keys, callback) {
		sendKeys(keys).then(function() {
			callback(null);
		}).catch(function(err) {
			console.log(err);
			callback(err);
		});
	};
};

