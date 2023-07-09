const { screen, BrowserWindow } = require("electron");
const { attach, detach, refresh } = require("electron-as-wallpaper");

const path = require("path");

const { isDevWallpaper } = require("../config")();

module.exports = class Window {
    /**
     * 
     * @param {object} config 窗口的所有設定
     */
    constructor(config) {
        this.mainWindow = null;
        this.widgetWindow = null;

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
            minimizable: false,
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
            this.closeWallpaper()
        });

        win.webContents.once("did-finish-load", () => {
            win.isReady = true;
        });

        this.mainWindow = win;

        return win;
    }

    createWidgetWindow = (config = null) => {
        if (this.widgetWindow instanceof BrowserWindow) throw new Error("WidgetWindow 已創建");
        if (!config) config = this.getDefaultConfig("WidgetWindow");

        let center = Window.getCenterOfDesktop();

        let win = this.createWindow({
            x: (center.x + 230),
            y: (center.y - config.height / 2),
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
            this.widgetWindow = null;
        });

        win.webContents.once("did-finish-load", () => {
            win.isReady = true;
        });

        this.widgetWindow = win;
    }

    createWallpaper = (config = null) => {
        if (this.wallpaperWindow instanceof BrowserWindow) throw new Error("WallpaperWindow 已創建");
        if (!config) config = this.getDefaultConfig("WallpaperWindow");

        let size = Window.getSizeOfDesktop();


        let win = this.createWindow({
            x: 0,
            y: 0,
            width: size.x,
            height: size.y,
            frame: false,
            transparent: false,
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
            this.wallpaperWindow = null;
        });

        win.webContents.once("did-finish-load", () => {
            win.isReady = true;
        });

        this.wallpaperWindow = win;

        win.maximize();

        if (!isDevWallpaper) attach(win, { transparent: true });
    }

    closeWallpaper = () => {
        detach(this.wallpaperWindow);
        this.wallpaperWindow.close();
        refresh();
    }

    /**
     * 建立視窗
     * @param {object} option 視窗設定
     * @returns {BrowserWindow}
     */
    createWindow = (option) => {
        return new BrowserWindow({
            x: Math.round(option.x == null ? Window.getCenterOfDesktop().x : option.x),
            y: Math.round(option.y == null ? Window.getCenterOfDesktop().y : option.y),
            width: option.width == null ? 600 : option.width,
            height: option.height == null ? 600 : option.height,
            frame: option.frame == null ? false : option.frame,
            transparent: option.transparent == null ? true : option.transparent,
            alwaysOnTop: option.alwaysOnTop == null ? false : option.alwaysOnTop,
            minimizable: option.minimizable == null ? true : option.minimizable,
            resizable: option.resizable == null ? false : option.resizable,
            fullscreenable: option.fullscreenable == null ? false : option.fullscreenable,
            webPreferences: {
                preload: option?.webPreferences?.preload,
                nodeIntegration: option?.webPreferences?.nodeIntegration == null ? true : option?.webPreferences?.nodeIntegration,
                contextIsolation: option?.webPreferences?.contextIsolation == null ? false : option?.webPreferences?.contextIsolation
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

    static getSizeOfDesktop = () => {
        return {
            x: screen.getPrimaryDisplay().workAreaSize.width,
            y: screen.getPrimaryDisplay().workAreaSize.height
        }
    }
}