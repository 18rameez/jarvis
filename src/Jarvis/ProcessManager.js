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


    if(isProcessAlreadyExist){
      fn(null, "Process Already Exist")
      return
    }

    const fileName = path.basename(data.fileName);

    this.childProcess = spawn(command, args, {
      detached: true,
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

  handleSpawn = (fn) => {
    if (fn !== undefined) {
      fn(null, "process started");
      console.log("Child process has started successfully.");

      const pid = String(this.childProcess.pid);
      fs.appendFileSync("./logs/pid.txt", pid + "\n");
    }

    // console.log('child process list', this.jarvis.processes)
    // getProcessUsage(pid);
  };

  ensureLogsDirectory() {
    const logsDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
  }

  handleData = (data, type, pid, fileName) => {
    const formattedFileName = fileName.split(".")[0];

    const filePath = path.join(
      __dirname,
      `${this.jarvis.Home_Directory}${this.jarvis.Logs_Directory}/${formattedFileName}-${type}.logs`
    );
    fs.appendFile(filePath, data + "\n", (err) => {
      if (err) {
        console.error(`Error appending data to file ${filePath}:`, err);
      } else {
        console.log(`${type}: ${data}`);
      }
    });
  };

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

    if(!processDetails){
      return
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

  handleChildProcessEvents = (pid, fileName, fn = undefined) => {
    this.childProcess.on("spawn", () => this.handleSpawn(fn));
    this.childProcess.on("close", () => this.handleClose(pid));
    this.childProcess.stderr.on("data", (data) =>
      this.handleData(data, "err", pid, fileName)
    );
    this.childProcess.stdout.on("data", (data) =>
      this.handleData(data, "out", pid, fileName)
    );
    this.childProcess.on("exit", () => this.handleExit(pid));
    this.childProcess.on("error", () => this.handleError(pid));
  };

  handleError = (pid) => {
    console.log("handleError", pid);
  };

  handleClose = (pid) => {
    console.log("handleClose", pid);
  };

  getList = (data, fn) => {
    console.log(this?.jarvis?.processes);
    const processData = this?.jarvis?.processes || null;
    fn(null, processData);
  };


  kill = (data, fn) => {

    console.log(data)
    const killProcess = this.jarvis.processes[data.pid]
    console.log('kill:', killProcess)

    if(killProcess && killProcess.instance){
      killProcess.instance.kill()
       delete this.jarvis.processes[data.pid]
    }

    fn(null, `PID:${data.pid} has been killed`)
  }
}

module.exports = ProcessManager;
