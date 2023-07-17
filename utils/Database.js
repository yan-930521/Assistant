const Datastore = require('nedb');

const Logger = require("./Logger");

const { getStorgePath, database } = require("../config").getConfig();

module.exports = class Database {
    constructor() {
        this.db = new Datastore(
            getStorgePath(database.path)
        );
    }

    /**
     * 初始化資料庫
     * @returns {Promise<Database>} database
     */
    init = () => {
        Logger.log("info", "Init Database");
        return new Promise((res, rej) => {
            
            this.db.loadDatabase((err) => {
                if (err) {
                    Logger.log("error", "Error when load database", err);
                    rej(err);
                } else {
                    res(this);
                };
            });
        })
    }

    get = (name) => {
        return new Promise((res, rej) => {
            Logger.log("info", "Get Data: ", name);
            this.db.findOne({ name: name }, (err, docs) => {
                if(err) {
                    Logger.log("error", err);
                    rej(err);
                }
                res(docs);
            });
        })
    }

    set = (name, key, value) => {
        return new Promise(async (res, rej) => {
            Logger.log("info", "Set Data: ", name, key, value);
            let data = {};
            data[key] = value;
            this.db.update({ name: name }, { $set: data }, { upsert: true }, (err, number, upsert) => {
                if(err) {
                    Logger.log("error", err);
                    rej(err);
                }
                res(data);
            });
        })
    }

    getSetting = () => {
        return this.get(database.dataKey.setting);
    }

    setSetting = (key, value) => {
        return this.set(database.dataKey.setting, key, value);
    }
}