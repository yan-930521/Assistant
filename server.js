const fs = require("fs");
const { spawn } = require('child_process');
const ytdl = require('ytdl-core');

const express = require("express");
// const ffmpeg = require("fluent-ffmpeg");

const { port, getStorgePath, tmpFileForMusic, tmpFileForVideo, ffmpegPath } = require("./config")();

/**
 * 初始化伺服器
 * @returns {Express} Server
 */
const initServer = () => {
    const server = express();

    server.listen(port, () => {
        console.log("server listen on port", port);
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
            rstream.pipe(res);
        } else {
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
            fs.createReadStream(getStorgePath(tmpFileForMusic)).pipe(res);
        }
    });
    server.get("/music2.mp3", (req, res) => {
        // ffmpegPath + ' -i pipe:0 -f mp3 pipe:1'

        const ffmpeg = spawn(ffmpegPath, ['-i', 'pipe:0', '-f', 'mp3', 'pipe:1']);
        /*
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
            });*/

        res.type("mp3");

        let stream = fs.createReadStream(getStorgePath(tmpFileForMusic));

        stream.pipe(ffmpeg.stdin);

        ffmpeg.stdout.pipe(res, { end: true });
    });

    server.get("/music3.mp3", (req, res) => {
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

            stream.pipe(res, { end: true }).on("error", console.log)
        } else {
            res.type("video/mpeg");

            const stream = fs.createReadStream(getStorgePath(tmpFileForMusic));

            stream.pipe(res, { end: true }).on("error", console.log)
        }
    });

    server.get("/music1.mp4", (req, res) => {
        res.type("mp4");

        let stream = fs.createReadStream(getStorgePath(tmpFileForVideo));

        stream.pipe(res, { end: false });
    });

    server.get("/music2.mp4", (req, res) => {
        const fileSize = req.query.contentLength;
        console.log(fileSize)
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

            console.log(start, end, fileSize)

            res.writeHead(206, head);

            const stream = fs.createReadStream(getStorgePath(tmpFileForVideo), { start, end });

            stream
                .on("open", () => {
                    stream.pipe(res, { end: true });
                })
                .on("error", (err) => {
                    res.end(err);
                    console.log(err)
                })
        } else {
            res.type("video/mp4");

            const stream = fs.createReadStream(getStorgePath(tmpFileForVideo));

            stream.pipe(res, { end: true }).on("error", console.log).on('finish', () => {
                console.log('stream stop.');
            });
        }
    })

    return server;
};

module.exports = initServer;