
const ProcessManager = require('./ProcessManager.js')




class Jarvis {


    constructor() {

        this.jarvis_id = "Jarvis 2024";
        this.processes = {};
        this.pids = [];
        this.Home_Directory = './'
        this.Logs_Directory = 'logs'
        this.processManager = new ProcessManager(this);
    }

}

module.exports = Jarvis;

