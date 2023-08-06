const fs = require("fs");
const os = require('os');
const path = require("path");

const getDefaultPath = (p) => {
    return path.join(__dirname, p);
}

require('dotenv').config({ path: getDefaultPath('.env') });

/**
 * @type {Config} - 包含設定值的物件
 */
const config = {};

/**
 * @type {object} - 包含資料庫內的設定值
 */
const dataToSet = {};

const baseDir = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR : __dirname;

const setting = JSON.parse(
    fs.readFileSync(
        getDefaultPath("./setting.json"),
        "utf-8"
    )
);

const storgePath = path.join(
    baseDir,
    setting.storgeDir
);

const getStorgePath = (p) => {
    return path.join(storgePath, p);
}

config.baseDir = baseDir;
config.ffmpegPath = getDefaultPath(setting.ffmpegDir + "bin/ffmpeg" + (os.platform() === 'win32' ? '.exe' : ''));
config.storgePath = storgePath;
config.logLevel = 0;
config.getDefaultPath = getDefaultPath;
config.getStorgePath = getStorgePath;
config.WEATHER_API_KEY = process.env.WEATHER_API_KEY;

Object.assign(config, setting);

/**
 * @typedef {object} Config
 * @property {string} baseDir - app目錄
 * @property {number} port - 連接埠號碼
 * @property {string} userName - 使用者名稱
 * @property {object} window - 各視窗的大小設定
 * @property {string} tmpFileForMusic - 用來暫存mp3檔案的地方
 * @property {string} tmpFileForVideo - 用來暫存mp4檔案的地方
 * @property {boolean} mp3PlayAfterDownload - 當mp3下載完才播放
 * @property {boolean} videoFullScreen - 影片是否全螢幕播放
 * @property {string} ffmpegPath - ffmpeg 的路徑
 * @property {boolean} isDevMusic - mp3系統是否是測試狀態
 * @property {boolean} isDevWallpaper - 桌布系統是否是測試狀態
 * @property {boolean} isDevRwkv - rwkv系統是否是測試狀態
 * @property {number} logLevel - log的分級
 * @property {object} database - 資料庫相關的設定
 * @property {string} database.name - 資料庫的名稱
 * @property {string} database.path - 資料庫相關的設定的路徑
 * @property {object} database.dataKey - 資料庫的各個鍵值
 * @property {string} database.dataKey.setting - 動態設定存放的資料庫名稱
 * @property {string} storgePath - 儲存檔案的資料夾路徑
 * @property {string} storgeDir - 儲存檔案的資料夾名稱
 * @property {GetDefaultPathCallback} getDefaultPath - 獲取檔案的絕對路徑
 * @property {GetStorgePathCallback} getStorgePath - 獲取儲存檔案的絕對路徑
 * @property {string} WEATHER_API_KEY - 中央氣象局的API KEY
 * @property {string} weatherLocationName - 氣象觀測站的名稱
 * @property {string} weatherObservatory - 縣市的名稱
 * @property {array} allowSet - 能透過資料庫自訂的設定
 * @property {object} settingType - 能透過資料庫自訂的設定的型別
 * @property {object} startTime - 開啟時間
 * @property {array} service - 要啟動的服務
 * @property {object} rwkv - rwkv服務的相關資料
 * @property {number} rwkv.port - rwkv server port
 * @property {object} tts - tts服務的相關資料
 * @property {number} tts.port - tts server port
 */

/**
 * 獲取檔案的絕對路徑
 * @callback GetDefaultPathCallback
 * @param {string} path - 要合成路徑的檔案路徑
 * @returns {string} - 檔案的絕對路徑
 */

/**
 * 獲取檔案的絕對路徑
 * @callback GetStorgePathCallback
 * @param {string} path - 要合成路徑的檔案路徑
 * @returns {string} - 檔案的絕對路徑
 */

/**
 * 取得設定檔的值
 * @returns {Config}
 */
const getConfig = () => {
    return config;
}

/**
 * 匯入資料庫的設定
 * @param {Promise<boolean>} 是否設定成功
 */
const setConfig = (data) => {
    let sucess = true;
    for (let key in data) {
        if (config.allowSet.includes(key)) {
            if (config.settingType[key]) {
                switch (config.settingType[key]) {
                    case "number":
                        let number = Number(data[key])
                        if (isNaN(number)) sucess = false;
                        else dataToSet[key] = number;
                        break;
                    case "boolean":
                        let boolean = data[key].toLowerCase() == "true" ? true : data[key].toLowerCase() == "false" ? false : null
                        if (boolean == null) sucess = false;
                        else dataToSet[key] = boolean;
                        break;
                    default:
                        dataToSet[key] = data[key];
                        break;
                }
            } else {
                dataToSet[key] = data[key];
            }
        } else if( key == "startTime") {
            dataToSet["startTime"] = data[key];
        }
        Object.assign(config, dataToSet);
    }
    return sucess;
}

module.exports.getConfig = getConfig;
module.exports.setConfig = setConfig;