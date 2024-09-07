const os = require('os');

// Configuration object
const config = {
    port: 8010,
    homeDirectory: `${os.homedir()}/jarvis`,
    logsDirectory: 'logs',
    pidsDirectory: 'pids'
};

module.exports = config;
