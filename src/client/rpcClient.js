const axon = require('pm2-axon');
const rpc = require('pm2-axon-rpc');
const app_config = require('../config/app_config');

const req = axon.socket('req');
const client = new rpc.Client(req);

const { port } = app_config;
req.connect(port);

// Function to ensure the daemon is running
function ensureDaemonIsRunning(launchDaemon, callback) {
    // Schedule a timeout to call launchDaemon after 3 seconds. This ensures that if the ping fails (because the daemon is not running),
    // the daemon will be started automatically after the delay.
    const timeoutId = setTimeout(() => {
        console.log('Starting daemon after 3 seconds...');
        launchDaemon(() => {
            console.log('Daemon started. Retrying command...');
            callback();
        });
    }, 2000);

    try {
        // Attempt to ping the daemon
        client.call('ping', null, function (err, isRunning) {
            if (err || !isRunning) {
                console.log('Daemon not launched. Waiting for 3 seconds before starting...');
                // The setTimeout will automatically start the daemon after 3 seconds
            } else {
                console.log('Daemon is already running.');
                clearTimeout(timeoutId);
                callback();
            }
        });
    } catch (error) {
        console.error('Error occurred while pinging daemon:', error);
    }
}


// Export the client and related functions
module.exports = {
    client,
    ensureDaemonIsRunning
};
