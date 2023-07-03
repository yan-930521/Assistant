const path = require("path");
const { QuickDB } = require("quick.db");

const { getPath, database } = require("./config")();

/**
 * 初始化資料庫
 * @returns {QuickDB} Server
 */
const initDatabase = () => {
    console.log("Init Database");
    return new QuickDB({ filePath: getPath(database.path) });
}

module.exports = initDatabase;