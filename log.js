class Log {
    static info(message) {
        console.log(` i  [${(new Date()).toLocaleTimeString()}] ${message}`);
    }

    static error(message) {
        console.log(`!!! [${(new Date()).toLocaleTimeString()}] ${message}`);
    }
}

module.exports = Log;