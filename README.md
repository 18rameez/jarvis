### How to use Jarvis

1. Execute the command `npm run build` to build the `jarvis_exec` file.
2. Run the `jarvis_exec` file using the following commands:
   - To start a process:
     ```
     ./bin/jarvis  start <program-file-path>
     ```
   - To stop Jarvis and all currently running processes:
     ```
     ./bin/jarvis  stop
     ```
   - To kill a process using its process ID:
     ```
     ./bin/jarvis  stop <pid>
     ```
   - To list all running processes:
     ```
     ./bin/jarvis  list
     ```
