/**
 * https://github.com/jprichardson/electron-ipc-stream/blob/master/src/main.js
 */

const { ipcMain } = require('electron');
const bufferJson = require('buffer-json')
const { Duplex } = require('stream');

class MainIPCStream extends Duplex {
    constructor(channel, browserWindow, streamOpts) {
        streamOpts = streamOpts || {};
        streamOpts.objectMode = streamOpts.objectMode ? streamOpts.objectMode : true;

        super(streamOpts);

        this.browserWindow = browserWindow;
        this.channel = channel;

        ipcMain.on(this.channel, this.ipcCallback);

        this.on('finish', () => {
            if (this.browserWindow) this.browserWindow.webContents.send(this.channel + '-finish');
            ipcMain.removeListener(this.channel, this.ipcCallback);
        })
        ipcMain.once(this.channel + '-finish', () => this.push(null));
    }

    ipcCallback = (event, data) => {
        if (typeof data === 'string') {
            data = JSON.parse(data, bufferJson.reviver);
        }
        this.push(data);
    }

    _read = () => {}

    _write = (data, enc, next) => {
        if (typeof data === 'string') {
            data = JSON.stringify(data);
        }
        if (Buffer.isBuffer(data)) {
            data = JSON.stringify(data, null, bufferJson.replacer);
        }
        if (!this.browserWindow) return console.warn('MainIPCStream: trying to write when no browserWindow is set.');
        this.browserWindow.webContents.send(this.channel, data);

        next();
    }
}

module.exports = MainIPCStream;