const fs = require("fs")


function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

module.exports = {
    ensureDirectoryExists
}