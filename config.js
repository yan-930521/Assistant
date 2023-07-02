const fs = require("fs");
const os = require('os');

/**
 * 包含設定值的物件
 * @typedef {Object} Config
 * @property {number} port - 連接埠號碼
 * @property {object} window - 各視窗的大小設定
 * @property {string} tmpFileForMusic - 用來暫存mp3檔案的地方
 * @property {string} ffmpegPath - ffmpeg 的路徑
 * @property {boolean} isDevMusic - mp3系統是否是測試狀態
 * @property {object} database - 資料庫相關的設定
 * @property {string} database.name - 資料庫的名稱
 * @property {string} database.path - 資料庫相關的設定的路徑


/**
 * 取得設定檔的值
 * @returns {Config}
 */
const getConfig = () => {

    /**
     * @type {Config}
     */
    const config = {
        ffmpegPath: os.platform() === 'win32'? './ffmpeg/bin/ffmpeg.exe': './ffmpeg/bin/ffmpeg',
        isDevMusic: false
    };

    const setting = JSON.parse(
        fs.readFileSync("./setting.json", "utf-8")
    );

    Object.assign(config, setting);

    
    return config;
}

module.exports = getConfig;