#!/usr/bin/env node
const Log = require("./log");

const { program } = require('commander');
program.version("0.0.1")
       .option("-d, --delete-chroot", "Delete the chroot")
       .option("-u, --no-update", "Don't update the chroot")
       .option("-f, --force-build <packages...>", "Force build specific packages")
       .option("--force-all", "Force build all packages");

program.parse();

//Ensure that we are running as root
if (process.getuid() !== 0) {
    Log.error("This utility must be run as root.");
    return;
}

const Chroot = require("./chroot");
const Pkgbuilds = require("./pkgbuilds");
const PackageRepository = require("./packagerepository");
const passwd = require("passwd");
const fs = require("fs").promises;
const url = require("url");
const settings = require("./settings");

(async() => {
    const config = await require("./config").get();

    //Ensure that the autoaur user exists
    let autoauruser = await passwd.getpwnam("autoaur");
    if (!autoauruser) {
        Log.error("The autoaur user does not exist.");
        return;
    }

    let opts = program.opts();

    //Start by ensuring the chroot exists
    let chroot = new Chroot(config.chroot);
    let pkgbuilds = new Pkgbuilds(config.pkgbuilds);

    await pkgbuilds.init();

    if (opts.deleteChroot) {
        if (!await chroot.chrootExists()) {
            Log.error("The chroot does not exist");
            return;
        }

        Log.info("Deleting the chroot.");
        await chroot.removeChroot();
        return;
    }

    if (!await chroot.chrootExists()) {
        //Create a chroot
        Log.info("The chroot doesn't exist. Creating chroot.");
        try {
            await chroot.initialiseChroot();
        } catch (error) {
            Log.error("The chroot could not be created.");
            return;
        }
    }

    await Promise.all(config.repositories.map(repository => (async () => {
        let pkRepo = new PackageRepository(repository.name, repository.packageRepository);
        if (!await pkRepo.exists()) await pkRepo.init();
    })()));

    //Generate a pacman configuration file
    let pacmanSkel = await fs.readFile("pacman-skel.conf", {
        encoding: "utf-8"
    });
    pacmanSkel += "\n" + config.repositories.map(repo => {
        let lines = [
            `[${repo.name}]`,
            `SigLevel = Optional TrustAll`,
            `Server = ${url.pathToFileURL(repo.packageRepository)}`
        ];
        return lines.join("\n");
    });

    await chroot.updatePacmanConfiguration(pacmanSkel);

    //Update the chroot
    if (opts.update) {
        Log.info("Updating the chroot.");
        await chroot.updateChroot();
    }

    for (let repository of config.repositories) {
        let pkRepo = new PackageRepository(repository.name, repository.packageRepository);

        for (let package of repository.packages) {
            let failedPackages = settings.get("failed", []);
            let shouldBuild = false;

            if (opts.forceBuild?.includes(package) || opts.forceAll) shouldBuild = true;
            if (failedPackages.includes(package)) shouldBuild = true;

            if (!await pkgbuilds.contains(package)) {
                Log.info(`Obtaining PKGBUILD for new package ${package}.`);
                await pkgbuilds.obtain(package);
                shouldBuild = true;
            }

            let pk = await pkgbuilds.package(package);
            if (await pk.hasUpdate()) {
                shouldBuild = true;
                await pk.update();
            } else {
                Log.info(`PKGBUILD ${package} has no updates.`);
            }

            if (shouldBuild) {
                Log.info(`Building PKGBUILD ${package}`);
                try {
                    let files = await pk.build(chroot);

                    Log.info(`Building PKGBUILD ${package} complete. Build produced ${files.length} packages.`);
                    for (let file of files) {
                        try {
                            await pkRepo.addPackageFile(file);
                            Log.info(`Added ${file.name} to the database.`);
                        } catch {
                            Log.error(`Could not add package file ${file.name} to the database.`);
                        }
                    }
                    
                    if (failedPackages.includes(package)) failedPackages.splice(failedPackages.indexOf(package), 1);
                } catch (error) {
                    if (!failedPackages.includes(package)) failedPackages.push(package);

                    if (error.stdout) {
                        await fs.mkdir(config.errorLogs, {
                            recursive: true
                        });

                        let fileName = `${new Date().getTime()}-${package}`;
                        let path = `${config.errorLogs}/${fileName}`;
                        fs.writeFile(path, error.stdout);
                        
                        Log.error(`Building PKGBUILD ${package} failed. Error log written to ${path}.`);
                    } else {
                        Log.error(`Building PKGBUILD ${package} failed.`);
                    }
                } finally {
                    await pk.clean();
                    settings.set("failed", failedPackages);
                    
                    if (opts.update) {
                        Log.info("Updating the chroot.");
                        await chroot.updateChroot();
                    }
                }
            }
        }
    }
})();