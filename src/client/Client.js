const axon = require('pm2-axon');
const rpc = require('pm2-axon-rpc');
const app_config = require('../config/app_config');

class Client {

  constructor() {
    const req = axon.socket('req');
    this.client = new rpc.Client(req);
    const { port } = app_config;
    req.connect(port);
  }

  /**
   * Ensure that the daemon is running
   * @param {Function} launchDaemon - Function to launch the daemon if it is not running
   * @param {Function} callback - Callback function to execute once the daemon is confirmed running
   */
  ensureDaemonIsRunning(launchDaemon, callback) {

    const timeoutId = setTimeout(() => {
      console.log('Starting daemon after 2 seconds...');
      launchDaemon(() => {
        console.log('Daemon started. Retrying command...');
        callback();
      });
    }, 2000);

    try {
      // Attempt to ping the daemon
      this.client.call('ping', null, (err, isRunning) => {
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
}

// Export an instance of Client
module.exports = Client
