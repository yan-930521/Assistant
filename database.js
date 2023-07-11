const Datastore = require('nedb');

const Logger = require("./utils/Logger");

const { getStorgePath, database } = require("./config")();

/**
 * 初始化資料庫
 * @returns {Datastore} database
 */
const initDatabase = () => {
    Logger.log("normal", "Init Database");
    return new Promise((res, rej) => {
        const db = new Datastore(
            getStorgePath(database.path)
        );
        db.loadDatabase((err) => {
            if (err) {
                Logger.log("error", "Error when load database", err);
                rej(err);
            } else res(db);
        });
    })
}


module.exports = initDatabase;