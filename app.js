const { app, BrowserWindow } = require("electron");

const config = require("./config")();
const window = new (require("./utils/Window"))(config.window);
const initPlugins = require("./plugins/index");
const initServer = require("./server");
const initDatabase = require("./database");

const Logger = require("./utils/Logger");

app.whenReady().then(() => {
    Logger.log("info", 'Dir Name: ', config.baseDir);
    Logger.log("info", "Config: ", JSON.stringify(config, null, 4));

    window.createMainWindow();
    window.createWallpaper();

    const server = initServer();
    const database = initDatabase();

    initPlugins({window, server, database});

    /**
     * 桌面圖示被點擊時觸發
     */
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            window.createMainWindow();
        }
    });

    /**
     * 關閉所有視窗時觸發，除 macOS 以外
     */
    app.on("window-all-closed", function () {
        // darwin 為 macOS 的作業系統
        if (process.platform !== "darwin") app.quit();
    });
});

process.on('uncaughtException', err => {
	Logger.log("error", 'Uncaughted Exception Happens: ', err.message)
    app.quit();
});