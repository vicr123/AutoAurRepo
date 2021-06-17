const fs = require('fs').promises;
const child = require("child_process");
const util = require("util");

const exec = util.promisify(child.execFile);

class Chroot {
    chrootPath;

    constructor(chrootPath) {
        this.chrootPath = chrootPath;
    }

    async chrootExists() {
        try {
            return await (await fs.stat(this.chrootPath)).isDirectory();
        } catch {
            return false;
        }
    }

    async removeChroot() {
        await fs.rm(this.chrootPath, {
            recursive: true
        });
    }

    async initialiseChroot() {
        await fs.mkdir(this.chrootPath, {
            recursive: true
        });

        await exec("mkarchroot", [`${this.chrootPath}/root`, "base-devel"]);
    }

    async updatePacmanConfiguration(configurationFileContents) {
        await fs.writeFile(`${this.chrootPath}/root/etc/pacman.conf`, configurationFileContents);
    }

    async updateChroot() {
        await exec("arch-nspawn", [`${this.chrootPath}/root`, "pacman", "-Syu", "--noconfirm"]);
    }
}

module.exports = Chroot;