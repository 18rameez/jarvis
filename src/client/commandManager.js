const { Command } = require('commander');
const path = require('path');
const { displayProcessList } = require('../utils/terminalUtils');
const { client, ensureDaemonIsRunning } = require('./rpcClient');
const JarvisHandler = require('../Jarvis/JarvisHandler');

const program = new Command();

// Wrapper to ensure the daemon is running before executing a command
function withDaemonCheck(action) {
    return function (...args) {
        ensureDaemonIsRunning(JarvisHandler.launchDaemon, () => {
            action(...args);
        });
    };
}

program
    .command('start <fileName>')
    .description('Prepare a process')
    .action(withDaemonCheck((fileName) => {
        const filePath = path.resolve(fileName);
        const data = { fileName: filePath };
        client.call('prepare', data, function (err, res) {
            console.log(res);
            process.exit();
        });
    }));

program
    .command('monitor')
    .description('Monitor a process')
    .action(() => {
        client.call('monitor', null, function (err, res) {
            console.log(res);
        });
    });

program
    .command('list')
    .description('Get list of running processes')
    .action(withDaemonCheck(() => {
        client.call('list', null, function (err, res) {
            displayProcessList(res);
            process.exit();
        });
    }));

program
    .command('stop')
    .description('Stop jarvis daemon')
    .action(() => {
        console.log('stop daemon');
        client.call('stop', null, function (err, res) {
            console.log(res);
            process.exit();
        });
    });

program
    .command('ping')
    .description('Ping jarvis daemon')
    .action(() => {
        console.log('ping exec');
        client.call('ping', null, function (err, res) {
            console.log(res);
        });
    });

program
    .command('kill <pid>')
    .description('Kill a process')
    .action((pid) => {
        console.log(pid);
        const data = { pid };
        client.call('kill', data, function (err, res) {
            console.log(res);
            client.call('list', null, function (err, res) {
                displayProcessList(res);
                process.exit();
            });
        });
    });

module.exports = { program };
