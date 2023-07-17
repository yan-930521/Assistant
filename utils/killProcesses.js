const { exec } = require('child_process');
const Logger = require("./Logger");

/**
 * 清理同名的程序
 * @param {string} processName 程式名稱
 * @returns 
 */
const killProcesses = (processName = "Sakura Assistant.exe") => {
    return new Promise((res, rej) => {
        exec(`tasklist | find /i "${processName}"`, (error, stdout, stderr) => {
            if (error || stderr) return rej(error || stderr);

            let mainProcess = process.pid.toString();

            const processIds = stdout.split('\n').map((line) => {
                return line.replace(processName, "").trim().split(' ')[0]
            }).filter((id) => id != "" && id != mainProcess);

            Logger.log("info", "processIds", processIds, "mainProcess", mainProcess);

            processIds.forEach((id) => {
                exec(`taskkill /f /pid ${id} `, (error, stdout, stderr) => {
                    if (error || stderr) return rej(error || stderr);
                    res();
                })
            });
        });
    });
}

module.exports = killProcesses;