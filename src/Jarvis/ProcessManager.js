const { spawn } = require("child_process");

const path = require("path");
const fs = require("fs");
const getProcessUsage = require("../utils/getProcessUsage");

class ProcessManager {
  constructor(jarvis) {
    console.log("ProcessManager constructor");
    this.jarvis = jarvis;
    this.childProcess = null;
    //this.createProcess = this.createProcess.bind(this);
  }

  createProcess = (data, fn) => {
    const command = "node";
    const args = [data.fileName];

    let isProcessAlreadyExist = this.processExistCheck(data.fileName);

    if (isProcessAlreadyExist) {
      fn(null, "Process Already Exist");
      return;
    }

    const fileName = path.basename(data.fileName);
    const formattedFileName = fileName.split(".")[0];

    const out = path.join(
      __dirname,
      `${this.jarvis.Home_Directory}${
        this.jarvis.Logs_Directory
      }/${formattedFileName}-${"out"}.logs`
    );

    const err = path.join(
      __dirname,
      `${this.jarvis.Home_Directory}${
        this.jarvis.Logs_Directory
      }/${formattedFileName}-${"err"}.logs`
    );

    const outFd = fs.openSync(out, "a");
    const errFd = fs.openSync(err, "a");

    this.childProcess = spawn(command, args, {
      detached: true,
      stdio: ["ipc", outFd, errFd],
    });

    const pid = this.childProcess.pid;
    this.jarvis.processes[pid] = {
      pid: pid,
      fileName: fileName,
      instance: this.childProcess,
      absolutePath: data.fileName,
      status: "running",
      startTime: new Date(),
    };

    this.handleChildProcessEvents(pid, fileName, fn);

    console.log("createProcess", pid, fileName, this.jarvis.processes);
  };

  processExistCheck(pathToCheck) {
    return Object.values(this.jarvis.processes).some(
      (entry) => entry.absolutePath === pathToCheck
    );
  }


  ensureLogsDirectory() {
    const logsDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
  }



  monitor(data, fn) {
    const file = fs.readFileSync("./logs/pid.txt", "utf8");
    const pids = file.split("\n");
    console.log(pids);
    fn(null, "monitor started");
  }

  handleExit(pid) {
    console.log("handleExit", pid);
    console.log("process restarting...", pid);
    this.restartProcess(pid);
  }

  restartProcess = (pid) => {
    const processDetails = this.jarvis.processes[pid];

    if (!processDetails) {
      return;
    }

    // check startTime lapsed atlat 5 seconds
    if (!(processDetails.startTime < new Date() - 3000)) {
      console.log("process started less than 5 seconds ago");
      delete this.jarvis.processes[pid];
      return;
    }

    const absolutePath = processDetails.absolutePath;
    const fileName = processDetails.fileName;

    const childProcess = spawn("node", [absolutePath], {
      detached: true,
    });

    this.childProcess = childProcess;

    const newPid = childProcess.pid;
    this.jarvis.processes[newPid] = {
      pid: newPid,
      fileName: fileName,
      instance: childProcess,
      absolutePath: absolutePath,
      status: "running",
      startTime: new Date(),
    };

    this.handleChildProcessEvents(newPid, fileName);

    delete this.jarvis.processes[pid];
    console.log("process restarted", this.jarvis.processes);
  };


  handleChildProcessEvents(pid, fileName, fn = undefined) {
   
    this.childProcess.on('spawn', () => {
      if (fn) {
        fn(null, 'process started');
        console.log('Child process has started successfully.');
        //To store all processes ids
        fs.appendFileSync('./logs/pid.txt', `${this.childProcess.pid}\n`);
      }
    });
  
    
    this.childProcess.on('close', () => {
      console.log('handleClose', pid);
    });
  
  
    this.childProcess.on('exit', () => {
      console.log('handleExit', pid);
    });
  
  
    this.childProcess.on('error', () => {
      console.log('handleError', pid);
    });
  }
  



  getList = (data, fn) => {
    console.log(this?.jarvis?.processes);
    const processData = this?.jarvis?.processes || null;
    fn(null, processData);
  };

  kill = (data, fn) => {
    console.log(data);
    const killProcess = this.jarvis.processes[data.pid];
    console.log("kill:", killProcess);

    if (killProcess && killProcess.instance) {
      killProcess.instance.kill();
      delete this.jarvis.processes[data.pid];
    }

    fn(null, `PID:${data.pid} has been killed`);
  };
}

module.exports = ProcessManager;
