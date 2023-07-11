const Plugin = require("../utils/Plugin");
const Logger = require("../utils/Logger");

const yaml = require('js-yaml');

module.exports = new Plugin("tool")
    .handler("JSON TO YAML", async (plugin, event, data) => {
        Logger.log("info", "JSON TO YAML");

        const ymlDoc = yaml.dump(data);

        return ymlDoc;
    })
    .handler("Call Wallpaper", async (plugin, event, data) => {
        Logger.log("info", "Call Wallpape", data);
        let win = plugin.getData("window");
        if (!win || !win.wallpaperWindow) return false;
        win.wallpaperWindow.webContents.send(plugin.ipcEvent.name, plugin.createPkg("Call Wallpaper-reply", data));
        return null;
    })