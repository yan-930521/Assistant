const Plugin = require("../utils/Plugin");
const Logger = require("../utils/Logger");

const { isDevMusic, getStorgePath, tmpFileForMusic, tmpFileForVideo, mp3PlayAfterDownload } = require("./../config").getConfig();

const ytdl = require('ytdl-core');

const fs = require("fs");

module.exports = new Plugin("music")
    .register("Input URL", async (plugin, event, url) => {
        //const window = BrowserWindow.fromWebContents(event.sender);
        //const stream = new MainIPCStream("music-stream", window);
        url.trim();
        Logger.log("info", "Input URL", url);

        let tmpMp3File = getStorgePath(tmpFileForMusic);
        let tmpMp4File = getStorgePath(tmpFileForVideo);

        Logger.log("info", "Tmp File Store In", tmpMp3File, tmpMp4File)

        if (isDevMusic) {
            event.reply("music", {
                type: "Input URL-reply",
                data: { info: {} }
            });
        } else {
            const info = await ytdl.getInfo(url).catch((error) => {
                event.reply("music", plugin.createPkg("Input URL-reply", { error }));
            });

            if (!info) return;

            const format = {}
            format.video = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
            format.audio = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

            //let starttime;
            if(plugin.ytStreaMp3) plugin.ytStreaMp3.end();

            fs.access(tmpMp3File, fs.constants.F_OK, (err) => {
                if (!err) fs.unlinkSync(tmpMp3File);
                let ytStreaMp3 = ytdl.downloadFromInfo(info, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                });

                if(plugin.ytStreaMp3) plugin.ytStreaMp3.end();
                plugin.ytStreaMp3 = ytStreaMp3;
                ytStreaMp3.pipe(fs.createWriteStream(tmpMp3File)).on("error", error => {
                    Logger.log("error", "downloading mp3", error);
                })

                ytStreaMp3.once('response', () => {
                    //starttime = Date.now();
                    Logger.log("info", "Start download mp3");
                });

                ytStreaMp3.on('finish', () => {
                    Logger.log("info", 'Finish download mp3');
                    if(mp3PlayAfterDownload) event.reply("music", plugin.createPkg("Input URL-reply", { info, format }));
                });
            });
            if(plugin.ytStreaMp4) plugin.ytStreaMp4.destroy();

            fs.access(tmpMp4File, fs.constants.F_OK, (err) => {
                if (!err) fs.unlinkSync(tmpMp4File);
                let ytStreaMp4 = ytdl.downloadFromInfo(info, {
                    filter: 'videoonly',
                    quality: 'highestvideo',
                });

                plugin.ytStreaMp4 = ytStreaMp4;
                ytStreaMp4.pipe(fs.createWriteStream(tmpMp4File)).on("error", error => {
                    Logger.log("error", "downloading mp4", error);
                })

                ytStreaMp4.once('response', () => {
                    //starttime = Date.now();
                    Logger.log("info", "Start download mp4");
                });

                ytStreaMp4.on('finish', () => {
                    Logger.log("info", 'Finish download mp4');
                });
            });

            if(!mp3PlayAfterDownload) {
                setTimeout(() => {
                    event.reply("music", plugin.createPkg("Input URL-reply", { info, format }));
                }, 5000);
            }
            




            /*
            ytStreaMp3.on('progress', (chunkLength, downloaded, total) => {
                const percent = downloaded / total;
                const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
                process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
                process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
                process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
                readline.moveCursor(process.stdout, 0, -1);
            });*/

        }
    });

