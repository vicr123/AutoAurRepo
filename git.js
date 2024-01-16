const simpleGit = require("simple-git");
const passwd = require("passwd");

class Git {
    static async clone(remote, baseDir, options) {
        const autoauruser = await passwd.getpwnam("autoaur");

        await (simpleGit(baseDir, {
            spawnOptions: {
                uid: autoauruser.uid,
                gid: autoauruser.gid
            }
        })).clone(remote, options);
    }

    static async forDirectory(baseDir) {
        const autoauruser = await passwd.getpwnam("autoaur");

        return simpleGit(baseDir, {
            spawnOptions: {
                uid: autoauruser.uid,
                gid: autoauruser.gid
            }
        });
    }
}

module.exports = Git;