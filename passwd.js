const fs = require("fs/promises");

const getEntries =  async () => {
    const passwdFile = await fs.readFile("/etc/passwd", {
        encoding: "utf-8"
    });

    return passwdFile.split("\n").filter(line => line).map(line => {
        const parts = line.split(":");
        return {
            name: parts[0],
            passwd: parts[1],
            uid: parts[2],
            gid: parts[3],
            gecos: parts[4],
            dir: parts[5],
            shell: parts[6]
        }
    })
};

const getpwnam = async name => {
    const entries = await getEntries();
    return entries.find(entry => entry.name === name);
}

module.exports = {
    getEntries,
    getpwnam
}