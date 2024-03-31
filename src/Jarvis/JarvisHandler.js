





class JarvisHandler {


    constructor(jarvisInstance){
       this.jarvis = jarvisInstance
    }

    stop(data, fn){
        console.log("stop executed")
        fn(null, "daemon stopped");
        process.exit(1)
    }
}

module.exports = JarvisHandler;
