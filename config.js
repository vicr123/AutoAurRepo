const fs = require('fs');
const child = require("child_process");
const posix = require('posix');

class Config {
    configData;

    constructor() {
        let filename = "config.json";
        if (fs.existsSync("/etc/autoaurrepo.json")) filename = "/etc/autoaurrepo.json";

        let autoauruser = posix.getpwnam("autoaur");

        this.configData = JSON.parse(child.execFileSync("/usr/bin/envsubst", {
            input: fs.readFileSync(filename, {
                encoding: "utf-8"
            }),
            uid: autoauruser.uid,
            gid: autoauruser.gid,
            env: {
                ...process.env,
                "HOME": autoauruser.dir
            }
        }));
    }

    get() {
        return this.configData;
    }
}

module.exports = new Config();