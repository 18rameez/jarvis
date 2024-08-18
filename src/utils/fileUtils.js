const fs = require("fs")
const path = require('path')

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}


function ensureFileAndDirExistence(filePath) {

    filePath = path.resolve(filePath);

    console.log("here:", filePath);

    // Check if directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory does not exist, creating: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true }); // Create the directory if it doesn't exist
    }
  
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File does not exist, creating: ${filePath}`);
      fs.writeFileSync(filePath, ''); // Create the file if it doesn't exist
      return false;
    } else {
      console.log(`File exists: ${filePath}`);
      return true;
    }
  }

module.exports = {
    ensureDirectoryExists,
    ensureFileAndDirExistence
}