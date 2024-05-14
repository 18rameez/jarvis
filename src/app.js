const axon = require('pm2-axon');
const req = axon.socket('req');
const rpc = require('pm2-axon-rpc')
const path = require('path')
const app_config = require('./config/app_config.js')
const {Command} = require('commander');
const program = new Command();
const {displayProcessList} = require('./utils/terminalUtils.js')
const fs = require('fs')
const {ensureDirectoryExists} = require("./utils/fileUtils.js")


const client = new rpc.Client(req)
const { port } = app_config
req.connect(port);


// client.sock.once('reconnect attempt', function() {
//     client.sock.close();
//     console.log('Daemon not launched');
//     lanuchDaemon(() => {});
//     process.nextTick(function() {
//         console.log("here")
//     });
// });


function ensureDaemonIsRunning(callback) {
    lanuchDaemon(() => {});
    client.call('ping', null, function(err, isRunning) {
        if (err || !isRunning) {
            console.log('Daemon not launched. Starting daemon...');
            lanuchDaemon(() => {
                console.log('Daemon started. Retrying command...');
                callback();
            });
        } else {
            callback();
        }
    });
}



// client.methods(function(err, methods){
//     console.log(methods)
// })


program.command('start <fileName>')
    .description('prepare a process')
    .action((fileName) => {

        // console.log(fileName)
        // const filePath = path.resolve(fileName)
        // const data = {
        //     fileName: filePath
        // }
        
        // client.call('prepare', data, function(err, res) {
        //     console.log(res)
        //     process.exit()
        // })

        ensureDaemonIsRunning(() => {
            const filePath = path.resolve(fileName);
            const data = { fileName: filePath };
            client.call('prepare', data, function(err, res) {
                console.log(res);
                process.exit();
            });
        });
        
    })

program.command('monitor')
        .description('monitor a process')
        .action(() => {
            client.call('monitor', null, function(err, res) {
                console.log(res)
            })
        })


program.command('list')
        .description('get list of running processes')
        .action(() => {
            console.log('get list')
            client.call('list', null, function(err, res) {
                displayProcessList(res)
                process.exit()
            })
        })

program.command('stop')
        .description('stop jarvis daemon')
        .action(() => {
            console.log('stop daemon')
            client.call('stop', null, function(err, res) {
                console.log(res)
                process.exit()
            })
        })

program.command('ping')
        .description('stop jarvis daemon')
        .action(() => {
            console.log('ping exec')
            client.call('ping', null, function(err, res) {
                console.log(res)
            })
        })

program.command('kill <pid>')
        .description('kill a process')
        .action((pid) => {
            console.log(pid)
            const data = {
                pid
            }
            
            client.call('kill', data, function(err, res) {
                console.log(res)
                client.call('list', null, function(err, res) {
                    displayProcessList(res)
                    process.exit()
                })
            })
            
        })

program.parse()





function lanuchDaemon(callback){

    const logDirectory = path.join(__dirname, 'Jarvis', 'logs');
    ensureDirectoryExists(logDirectory); 


    const node_args = ["./daemon.js"]

    const outPath = path.join(logDirectory, 'daemon-out-log.txt');
    const errPath = path.join(logDirectory, 'daemon-err-log.txt');

    const out = fs.openSync(outPath, 'a');
    const err = fs.openSync(errPath, 'a');


    var child = require('child_process').spawn('node', node_args, {
        detached   : true,
        cwd        :  __dirname,
        windowsHide: true,
        // env        : Object.assign({
        //   'SILENT'    : that.conf.DEBUG ? !that.conf.DEBUG : true,
        //   'PM2_HOME'  : that.pm2_home
        // }, process.env),
        stdio      : ['ipc', out, err]
      });

    child.on('close', (code) => {
        if (code === 0) {
            callback(); // Execute the callback only if the daemon starts successfully
        } else {
            console.error('Failed to start daemon');
        }
    });
}