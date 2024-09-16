const path = require('path')
const { displayProcessList } = require('../../utils/terminalUtils');



class ProcessManager {
  constructor(jarvisClient) {
    this.jarvisClient = jarvisClient;
  }

  startProcess(fileName) {
    const filePath = path.resolve(fileName);
    const data = { fileName: filePath };
    this.jarvisClient.call("prepare", data, (err, res) => {
      if (err) {
        console.error("Error preparing process:", err);
        process.exit(1);
      }
      console.log(res);
      process.exit();
    });
  }

  listProcess() {
    this.jarvisClient.call("list", null, (err, res) => {
      if (err) {
        console.error("Error listing processes:", err);
        process.exit(1);
      }
      displayProcessList(res);
      process.exit();
    });
  }


  stopDaemon(){
    console.log('stop daemon');
    this.jarvisClient.call('stop', null, (err, res) => {
      if (err) {
        console.error('Error stopping daemon:', err);
        process.exit(1);
      }
      console.log(res);
      process.exit();
    });
  }
}

module.exports = ProcessManager