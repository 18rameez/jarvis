const Table = require('cli-table3');
const chalk = require('chalk');


exports.displayProcessList = (data) => {
    // Check if the data object is empty
    if (Object.keys(data).length === 0) {
        console.log(chalk.yellow.bold('⚠️  No process running  ⚠️'));
        return;
    }

    const table = new Table({
        head: [chalk.green('PID'), chalk.blue('Process Name'), chalk.yellow('uptime'), chalk.cyan('status')],
        colWidths: [10, 20, 40, 20] // Adjust column widths as needed
    });

    Object.entries(data).forEach(([key, value]) => {
        table.push([
            value.pid,
            value.fileName,
            calculateUptime(value.startTime),
            value.status,
        ]);
    });

    console.log(table.toString());
};



function calculateUptime(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now - start;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const hrs = hours % 24;
    const mins = minutes % 60;
    const secs = seconds % 60;

    return `${days}d ${hrs}h ${mins}m ${secs}s`;
}
