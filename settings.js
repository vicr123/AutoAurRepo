const fs = require('fs');
const os = require('os');

class Settings {
    settingsData;

    constructor() {
        if (!fs.existsSync(this.settingsDir())) fs.mkdirSync(this.settingsDir(), {
            recursive: true
        });

        if (fs.existsSync(this.settingsPath())) {
            this.settingsData = JSON.parse(fs.readFileSync(this.settingsPath(), {
                encoding: "utf-8"
            }));
        } else {
            this.settingsData = {}
        }
    }

    get(key, defaultValue) {
        if (this.settingsData[key]) return this.settingsData[key];
        return defaultValue;
    }

    set(key, value) {
        this.settingsData[key] = value;
        fs.writeFileSync(this.settingsPath(), JSON.stringify(this.settingsData));
    }

    settingsDir() {
        return `${os.homedir}/.config/autoaurrepo`
    }

    settingsPath() {
        return `${this.settingsDir()}/settings.json`;
    }
}

module.exports = new Settings();