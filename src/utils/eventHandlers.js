const fs = require("fs");

const handleClose = (code) => {
    console.log(`Child process exited with code ${code}`);
  };
  
  const handleData = (data, type, pid) => {
    fs.appendFileSync(`./logs/${pid}-${type}-logs.txt`, data + "\n");
    console.log(`${type}: ${data}`);
  };
  
  const handleExit = (code, signal) => {
    console.log(`Child process exited with code ${code} and signal ${signal}`);
  };
  
  const handleError = (err) => {
    console.error(`stderr: ${err}`);
  };

module.exports = {
  handleClose,
  handleData,
  handleExit,
  handleError
};