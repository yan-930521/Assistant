const IpcEvent = require("./IpcEvent");
const { ipcMain } = require('electron');

class Plugin {

    /**
     * 
     * @param {string} name 插件名稱
     */
    constructor(name) {
        // ipc 事件
        this.ipcEvent = new IpcEvent(name);
    }

    init = () => {
        ipcMain.on(this.ipcEvent.name, this.ipcEvent.handleEvent);

        return this;
    }

    register = (type, callback) => {
        this.ipcEvent.register(type, callback);
        
        return this;
    }
}

module.exports = Plugin;