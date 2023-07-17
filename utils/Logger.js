const logger = require('electron-log');

const path = require("path");

const { baseDir } = require("./../config").getConfig();

logger.transports.file.level = 'info';
logger.transports.file.resolvePath = () => path.join(baseDir, "./logs/assistant.log");

module.exports = class Logger {
    static log = (type, ...data) => {
        try {
            logger.functions[type](...data);
        } catch (error) {
            logger.info(...data);
            // console.log(...data)
        }
    }
}