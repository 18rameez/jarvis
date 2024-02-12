
const pidusage = require("pidusage");


function getProcessUsage(pid) {

    setInterval(() => {
        pidusage(pid, (err, stats) => {
            if (err) {
                console.error(`Error getting process usage: ${err.message}`);
            } else {
                console.log(
                    `Memory usage of the spawned process: ${
                        stats.memory / (1024 * 1024)
                    } MB`
                );
            }
        });
    }, 3000);
}


module.exports = getProcessUsage;