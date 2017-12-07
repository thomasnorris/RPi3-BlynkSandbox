
var _outerFunc = module.exports = {
	Setup: function(callback) {
		var _dto = requireLocal('date-time-operations');
		var _fs = require('fs');
		var _tcpPortUsed = require('tcp-port-used');
		var _blynkLibrary = require('blynk-library');
		var _blynkAuth = requireLocal('blynk-auth').GetAuth();

		var _blynkErrorLogNameWithPath = __dirname + '/blynk-errors.txt';

		// --These must match the hardware plain tcp/ip port and the ip of the server
		var blynkServerPort = 8442; //--8442 is the default
		var blynkServerIp = 'localhost';

		// --Blynk will only connect once the server is up and running
		(function CheckForServerAndSetupBlynk() {
			_tcpPortUsed.check(blynkServerPort, blynkServerIp).then((inUse) => {
				if (!inUse)
					CheckForServerAndSetupBlynk();
				else {
					blynk = new _blynkLibrary.Blynk(_blynkAuth, options = {
						connector: new _blynkLibrary.TcpClient(
							options = { addr: blynkServerIp, port: blynkServerPort })});

					// --Catch Blynk errors and log them to a file. PM2 will take care of other issues
					blynk.on('error', (blynkErr) => {
						_fs.stat(_blynkErrorLogNameWithPath, (err, stats) => {
							if (!stats || stats.size === 0)
								_fs.closeSync(_fs.openSync(_blynkErrorLogNameWithPath, 'w'));

							var stream = _fs.createWriteStream(_blynkErrorLogNameWithPath, { flags: 'a' });
							stream.write(_dto.GetCurrentDateAndTime() + ': ' + blynkErr);
							stream.end('\n');
						});
					});

					// --Small delay is necessary otherwise Blynk will error right away
					setTimeout(() => {
						callback(blynk);
					}, 500);
				}
			});
		})();
	}
}