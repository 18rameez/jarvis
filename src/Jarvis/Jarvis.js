
const ProcessManager = require('./ProcessManager.js')
const JarvisHandler = require('./JarvisHandler.js')
const os = require('os');
const config = require('../config/app_config.js'); 




class Jarvis {


    constructor() {

        this.jarvis_id = "Jarvis 2024";
        this.processes = {};
        this.pids = [];
        this.Home_Directory = config.homeDirectory; 
        this.Logs_Directory = config.logsDirectory; 
        this.pids_directory = config.pidsDirectory; 
        this.processManager = new ProcessManager(this);
        this.jarvisHandler = new JarvisHandler(this);
    }

}

module.exports = Jarvis;

