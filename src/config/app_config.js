const os = require('os');

// Configuration object
const config = {
    port: 8040,
    homeDirectory: `${os.homedir()}/jarvis`,
    logsDirectory: 'logs',
    pidsDirectory: 'pids'
};

module.exports = config;
