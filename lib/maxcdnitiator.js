var
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	maxconf = require('maxconf')(),
	maxcdn = new require('maxcdn')(maxconf.alias, maxconf.token, maxconf.secret);

function MaxCdnitiator(config) {

	EventEmitter.call(this);

	var that = this,
		workqueue = [];

	this.processData = function() {
		// Pop data off the array, process that biz.
		var record = workqueue.shift();

		if (record) {
			console.log('processing');
			that.emit(config.eventName, record);
		}

		// Fetch more records if the queue gets low.
		if (workqueue.length <= 50) {
			that.getData();
		}

		setTimeout(that.processData, 750);
	};

	this.appendData = function(error, result) {
		if (!error) {
			if (!result || !result.records || result.records.length < 1) return;

			result.records.forEach(function (record) {
				workqueue.push(record.client_continent);
			});

		}
	};

	this.getData = function() {
		maxcdn.get(config.dataUrl, this.appendData);
	};

	this.init = function() {
		that.getData();

		setTimeout(that.processData, 750);
	};

	// Go go go!
	this.init();

}

util.inherits(MaxCdnitiator, EventEmitter);

module.exports = MaxCdnitiator;
