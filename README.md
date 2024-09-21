# Jarvis - a Process Management Tool

## Overview

Jarvis is a lightweight alternative to PM2, designed to manage Node.js applications with a simple CLI interface. It offers a straightforward solution for managing your Node.js processes efficiently. With Jarvis, managing your Node.js applications becomes more intuitive and less cumbersome, providing just the essential features you need.

## Features

- **Process Management**: Easily start, stop, and restart your Node.js applications.
- **Process Listing**: View all currently running processes with a single command.
- **Process Details**: Get in-depth information about any specific process, including its status and configuration.
- **Log Retrieval**: Quickly access logs for any managed process to troubleshoot or monitor performance.
- **Realtime Log Streaming**: Monitor logs in real-time for any running process, enabling instant insights and quick identification of issues.



## Installation

To make Jarvis available globally on your system, you can use npm to install it locally and then link it as a global module.

1. Clone the repository and navigate to the project directory:
    ```bash
    git clone git@github.com:18rameez/jarvis.git
    cd jarvis
    ```

2. Install the package globally using npm:
    ```bash
    npm install -g
    ```

3. Alternatively, you can link the package globally for development purposes:
    ```bash
    npm link
    ```

After running `npm link`, the `jarvis` command will be available globally on your system, allowing you to manage processes from any directory.

### How to use Jarvis

   - To start a process:
     ```
     jarvis  start <program-file-path>
     ```
   - To stop Jarvis and all currently running processes:
     ```
     jarvis  stop
     ```
   - To kill a process using its process ID:
     ```
     jarvis  stop <pid>
     ```
   - To list all running processes:
     ```
     jarvis  list
     ```
   - View realtime logs of a process:
     ```
     jarvis  logs <id>
     ```
