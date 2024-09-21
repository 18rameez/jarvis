const cluster = require('cluster');
const os = require('os');
const path = require('path');

if (cluster.isMaster) {
  const numCPUs = process.env.INSTANCES || os.cpus().length;
  const scriptPath = process.env.SCRIPT_PATH;

  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const workerEnv = { ...process.env, WORKER_ID: i };
    const worker = cluster.fork(workerEnv);

    worker.on('exit', (code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      // Optionally restart the worker
      const newWorker = cluster.fork(workerEnv);
      console.log(`Worker ${newWorker.process.pid} restarted`);
    });
  }

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited with code ${code} and signal ${signal}`);
  });
} else {
  // Worker process: require the application script
  const scriptPath = process.env.SCRIPT_PATH;
  if (!scriptPath) {
    console.error('SCRIPT_PATH environment variable is not set.');
    process.exit(1);
  }
  require(scriptPath);
}
