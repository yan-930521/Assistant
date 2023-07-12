const fs = require("fs");
const os = require('os');
const path = require("path");

const baseDir = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR : __dirname;

const getDefaultPath = (p) => {
    return path.join(__dirname, p);
}

require('dotenv').config({ path: getDefaultPath('.env') });

/**
 * @typedef {object} Config
 * @property {string} baseDir - app目錄
 * @property {number} port - 連接埠號碼
 * @property {object} window - 各視窗的大小設定
 * @property {string} tmpFileForMusic - 用來暫存mp3檔案的地方
 * @property {string} tmpFileForVideo - 用來暫存mp4檔案的地方
 * @property {boolean} mp3PlayAfterDownload - 當mp3下載完才播放
 * @property {string} ffmpegPath - ffmpeg 的路徑
 * @property {boolean} isDevMusic - mp3系統是否是測試狀態
 * @property {boolean} isDevWallpaper - 桌布系統是否是測試狀態
 * @property {number} logLevel - log的分級
 * @property {object} database - 資料庫相關的設定
 * @property {string} database.name - 資料庫的名稱
 * @property {string} database.path - 資料庫相關的設定的路徑
 * @property {string} storgePath - 儲存檔案的資料夾路徑
 * @property {string} storgeDir - 儲存檔案的資料夾名稱
 * @property {GetDefaultPathCallback} getDefaultPath - 獲取檔案的絕對路徑
 * @property {GetStorgePathCallback} getStorgePath - 獲取儲存檔案的絕對路徑
 * @property {string} WEATHER_API_KEY - 中央氣象局的API KEY
 * @property {string} weatherLocationName - 氣象觀測站的名稱
 * @property {string} weatherObservatory - 縣市的名稱
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

    /**
     * @type {Config} - 包含設定值的物件
     */
    const config = {
        baseDir: baseDir,
        ffmpegPath: getDefaultPath(setting.ffmpegDir + "bin/ffmpeg" + (os.platform() === 'win32' ? '.exe' : '')),
        isDevMusic: false,
        isDevWallpaper: false,
        storgePath: storgePath,
        logLevel: 0,
        getDefaultPath: getDefaultPath,
        getStorgePath: getStorgePath,
        WEATHER_API_KEY: process.env.WEATHER_API_KEY
    };

    Object.assign(config, setting);


    return config;
}

module.exports = getConfig;