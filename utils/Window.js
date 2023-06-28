const { screen, BrowserWindow } = require("electron");
const path = require("path");

module.exports = class Window {
    /**
     * 
     * @param {object} config 窗口的所有設定
     */
    constructor(config) {
        this.mainWindow = null;

        this._config = config;
    }
    /**
     * 創造主要畫面
     * @param {object} config
     * @param {string} config.src html檔案路徑
     * @param {Number} config.width 畫面寬度
     * @param {Number} config.height 畫面高度
     * 
     * @returns {BrowserWindow}
     */
    createMainWindow = (config = null) => {
        if (this.mainWindow instanceof BrowserWindow) throw new Error("MainWindow 已創建");
        if (!config) config = this.getDefaultConfig("MainWindow");

        let center = Window.getCenterOfDesktop();

        
        let win = this.createWindow({
            x: center.x - config.width / 2,
            y: center.y - config.height / 2,
            width: config.width,
            height: config.height,
            frame: false,
            transparent: true,
            alwaysOnTop: false,
            resizable: false,
            fullscreenable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        win.loadFile(path.join(__dirname, "../resource", config.src));
        win.isReady = false;

        win.on('close', () => {
            this.mainWindow = null;
        });

        win.webContents.once("did-finish-load", () => {
            win.isReady = true;
        });

        this.mainWindow = win;

        return win;
    }

    /**
     * 建立視窗
     * @param {object} option 視窗設定
     * @returns {BrowserWindow}
     */
    createWindow = (option) => {
        return new BrowserWindow({
            x: option.x || this.getCenterOfDesktop().x,
            y: option.y || this.getCenterOfDesktop().y,
            width: option.width || 600,
            height: option.height || 600,
            frame: option.frame || false,
            transparent: option.transparent || true,
            alwaysOnTop: option.alwaysOnTop || false,
            resizable: option.resizable || false,
            fullscreenable: option.fullscreenable || false,
            webPreferences: {
                preload: option?.webPreferences?.preload || null,
                nodeIntegration: option?.webPreferences?.nodeIntegration || true,
                contextIsolation: option?.webPreferences?.contextIsolation || false
            }
        });
    }

    /**
     * 取得預設config
     * @param {*} name config的名稱
     * 
     * @returns {object} config
     */
    getDefaultConfig = (name) => {
        return this._config[name] || null;
    }

    /**
     * 取的桌面中心座標
     */
    static getCenterOfDesktop = () => {
        return {
            x: screen.getPrimaryDisplay().workAreaSize.width / 2,
            y: screen.getPrimaryDisplay().workAreaSize.height / 2
        }
    }
}