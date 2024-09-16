






class LogManager {

    constructor(jarvisClient){
       this.jarvisClient = jarvisClient
    }


    getProcessLogs(id,cmd){
        console.log(id);
        console.log(cmd);
    }
}

module.exports = LogManager