const { ensureDirectoryExists } = require('../utils/fileUtils');
const path = require('path')
const fs = require('fs')
const app_config = require('../config/app_config')

class JarvisHandler {


    constructor(jarvisInstance){
       this.jarvis = jarvisInstance
    }

    stop(data, fn){
        console.log("Daemon server has been stopped")
        fn(null, "Daemon server has been stopped");
        process.exit(1)
    }

    static launchDaemon(callback) {

        const logDirectory = path.join(app_config.homeDirectory, 'jarvis-log');
        ensureDirectoryExists(logDirectory);

        // Daemon file path which is located in the jarvis folder
        const node_args = ["./daemon.js"];
        const outPath = path.join(logDirectory, 'daemon-out-log.txt');
        const errPath = path.join(logDirectory, 'daemon-err-log.txt');

        const out = fs.openSync(outPath, 'a');
        const err = fs.openSync(errPath, 'a');

        const child = require('child_process').spawn('node', node_args, {
            detached: true,
            cwd: __dirname,
            windowsHide: true,
            stdio: ['ipc', out, err]
        });

        child.on('close', (code) => {
            if (code === 0) {
                callback(); // Execute the callback only if the daemon starts successfully
            } else {
                console.error('Failed to start daemon');
            }
        });
    }
}

module.exports = JarvisHandler;
