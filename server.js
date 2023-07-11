const fs = require("fs");
const { spawn } = require('child_process');

const express = require("express");
// const ffmpeg = require("fluent-ffmpeg");

const { port, getStorgePath, tmpFileForMusic, tmpFileForVideo, ffmpegPath } = require("./config")();

const Logger = require("./utils/Logger");

/**
 * 初始化伺服器
 * @returns {Express} Server
 */
const initServer = () => {
    const server = express();

    server.listen(port, () => {
        Logger.log("normal", "Server listen on port", port);
    });


    /*
    server.get("/ip", (req, res) => {
        const ipAddress = req.socket.remoteAddress;
        console.log("IP: ", req.ip, ipAddress);
        res.send(ipAddress);
    });*/

    server.get("/music.mp3", (req, res) => {
        let stat = fs.statSync(getStorgePath(tmpFileForMusic));
        let total = stat.size;
        if (req.headers.range && total > 0) {
            const range = req.headers.range;
            const parts = range.replace(/bytes=/, '').split('-');
            const partialStart = parts[0];
            const partialEnd = parts[1];

            const start = parseInt(partialStart, 10);
            const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
            const chunksize = (end - start) + 1;
            const rstream = fs.createReadStream(getStorgePath(tmpFileForMusic), { start: start, end: end });

            res.writeHead(206, {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg'
            });
            rstream.pipe(res).on("error", (err) => {
                Logger.log("error", err)
                res.end(err);
            });
        } else {
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
            fs.createReadStream(getStorgePath(tmpFileForMusic)).pipe(res).on("error", (err) => {
                Logger.log("error", err)
                res.end(err);
            });
        }
    });
    server.get("/musicffmepg.mp3", (req, res) => {
        // ffmpegPath + ' -i pipe:0 -f mp3 pipe:1'

        const ffmpeg = spawn(ffmpegPath, ['-i', 'pipe:0', '-f', 'mp3', 'pipe:1']);

        res.type("mp3");

        let stream = fs.createReadStream(getStorgePath(tmpFileForMusic));

        stream
            .on("open", () => {
                stream.pipe(ffmpeg.stdin, { end: true }).on("error", (err) => {
                    Logger.log("error", err)
                    res.end(err);
                });
            });

        ffmpeg.stdout.pipe(res, { end: true }).on("error", (err) => {
            Logger.log("error", err)
            res.end(err);
        });
    });

    server.get("/musicrange.mp3", (req, res) => {
        const stat = fs.statSync(getStorgePath(tmpFileForMusic));
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const CHUNK_SIZE = 10 ** 6;
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
            const contentLength = end - start + 1;
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength,
                'Content-Type': 'video/mpeg',
            }

            res.writeHead(206, head);

            const stream = fs.createReadStream(getStorgePath(tmpFileForMusic), { start, end });

            stream.pipe(res, { end: true }).on("error", (err) => {
                Logger.log("error", err)
                res.end(err);
            });
        } else {
            res.type("video/mpeg");

            const stream = fs.createReadStream(getStorgePath(tmpFileForMusic));

            stream.pipe(res, { end: true }).on("error", (err) => {
                Logger.log("error", err)
                res.end(err);
            });
        }
    });

    server.get("/music.mp4", (req, res) => {
        let tmpFile = getStorgePath(tmpFileForVideo);

        const musicSrc = req.query.musicSrc;

        if (musicSrc) tmpFile = musicSrc;

        const fileSize = req.query.contentLength;
        const range = req.headers.range;
        if (range) {
            const CHUNK_SIZE = 10 ** 7;
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
            const contentLength = end - start + 1;
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(206, head);

            const stream = fs.createReadStream(tmpFile, { start, end });

            stream
                .on("open", () => {
                    stream.pipe(res, { end: true }).on("error", (err) => {
                        Logger.log("error", err)
                        res.end(err);
                    });
                });
        } else {
            res.type("video/mp4");

            const stream = fs.createReadStream(tmpFile);

            stream
                .on("open", () => {
                    stream.pipe(res, { end: true }).on("error", (err) => {
                        Logger.log("error", err)
                        res.end(err);
                    });
                });
        }
    })


    return server;
};

module.exports = initServer;