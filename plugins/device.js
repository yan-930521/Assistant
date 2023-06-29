const Plugin = require("../utils/Plugin");

const si = require('systeminformation');

module.exports = new Plugin("device")
    .register("System Info", async (plugin, event) => {
        console.log("System Info");
        if(plugin.gettingSystemInfo) return;
        plugin.gettingSystemInfo = true;
        const data = {};
        const dataArray = [
            "system",
            "bios",
            "baseboard",
            "chassis",
            "cpu",
            "mem",
            "memLayout",
            "battery",
            "graphics",
            "osInfo",
            "diskLayout",
            "blockDevices",
            "fsSize",
            "usb",
            "audio",
            "networkInterfaces",
            "networkGatewayDefault",
            "wifiNetworks",
            "wifiInterfaces",
            "bluetoothDevices"
        ];
        const loadData = (i) => {
            if(dataArray[i]) {
                si[dataArray[i]]().then((d) => {
                    data[dataArray[i]] = d;
                    event.reply(plugin.ipcEvent.name, plugin.createPkg("System Info-reply", data));
                    i++;
                    loadData(i);
                });
            } else {
                plugin.gettingSystemInfo = false;
            }
        }

        loadData(0);
    })
    .handler("Create Window", async (plugin, event, aliveTime) => {
        
    })
    .handler("Awake Observer", async (plugin, event, aliveTime) => {
        let win = plugin.getData("window");
        if (!win || !win.mainWindow) return false;
        const observer = si.observe({
            cpuCurrentSpeed: '*',
            cpuTemperature: '*',
            mem: 'total, free, used, active',
            battery: 'isCharging, currentCapacity, percent, timeRemaining, acConnected',
            fsSize: 'size, used, available, use'
        }, 3000, (data) => {
            win.mainWindow.webContents.send(plugin.ipcEvent.name, plugin.createPkg("Device Data Update", data));
        });

        setTimeout(() => {
            clearInterval(observer);
        }, aliveTime);

        return true;
    })

