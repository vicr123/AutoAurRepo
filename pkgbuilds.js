const fs = require('fs').promises;
const child = require("child_process");
const Git = require("./git");
const passwd = require("./passwd");
const util = require("util");

const exec = util.promisify(child.execFile);

class Package {
    git;
    path;

    constructor(path) {
    }

    static async forPath(path) {
        const pk = new Package();
        pk.path = path;
        pk.git = await Git.forDirectory(path);
        return pk;
    }

    async hasUpdate() {
        await this.git.fetch();
        let currentCommit = await this.git.revparse("HEAD");
        let remoteCommit = await this.git.revparse("origin/master");

        return currentCommit != remoteCommit;
    }

    async update() {
        await this.git.mergeFromTo("origin", "master");
    }

    async build(chroot) {
        await exec("makechrootpkg", ["-c", "-r", chroot.chrootPath, "-T", "-U", "autoaur", "-l", "autoaur"], {
            cwd: this.path
        });

        let files = await fs.readdir(this.path);
        return files.filter(file => /.pkg.tar./.test(file)).map(file => ({
            path: `${this.path}/${file}`,
            name: file
        }));
    }

    async clean() {
        this.git.clean("f");
    }
}

class Pkgbuilds {
    pkgbuildsPath;

    constructor(pkgbuildsPath) {
        this.pkgbuildsPath = pkgbuildsPath;
    }

    async init() {
        const autoauruser = await passwd.getpwnam("autoaur");

        await fs.mkdir(this.pkgbuildsPath, {
            recursive: true
        });
        await fs.chown(this.pkgbuildsPath, autoauruser.uid, autoauruser.gid);
    }

    async contains(pkg) {
        try {
            return await (await fs.stat(`${this.pkgbuildsPath}/${pkg}`)).isDirectory();
        } catch {
            return false;
        }
    }

    async obtain(pkg) {
        await Git.clone(`https://aur.archlinux.org/${pkg}.git`, this.pkgbuildsPath);
    }

    async package(pkg) {
        return await Package.forPath(`${this.pkgbuildsPath}/${pkg}`);
    }
}

module.exports = Pkgbuilds;