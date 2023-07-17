const { screen, BrowserWindow, desktopCapturer } = require("electron");
const { attach, detach, refresh } = require("electron-as-wallpaper");

const path = require("path");
const Logger = require("./Logger");

const { isDevWallpaper } = require("../config").getConfig();

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
            onLoad: true,
            resizable: false,
            fullscreenable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            path: this.getPath(config.src)
        });

        win.on('close', () => {
            this.mainWindow = null;
            this.closeWallpaperWindow();
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
            minimizable: false,
            onLoad: true,
            resizable: false,
            fullscreenable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            path: this.getPath(config.src)
        });

        win.on('close', () => {
            this.widgetWindow = null;
        });

        this.widgetWindow = win;
    }

    createFloorWindow = (config = null) => {
        if (this.widgetWindow instanceof BrowserWindow) throw new Error("FloorWindow 已創建");
        if (!config) config = this.getDefaultConfig("FloorWindow");

        const size = Window.getSizeOfDesktop();

        let win = this.createWindow({
            x: 0,
            y: size.y - config.height,
            width: config.width,
            height: config.height,
            frame: false,
            transparent: true,
            alwaysOnTop: false,
            minimizable: false,
            onLoad: true,
            resizable: false,
            fullscreenable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            path: this.getPath(config.src)
        });

        win.on('close', () => {
            this.floorWindow = null;
        });

        this.floorWindow = win;
    }


    createWallpaperWindow = (config = null) => {
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
            onLoad: true,
            resizable: false,
            fullscreenable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            path: this.getPath(config.src)
        });

        win.isReady = false;

        win.on('close', () => {
            this.wallpaperWindow = null;
        });

        this.wallpaperWindow = win;

        win.maximize();

        if (!isDevWallpaper) attach(win, { transparent: true });
    }

    closeWallpaperWindow = () => {
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
        const win = new BrowserWindow({
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

        win.isReady = false;



        if (option.onLoad) {
            win.hide();

            win.webContents.once("did-finish-load", () => {
                win.isReady = true;
                win.show();
            });
        }

        win.loadFile(option.path);

        return win;
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
     * 取得預設路徑
     * @param {string} name 檔案名稱
     * 
     * @returns {string} 路徑
     */
    getPath = (name) => {
        return path.join(__dirname, "../resource/html", name)
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