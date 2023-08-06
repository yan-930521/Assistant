const { app, BrowserWindow } = require("electron");

const { getConfig, setConfig } = require("./config");

const initPlugins = require("./plugins/index");
const initServer = require("./server");
const Database = require("./utils/Database");
const Window = require("./utils/Window");
const Rwkv = require("./utils/Rwkv");

const Logger = require("./utils/Logger");
const killProcesses = require("./utils/killProcesses");

app.whenReady().then(async () => {
    // 載入資料庫
    const database = await (new Database().init());
    
    // test
    // await database.setSetting("port", 3030);

    const dataToSet = await database.getSetting();
    dataToSet.startTime = Date.now() - process.uptime();

    Logger.log("info", "dataToSet", dataToSet);
    let res = setConfig(dataToSet);
    if(!res) Logger.log("error", "SetConfig fail");
    
    const config = getConfig();

    Logger.log("info", 'Dir Name: ', config.baseDir);
    Logger.log("info", "Config: ", JSON.stringify(config, null, 4));
   
    const processPath = app.getPath("exe");
    if(!processPath.endsWith("electron.exe")) {
        const processName = processPath.split("\\")[processPath.split("\\").length - 1].trim();
        Logger.log("info", "Killing Process With Same Name: ", processName);
        await killProcesses(processName);
    }
   
    const window = new Window(getConfig().window);
    window.createMainWindow();
    window.createWallpaperWindow();
    window.createFloorWindow();

    const server = initServer();

    let rwkv = null;

    if(config.service.includes("rwkv")) {
        rwkv = new Rwkv({port: config.rwkv.port});
        Logger.log("info", 'Start RWKV Process on Port', config.rwkv.port);
        if(config.isDevRwkv) {
            rwkv.init();
        } else {
            rwkv.startProcess();
        }
    } else {
        Logger.log("info", 'Disable RWKV');
    }



    initPlugins({window, server, database, rwkv});

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