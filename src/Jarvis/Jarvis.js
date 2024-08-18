
const ProcessManager = require('./ProcessManager.js')
const JarvisHandler = require('./JarvisHandler.js')
const os = require('os');



class Jarvis {


    constructor() {

        this.jarvis_id = "Jarvis 2024";
        this.processes = {};
        this.pids = [];
        this.Home_Directory = `${os.homedir()}/jarvis`;
        this.Logs_Directory = 'logs'
        this.pids_directory = 'pids'
        this.processManager = new ProcessManager(this);
        this.jarvisHandler = new JarvisHandler(this);
    }

}

module.exports = Jarvis;

