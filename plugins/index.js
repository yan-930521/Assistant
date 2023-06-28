// 包裹plugins

const fs = require("fs");
const path = require("path");

/**
 * 初始化所有插件
 */
module.exports = initPlugins = () => {
    let plugins = {};
    let pluginFiles = fs.readdirSync(__dirname).filter(file => (file != __filename.replace(__dirname, "").replace("\\", "")) && file.endsWith(".js"));
    for (const file of pluginFiles) {
        const plugin = require(path.join(__dirname, file));

        plugins[plugin.name] = plugin.init();
    }

    return plugins;
}
