const Plugin = require("../utils/Plugin");
const { isDevMusic } = require("./../config")();
//const MainIPCStream = require("./../utils/stream");
// const { BrowserWindow } = require('electron')
const ytdl = require('ytdl-core');

const fs = require("fs");
const path = require("path");
const readline = require('readline');


module.exports = new Plugin("music")
    .register("Input URL", async (event, url) => {
        //const window = BrowserWindow.fromWebContents(event.sender);
        //const stream = new MainIPCStream("music-stream", window);
        url.trim();
        console.log("Input URL", url);

        let tmpFile = path.join(__dirname, '../tempmusic.mp3');

        if (isDevMusic) {
            event.reply("music", {
                type: "Input URL-reply",
                data: { info: {} }
            });
        } else {
            const info = await ytdl.getInfo(url).catch((error) => {
                event.reply("music", {
                    type: "Input URL-reply",
                    data: { error }
                });
            });

            if (!info) return;

            let starttime;

            fs.access(tmpFile, fs.constants.F_OK, (err) => {
                if (!err) fs.unlinkSync(tmpFile);
                let ytStream = ytdl.downloadFromInfo(info, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                });

                this.ytStream = ytStream;

                ytStream.pipe(fs.createWriteStream(tmpFile));

                ytStream.once('response', () => {
                    starttime = Date.now();
                });

                setTimeout(() => {
                    event.reply("music", {
                        type: "Input URL-reply",
                        data: { info }
                    });
                }, 5000);

                ytStream.on('progress', (chunkLength, downloaded, total) => {
                    const percent = downloaded / total;
                    const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                    const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
                    process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
                    process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
                    process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
                    readline.moveCursor(process.stdout, 0, -1);
                });

                ytStream.on('finish', () => {
                    console.log('\n\nmusic stop.');
                });
            });
        }
    });

