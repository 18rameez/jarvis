const axon = require("pm2-axon");
const rep = axon.socket("rep");
const rpc = require("pm2-axon-rpc");
const app_config = require("./config/app_config.js");

const Jarvis = require("./Jarvis/Jarvis.js");

const jarvis = new Jarvis();

const { port } = app_config;

const server = new rpc.Server(rep);
const bindRes = rep.bind(port);

bindRes.once("bind", function () {
  console.log("push server started");
});

server.expose({
  prepare: jarvis.processManager.createProcess,
  monitor: jarvis.processManager.monitor,
  list: jarvis.processManager.getList,
  kill: jarvis.processManager.kill
});

function killChildProcess() {
  for (const [key, value] of Object.entries(jarvis.processes)) {
    if (value.instance) {
      console.log("Killing child process");
      value.instance.kill();
    }
  }
}

process.on("exit", () => {
  console.log('exit')
  killChildProcess();
});

process.on("SIGINT", () => {
  console.log('SIGINT')
  killChildProcess();
  process.exit();
});

process.on("SIGTERM", () => {
  console.log('SIGTERM')
  killChildProcess();
  process.exit();
});

// process.on("uncaughtException", (err) => {
//   console.error("An uncaught error occurred!");
//   //  console.error(err.stack);
//   killChildProcess();
//   process.exit(1);
// });
