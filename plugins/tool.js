const Plugin = require("../utils/Plugin");
const Logger = require("../utils/Logger");

const yaml = require('js-yaml');

const { getConfig, setConfig } = require("../config");

module.exports = new Plugin("tool")
    .handler("JSON TO YAML", async (plugin, event, data) => {
        Logger.log("info", "JSON TO YAML");

        const ymlDoc = yaml.dump(data);

        return ymlDoc;
    })
    .handler("Call Wallpaper", async (plugin, event, data) => {
        Logger.log("info", "Call Wallpaper", data);
        let win = plugin.getData("window");
        if (!win || !win.wallpaperWindow) return false;
        win.wallpaperWindow.webContents.send(plugin.ipcEvent.name, plugin.createPkg("Call Wallpaper-reply", data));
        return null;
    })
    .handler("Call Floor", async (plugin, event, data) => {
        // Logger.log("info", "Call Floor");
        let win = plugin.getData("window");
        if (!win || !win.floorWindow) return false;
        win.floorWindow.webContents.send(plugin.ipcEvent.name, plugin.createPkg("Call Floor-reply", data));
        return null;
    })
    .handler("Get Setting", async (plugin, event) => {
        Logger.log("info", "Get Setting");
        return JSON.parse(JSON.stringify(getConfig()));
    })
    .handler("Set Setting", async (plugin, event, data) => {
        Logger.log("info", "Set Setting");
        let database = plugin.getData("database");
        let dataToSet = await database.setSetting(data.key, data.value);
        if(dataToSet) {
            let res = setConfig(dataToSet);
            if(!res) Logger.log("error", "SetConfig fail");
            return res;
        }
        return false;
    })   
    .handler("Chat To AI", async (plugin, event, msg) => {
        const rwkv = plugin.getData("rwkv");
        if(!rwkv.isInit) return false;

        let win = plugin.getData("window");
        if (!win || !win.floorWindow) return false;

        if(!plugin.chat_id) {
            plugin.chat_id = "tool";
            rwkv.createChatRoom(plugin.chat_id, getConfig().userName);
        }

        rwkv.onMsg(plugin.chat_id, msg);
        
        rwkv.sendMsg = (msg) => {
            win.floorWindow.webContents.send(plugin.ipcEvent.name, plugin.createPkg("Chat To AI-reply", msg));
        }
    });