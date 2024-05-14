





class JarvisHandler {


    constructor(jarvisInstance){
       this.jarvis = jarvisInstance
    }

    stop(data, fn){
        console.log("Daemon server has been stopped")
        fn(null, "Daemon server has been stopped");
        process.exit(1)
    }
}

module.exports = JarvisHandler;
