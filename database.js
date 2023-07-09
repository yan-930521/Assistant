const Datastore = require('nedb');

const { getStorgePath, database } = require("./config")();

/**
 * 初始化資料庫
 * @returns {Datastore} database
 */
const initDatabase = () => {
    console.log("Init Database");
    return new Promise((res, rej) => {
        const db = new Datastore(
            getStorgePath(database.path)
        );
        db.loadDatabase((err) => {
            if (!err) res(db);
            rej(err);
        });
    })
}


module.exports = initDatabase;