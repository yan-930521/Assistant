/**
 * https://github.com/jprichardson/electron-ipc-stream/blob/master/src/rend.js
 */
var { ipcRenderer } = require('electron');
const bufferJson = require('buffer-json')
const { Duplex } = require('stream');

class RendIPCStream extends Duplex {
    constructor(channel, streamOpts) {
        streamOpts = streamOpts || {};
        streamOpts.objectMode = streamOpts.objectMode ? streamOpts.objectMode : true;

        super(streamOpts);

        this.channel = channel;

        ipcRenderer.on(this.channel, this.ipcCallback);

        this.on('finish', () => {
            ipcRenderer.send(this.channel + '-finish');
            ipcRenderer.removeListener(this.channel, this.ipcCallback);
        })
        ipcRenderer.once(this.channel + '-finish', () => this.push(null))
    }

    ipcCallback = (event, data) => {
        if (typeof data === 'string') {
            data = JSON.parse(data, bufferJson.reviver);
        }
        this.push(data);
    }

    _read = () => { }

    _write = (data, enc, next) => {
        if (typeof data === 'string') {
            data = JSON.stringify(data);
        }
        if (Buffer.isBuffer(data)) {
            data = JSON.stringify(data, null, bufferJson.replacer);
        }
        if (!this.browserWindow) return console.warn('MainIPCStream: trying to write when no browserWindow is set.');

        ipcRenderer.send(this.channel, data)

        next();
    }
}

//module.exports = RendIPCStream;