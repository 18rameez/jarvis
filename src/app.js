const CLIManager = require('./client/commandManager')
const JarvisClient = require('./client/Client');

const jarvisClient = new JarvisClient();
const cliManager = new CLIManager(jarvisClient);

cliManager.run();
