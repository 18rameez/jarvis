






class LogManager {

    constructor(jarvisClient){
       this.jarvisClient = jarvisClient
    }


    getProcessLogs(id,cmd){
        
        const lines = 20

        if (id) {
          let processId, processName;

          if (!isNaN(parseInt(id))) {
            processId = parseInt(id);
          } else {
            processName = id; // If `id` is not a number, treat it as a process name
          }

          const data = { id, processName};

          this.jarvisClient.call("getProcessLog", data, (err, res) => {
            if (err) {
              console.error("Error while fetching logs:", err);
              process.exit(1);
            }
            console.log(res?.absolutePath);
            process.exit();
          });

        } else {

          const data = {};

          this.jarvisClient.call("getAllProcessesLogs", data, (err, res) => {
            if (err) {
              console.error("Error while fetching logs:", err);
              process.exit(1);
            }
            console.log(res);
            process.exit();
          });
        }
    }
}

module.exports = LogManager