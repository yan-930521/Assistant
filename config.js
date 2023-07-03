const fs = require("fs");
const os = require('os');
const path = require("path");

/**
 * @typedef {object} Config
 * @property {number} port - 連接埠號碼
 * @property {object} window - 各視窗的大小設定
 * @property {string} tmpFileForMusic - 用來暫存mp3檔案的地方
 * @property {string} ffmpegPath - ffmpeg 的路徑
 * @property {boolean} isDevMusic - mp3系統是否是測試狀態
 * @property {object} database - 資料庫相關的設定
 * @property {string} database.name - 資料庫的名稱
 * @property {string} database.path - 資料庫相關的設定的路徑
 * @property {string} storgePath - 儲存檔案的資料夾路徑
 * @property {string} storgeDir - 儲存檔案的資料夾名稱
 * @property {GetPathCallback} getPath - 獲取檔案的絕對路徑
 */

/**
 * 獲取檔案的絕對路徑
 * @callback GetPathCallback
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
            getPath("./setting.json"),
            "utf-8"
        )
    );

    const getPath = (p) => {
        return path.join(__dirname, p);
    }

    /**
     * @type {Config} - 包含設定值的物件
     */
    const config = {
        ffmpegPath: getPath(os.platform() === 'win32' ? './ffmpeg/bin/ffmpeg.exe' : './ffmpeg/bin/ffmpeg'),
        isDevMusic: false,
        storgePath: path.join(
            __dirname,
            setting.storgeDir
        ),
        getPath: getPath
    };

    config.getPath("a");

    Object.assign(config, setting);


    return config;
}

module.exports = getConfig;