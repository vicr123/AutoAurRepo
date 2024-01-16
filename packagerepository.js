const fs = require('fs').promises;
const child = require("child_process");
const passwd = require("./passwd");
const util = require("util");

const exec = util.promisify(child.execFile);

class PackageRepository {
    name;
    path;

    constructor(name, path) {
        this.name = name;
        this.path = path;
    }

    async exists() {
        try {
            return await (await fs.stat(`${this.path}`)).isDirectory();
        } catch {
            return false;
        }
    }

    async init() {
        const autoauruser = await passwd.getpwnam("autoaur");

        await fs.mkdir(this.path, {
            recursive: true
        });
        await fs.chown(this.path, autoauruser.uid, autoauruser.gid);

        await exec("repo-add", [`${this.name}.db.tar.xz`], {
            cwd: this.path,
            uid: autoauruser.uid,
            gid: autoauruser.gid
        });
    }

    async addPackageFile(file) {
        const autoauruser = await passwd.getpwnam("autoaur");

        await fs.copyFile(file.path, `${this.path}/${file.name}`);
        await exec("repo-add", [`${this.name}.db.tar.xz`, file.name], {
            cwd: this.path,
            uid: autoauruser.uid,
            gid: autoauruser.gid
        });
    }
}

module.exports = PackageRepository;