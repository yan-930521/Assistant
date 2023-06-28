const { app, BrowserWindow } = require("electron");

const config = require("./config")();
const window = new (require("./utils/Window"))(config.window);
const initPlugins = require("./plugins/index");
const initServer = require("./server");

app.whenReady().then(() => {
    window.createMainWindow();

    initServer();
    initPlugins();

    /**
     * 桌面圖示被點擊時觸發
     */
    app.on("activate", function () {
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
})