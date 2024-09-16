const { Command } = require('commander');
const path = require('path');
const { displayProcessList } = require('../utils/terminalUtils');
const JarvisClient = require('./Client');
const JarvisHandler = require('../Jarvis/JarvisHandler');

class CLIManager {

  constructor(client) {
    this.program = new Command();
    this.jarvisClient = client
    this.setupCommands();
  }

  // Wrapper to ensure the daemon is running before executing a command
  withDaemonCheck(action) {
    return (...args) => {
      this.jarvisClient.ensureDaemonIsRunning(JarvisHandler.launchDaemon, () => {
        action(...args);
      });
    };
  }

  // Set up CLI commands
  setupCommands() {
    
    this.program
      .command('start <fileName>')
      .description('Prepare a process')
      .action(
        this.withDaemonCheck((fileName) => {
            this.jarvisClient.processManager.startProcess(fileName);
        })
      );

    this.program
      .command('monitor')
      .description('Monitor a process')
      .action(() => {
        this.jarvisClient.call('monitor', null, (err, res) => {
          if (err) {
            console.error('Error monitoring process:', err);
            process.exit(1);
          }
          console.log(res);
        });
      });

    this.program
      .command('list')
      .description('Get list of running processes')
      .action(
        this.withDaemonCheck(() => {
          this.jarvisClient.processManager.listProcess();
        })
      );

    this.program
      .command('stop')
      .description('Stop jarvis daemon')
      .action(() => {
        this.jarvisClient.processManager.stopDaemon()
      });

    this.program
      .command('ping')
      .description('Ping jarvis daemon')
      .action(() => {
        console.log('ping exec');
        this.jarvisClient.call('ping', null, (err, res) => {
          if (err) {
            console.error('Error pinging daemon:', err);
            process.exit(1);
          }
          console.log(res);
        });
      });

    this.program
      .command('kill <pid>')
      .description('Kill a process')
      .action((pid) => {
        console.log(`Killing process with PID: ${pid}`);
        const data = { pid };
        this.jarvisClient.call('kill', data, (err, res) => {
          if (err) {
            console.error('Error killing process:', err);
            process.exit(1);
          }
          console.log(res);
          this.jarvisClient.call('list', null, (err, res) => {
            if (err) {
              console.error('Error listing processes after kill:', err);
              process.exit(1);
            }
            displayProcessList(res);
            process.exit();
          });
        });
      });

    this.program
        .command('logs [id|name]')
        .option('--lines <n>', 'output the last N lines, instead of the last 15 by default')
        .option('--out', 'only shows standard output')
        .option('--err', 'only shows error output')
        .action(this.withDaemonCheck((id,cmd) => {
          this.jarvisClient.logManager.getProcessLogs(id, cmd);
        }))

  }

  run() {
    this.program.parse(process.argv);
  }
}

module.exports =  CLIManager
