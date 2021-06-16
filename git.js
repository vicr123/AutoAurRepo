const simpleGit = require("simple-git");
const posix = require("posix");

const autoauruser = posix.getpwnam("autoaur");

class Git {
    static async clone(remote, baseDir, options) {
        await (simpleGit(baseDir, {
            spawnOptions: {
                uid: autoauruser.uid,
                gid: autoauruser.gid
            }
        })).clone(remote, options);
    }

    static forDirectory(baseDir) {
        return simpleGit(baseDir, {
            spawnOptions: {
                uid: autoauruser.uid,
                gid: autoauruser.gid
            }
        });
    }
}

module.exports = Git;