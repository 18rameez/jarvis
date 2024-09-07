const axon = require('pm2-axon');
const rpc = require('pm2-axon-rpc');
const app_config = require('../config/app_config');

const req = axon.socket('req');
const client = new rpc.Client(req);

const { port } = app_config;
req.connect(port);

// Function to ensure the daemon is running
function ensureDaemonIsRunning(launchDaemon, callback) {
    launchDaemon(() => {});
    client.call('ping', null, function(err, isRunning) {

        if (err || !isRunning) {
            console.log('Daemon not launched. Starting daemon...');
            launchDaemon(() => {
                console.log('Daemon started. Retrying command...');
                callback();
            });
        } else {
            callback();
        }
    });
}

// Export the client and related functions
module.exports = {
    client,
    ensureDaemonIsRunning
};
