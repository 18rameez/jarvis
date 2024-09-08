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
          const filePath = path.resolve(fileName);
          const data = { fileName: filePath };
          this.jarvisClient.client.call('prepare', data, (err, res) => {
            if (err) {
              console.error('Error preparing process:', err);
              process.exit(1);
            }
            console.log(res);
            process.exit();
          });
        })
      );

    this.program
      .command('monitor')
      .description('Monitor a process')
      .action(() => {
        this.jarvisClient.client.call('monitor', null, (err, res) => {
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
          this.jarvisClient.client.call('list', null, (err, res) => {
            if (err) {
              console.error('Error listing processes:', err);
              process.exit(1);
            }
            displayProcessList(res);
            process.exit();
          });
        })
      );

    this.program
      .command('stop')
      .description('Stop jarvis daemon')
      .action(() => {
        console.log('stop daemon');
        this.jarvisClient.client.call('stop', null, (err, res) => {
          if (err) {
            console.error('Error stopping daemon:', err);
            process.exit(1);
          }
          console.log(res);
          process.exit();
        });
      });

    this.program
      .command('ping')
      .description('Ping jarvis daemon')
      .action(() => {
        console.log('ping exec');
        this.jarvisClient.client.call('ping', null, (err, res) => {
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
        this.jarvisClient.client.call('kill', data, (err, res) => {
          if (err) {
            console.error('Error killing process:', err);
            process.exit(1);
          }
          console.log(res);
          this.jarvisClient.client.call('list', null, (err, res) => {
            if (err) {
              console.error('Error listing processes after kill:', err);
              process.exit(1);
            }
            displayProcessList(res);
            process.exit();
          });
        });
      });
  }

  run() {
    this.program.parse(process.argv);
  }
}

module.exports =  CLIManager
