const IpcEvent = require("./IpcEvent");
const { ipcMain } = require('electron');

class Plugin {

    /**
     * 
     * @param {string} name 插件名稱
     */
    constructor(name) {
        /**
         * @type {IpcEvent} ipc 事件
         */
        this.ipcEvent = new IpcEvent(name);

        /**
         * @type {object} 儲存客製化功能
         */
        this.customFunctions = {}


        /**
         * @type {function} 在初始化的時候被呼叫
         */
        this._onInit = null;

        /**
         * @type {object} 主進程傳遞進所有plugin的資料
         */
        this._data = {}
    }

    init = (data) => {
        this._data = data;
        ipcMain.on(this.ipcEvent.name, (...arg) => this.ipcEvent.handleEvent(this, ...arg));
        ipcMain.handle(this.ipcEvent.name,  (...arg) => this.ipcEvent.handleInvoke(this, ...arg));
          

        if(this._onInit && typeof this._onInit == "function") this._onInit(this);

        return this;
    }

    register = (type, callback) => {
        this.ipcEvent.register(type, callback);
        
        return this;
    }

    handler = (type, callback) => {
        this.ipcEvent.handler(type, callback);
        
        return this;
    }

    set = (name, customFunction) => {
        this.customFunctions[name] = customFunction;
        return this;
    }

    getData = (name) => {
        return  this._data[name] || null;
    }

    onInit = (callback) => {
        this._onInit = callback;
        return this;
    }

    createPkg = (type, data) => {
        return {
            type,
            data
        }
    }
}

module.exports = Plugin;