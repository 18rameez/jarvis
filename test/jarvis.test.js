const { exec } = require('child_process');

describe('Jarvis CLI Commands', () => {
  jest.setTimeout(5000); 

  it('should start a process successfully', (done) => {
    exec('./bin/jarvis start ./test_program/program1.js', (err, stdout, stderr) => {
      console.log(stdout);
      expect(err).toBeNull();
      expect(stderr).toBe('');
      expect(stdout).toMatch(/process has been started/i);
      done();
    });
  });

  it('should list all running processes', (done) => {
    exec('./bin/jarvis list', (err, stdout, stderr) => {
      expect(err).toBeNull();
      expect(stderr).toBe('');
      expect(stdout).toMatch(/running/i);
      done();
    });
  });

  it('should stop Jarvis daemon and all processes', (done) => {
    exec('./bin/jarvis stop', (err, stdout, stderr) => {
      expect(err).toBeNull();
      expect(stderr).toBe('');
      expect(stdout).toMatch(/Daemon server has been stopped/i);
      done();
    });
  });
  

  it('should return an error for an invalid command', (done) => {
    exec('./bin/jarvis invalidCommand', (err, stdout, stderr) => {
      expect(err).not.toBeNull();
      expect(stderr).toMatch(/error: unknown command/i);
      done();
    });
  });
});
