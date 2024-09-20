const fs = require("fs");
const readline = require("readline");
const Tail = require("tail").Tail;
const readLastLines = require('read-last-lines');


class LogManager {
  constructor(jarvisClient) {
    this.jarvisClient = jarvisClient;
  }

  getProcessLogs(id, cmd) {
    const lines = 20;

    if (id) {
      let processId, processName;

      if (!isNaN(parseInt(id))) {
        processId = parseInt(id);
      } else {
        processName = id; // If `id` is not a number, treat it as a process name
      }

      const data = { id, processName };

      this.jarvisClient.call("getProcessLog", data, async (err, res) => {
        if (err || !res?.output_file) {
          console.error("Error while fetching logs:");
          process.exit(1);
        }
  
        console.log(`Log file path: ${res?.output_file}`);
  
        try {
          // Read the last 20 lines using read-last-lines
          const lastLines = await readLastLines.read(res.output_file, lines);
          console.log(`Last ${lines} lines:`);
          console.log(lastLines);
  
          // Start tailing the log file for new entries
          this.startLogTailing(res.output_file);
        } catch (readErr) {
          console.error("Error reading log file:", readErr);
          process.exit(1);
        }
      });

    } else {
      const data = {};

      this.jarvisClient.call("getAllProcessesLogs", data, (err, res) => {
        if (err) {
          console.error("Error while fetching logs:", err);
          process.exit(1);
        }
        console.log(res);
        process.exit();
      });
    }
  }

  startLogTailing(filePath) {
    const tail = new Tail(filePath);
  
    // When a new line is added to the log file, print it
    tail.on("line", (newLogLine) => {
      console.log(newLogLine);
    });
  
    tail.on("error", (error) => {
      console.error("Error while tailing the log file:", error);
    });
  }


  readLastLines(filePath, numLines, callback) {
    fs.stat(filePath, (err, stats) => {
      if (err) return callback(err);
  
      const fileSize = stats.size;
      const chunkSize = 1024; // Read in chunks of 1KB
      let buffer = Buffer.alloc(chunkSize);
      let lines = [];
      let bytesRead = 0;
      let position = fileSize;
  
      function readChunk() {
        position -= chunkSize;
        if (position < 0) position = 0;
  
        const length = position === 0 ? fileSize % chunkSize : chunkSize;
        fs.read(fs.openSync(filePath, 'r'), buffer, 0, length, position, (err, bytes) => {
          if (err) return callback(err);
  
          bytesRead += bytes;
          const chunk = buffer.slice(0, bytes).toString('utf8');
          lines = chunk.split('\n').concat(lines);
  
          if (lines.length >= numLines + 1 || position === 0) {
            return callback(null, lines.slice(-numLines).join('\n'));
          }
  
          if (position > 0) {
            readChunk();
          }
        });
      }
  
      readChunk();
    });
  }
}

module.exports = LogManager;
