### How to use Jarvis

1. Execute the command `npm run build` to build the `jarvis_exec` file.
2. Run the `jarvis_exec` file using the following commands:
   - To start a process:
     ```
     ./jarvis_exec start <program-file-path>
     ```
   - To stop Jarvis and all currently running processes:
     ```
     ./jarvis_exec stop
     ```
   - To kill a process using its process ID:
     ```
     ./jarvis_exec stop <pid>
     ```
   - To list all running processes:
     ```
     ./jarvis_exec list
     ```
