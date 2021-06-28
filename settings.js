const fs = require('fs');
const os = require('os');

class Settings {
    settingsData;

    constructor() {
        let filename = "config.json";
        if (fs.existsSync("/etc/autoaurrepo.json")) filename = "/etc/autoaurrepo.json";

        if (!fs.existsSync(this.settingsPath())) fs.mkdirSync(this.settingsPath(), {
            recursive: true
        });

        this.settingsData = JSON.parse(fs.readFileSync(this.settingsPath(), {
            encoding: "utf-8"
        }));
    }

    get(key, defaultValue) {
        if (this.settingsData[key]) return this.settingsData[key];
        return defaultValue;
    }

    set(key, value) {
        this.settingsData[key] = value;
        fs.writeFileSync(this.settingsPath(), JSON.stringify(this.settingsData));
    }

    settingsPath() {
        return `${os.homedir()}/.config/autoaurrepo`;
    }
}

module.exports = new Settings();