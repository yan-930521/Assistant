const Plugin = require("../utils/Plugin");

const yaml = require('js-yaml');

module.exports = new Plugin("tool")
    .handler("JSON TO YAML", async (plugin, event, data) => {
        console.log("JSON TO YAML");

        const ymlDoc = yaml.dump(data);
        
        return ymlDoc;
    });