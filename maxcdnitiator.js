var
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	config = require('maxconf')(),
	maxcdn = new require('maxcdn')(config.alias, config.token, config.secret);

function MaxCdnitiator() {

	EventEmitter.call(this);

	var that = this,
		workqueue = [];

	this.processData = function() {
		// Pop data off the array, process that biz.
		var record = workqueue.shift();

		if (record && record.length > 0) {
			// Emit a 304 event to whoever is listening
			that.emit('304', record);
		}

		// Fetch more records if the queue gets low.
		if (workqueue.length === 50) {
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
		maxcdn.get('v3/reporting/logs.json?status=304', this.appendData);
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
