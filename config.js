const fs = require('fs');
const child = require("child_process");
const passwd = require("./passwd");

class Config {
    ready;
    configData;

    constructor() {
        this.ready = false;
    }

    async get() {
        if (!this.ready) {
            let filename = "config.json";
            if (fs.existsSync("/etc/autoaurrepo.json")) filename = "/etc/autoaurrepo.json";

            let autoauruser = await passwd.getpwnam("autoaur");

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

            this.ready = true;
        }

        return this.configData;
    }
}

module.exports = new Config();