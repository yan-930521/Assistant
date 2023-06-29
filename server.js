const fs = require("fs");

const express = require("express");
const ffmpeg = require("fluent-ffmpeg");

const { port, tmpFileForMusic, ffmpegPath } = require("./config")();

/**
 * 初始化伺服器
 * @returns {Express} Server
 */
const initServer = () => {
    const server = express();

    server.listen(port, () => {
        console.log("server listen on port", port);
    });
    
    server.get("/music.mp3", (req, res) => {
        let stat = fs.statSync(tmpFileForMusic);
        let total = stat.size;
        if (req.headers.range && total > 0) {
            const range = req.headers.range;
            const parts = range.replace(/bytes=/, '').split('-');
            const partialStart = parts[0];
            const partialEnd = parts[1];
    
            const start = parseInt(partialStart, 10);
            const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
            const chunksize = (end - start) + 1;
            const rstream = fs.createReadStream(tmpFileForMusic, { start: start, end: end });
    
            res.writeHead(206, {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg'
            });
            rstream.pipe(res);
        } else {
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
            fs.createReadStream(tmpFileForMusic).pipe(res);
        }
    });
    server.get("/music2.mp3", (req, res) => {
    
        let stream = ffmpeg()
            .setFfmpegPath(ffmpegPath)
            .input(fs.createReadStream(tmpFileForMusic))
            .toFormat("mp3")
            .on('start', (cmd) => {
                console.log('Started | ' + cmd);
            })
            .on('error', (err) => {
                console.log('Error | ', err);
            })
            .on("close", () => {
                console.log("stream closed.");
            });
    
        res.type("mp3");
    
        stream.pipe(res, {end: true});

        stream
    });

    return server;
};

module.exports = initServer;