const { spawn } = require("child_process");

const path = require("path");
const fs = require("fs");
const getProcessUsage = require("../utils/getProcessUsage");
const {ensureFileAndDirExistence} = require("../utils/fileUtils")
const os = require("os"); 
const cluster = require('cluster');

class ProcessManager {
  constructor(jarvis) {
    this.jarvis = jarvis;
    this.childProcess = null;
    //this.createProcess = this.createProcess.bind(this);
    this.processCounter = 0
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

    const out = path.join(this.jarvis.Home_Directory,this.jarvis.Logs_Directory,`${formattedFileName}-${"out"}.logs`);
    const err = path.join(this.jarvis.Home_Directory, this.jarvis.Logs_Directory, `${formattedFileName}-${"err"}.logs`);


    ensureFileAndDirExistence(out)
    ensureFileAndDirExistence(err)

    const outFd = fs.openSync(out, "a");
    const errFd = fs.openSync(err, "a");

    this.childProcess = spawn(command, args, {
      detached: true,
      stdio: ["ipc", outFd, errFd],
    });

    const pid = this.childProcess.pid;
    const id = this.processCounter++;

    this.jarvis.processes[pid] = {
      id: id,
      pid: pid,
      fileName: fileName,
      instance: this.childProcess,
      absolutePath: data.fileName,
      status: "running",
      startTime: new Date(),
      output_file: out,
      err_file: err,
      cluster: false,
      instances: 1
    };

    this.handleChildProcessEvents(pid, fileName, fn);

    // console.log("createProcess", pid, fileName, this.jarvis.processes);
  };

  // processExistCheck(pathToCheck) {
  //   return Object.values(this.jarvis.processes).some(
  //     (entry) => entry.absolutePath === pathToCheck
  //   );
  // }

  // Todo - might be causing issue in cluster check
  processExistCheck(pathToCheck) {
    return Object.values(this.jarvis.processes).some(
      (entry) => entry.absolutePath === pathToCheck && entry.cluster
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
    fn(null, "Monitoring started");
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
    const processDetails = this.jarvis.processes[pid];
    const childProcess = processDetails.instance;
  
    childProcess.on('spawn', () => {
      console.log(`Process started. PID: ${pid}`);
      if (fn) fn(null, 'Process has been started');
  
      // Store PID
      const filePath = path.join(
        this.jarvis.Home_Directory,
        this.jarvis.pids_directory,
        'pids.txt'
      );
      ensureFileAndDirExistence(filePath);
      fs.appendFileSync(filePath, `${pid}\n`);
    });
  
    childProcess.on('close', (code, signal) => {
      console.log(`Process closed. PID: ${pid}, Code: ${code}, Signal: ${signal}`);
      processDetails.status = 'stopped';
    });
  
    childProcess.on('exit', (code, signal) => {
      console.log(`Process exited. PID: ${pid}, Code: ${code}, Signal: ${signal}`);
      processDetails.status = 'stopped';
    });
  
    childProcess.on('error', (err) => {
      console.log(`Process error. PID: ${pid}, Error: ${err}`);
      processDetails.status = 'error';
    });
  }
  
  

  getProcessLog = (data, fn) => {
     let id = data?.id;
     if(id){
      id = parseInt(id)
      const processData = this.findProcessById(id)
      fn(null, processData)
     } 
  }

  findProcessById(id) {
    // Get all process objects in an array and find the one with the matching id
    const process = Object.values(this.jarvis.processes).find((process) => process.id === id);
  
    if (process) {
      console.log("Process found:", process);
      return process;
    } else {
      console.log("No process found with the given id:", id);
      return null;
    }
  }
  

  getList = (data, fn) => {
    const processData = this?.jarvis?.processes || null;
    fn(null, processData);
  };

  ping = (data, fn) => {
    fn(null, true);
  };

  kill = (data, fn) => {
    const killProcess = this.jarvis.processes[data.pid];
    console.log("kill:", killProcess);

    if (killProcess && killProcess.instance) {
      killProcess.instance.kill();
      delete this.jarvis.processes[data.pid];
    }

    fn(null, `PID: ${data.pid} has been killed`);
  };


  createClusterProcess = (data, fn) => {

    const numCPUs = data.instances || require('os').cpus().length;
    const scriptPath = path.resolve(data.fileName);

    let isProcessAlreadyExist = this.processExistCheck(scriptPath);

    if (isProcessAlreadyExist) {
      fn(null, 'Process Already Exists');
      return;
    }

    const fileName = path.basename(data.fileName);
    const formattedFileName = path.basename(data.fileName, path.extname(data.fileName));

    const out = path.join(
      this.jarvis.Home_Directory,
      this.jarvis.Logs_Directory,
      `${formattedFileName}-cluster-out.logs`
    );
    const err = path.join(
      this.jarvis.Home_Directory,
      this.jarvis.Logs_Directory,
      `${formattedFileName}-cluster-err.logs`
    );

    ensureFileAndDirExistence(out);
    ensureFileAndDirExistence(err);

    const outFd = fs.openSync(out, 'a');
    const errFd = fs.openSync(err, 'a');

    // Path to the cluster master script
    const clusterMasterScript = path.join(__dirname, './cluster/clusterMaster.js');

    const env = {
      ...process.env,
      SCRIPT_PATH: scriptPath,
      INSTANCES: numCPUs,
    };

    const childProcess = spawn('node', [clusterMasterScript], {
      detached: true,
      stdio: ['ignore', outFd, errFd],
      env: env,
    });

    const pid = childProcess.pid;
    const id = this.processCounter++;

    this.jarvis.processes[pid] = {
      id: id,
      pid: pid,
      fileName: formattedFileName,
      instance: childProcess,
      absolutePath: scriptPath,
      status: 'running',
      startTime: new Date(),
      cluster: true,
      instances: numCPUs,
      output_file: out,
      err_file: err
    };

    childProcess.unref();

    this.handleChildProcessEvents(pid, data.fileName, fn);

    if (fn) fn(null, `Cluster of ${numCPUs} processes has been started`);
  };

  get_process_info = (data, fn) => {
    let id = data?.id;
    if(id){
     id = parseInt(id)
     const processData = this.findProcessById(id)
     delete processData.instance
     fn(null, processData)
    } 
  }

}

module.exports = ProcessManager;
