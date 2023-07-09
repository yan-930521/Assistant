const fs = require("fs");
const { spawn } = require('child_process');

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
        
        const ffmpeg = spawn(ffmpegPath, ['-re', '-i', 'pipe:0', '-f', 'mp3', 'pipe:1']);
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

        ffmpeg.stdout.pipe(res, {end: true});
    });


    server.get("/music1.mp4", (req, res) => {
        res.type("mp4");

        let stream = fs.createReadStream(getStorgePath(tmpFileForVideo));

        stream.pipe(res);
    });

    server.get("/music2.mp4", (req, res) => {
        const filepath = getStorgePath(tmpFileForVideo);
        const stat = fs.statSync(filepath);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            const stream = fs.createReadStream(filepath, {start, end})
             
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(206, head);

            stream.pipe(res);
        } else {         
            res.type("mp4");

            let stream = fs.createReadStream(getStorgePath(tmpFileForVideo));
    
            stream.pipe(res);
        }
    })

    return server;
};

module.exports = initServer;