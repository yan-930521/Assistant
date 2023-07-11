const { logLevel } = require("../config")();

module.exports = class Logger {
    static getLevel = (type) => {
        return this.Types[type.toUpperCase()];
    }
    static log = (type, ...data) => {
        if(isNaN(Number(type))) type = this.getLevel(type);

        if(type >= logLevel) {
            console.log(...data);
        }
    }
    static Types = {
        "INFO": 0,
        "NORMAL": 1,
        "ERROR": 2
    }
}