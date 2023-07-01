const Plugin = require("../utils/Plugin");

const si = require('systeminformation');

module.exports = new Plugin("device")
    .register("System Info", async (plugin, event) => {
        console.log("System Info");
        if (plugin.gettingSystemInfo) return;
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
            if (dataArray[i]) {
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
    .handler("Toggle System Info", async (plugin, event, aliveTime) => {
        console.log("Toggle System Info");
        let win = plugin.getData("window");
        if (win.widgetWindow) {
            if (win.widgetWindow.isHide) {
                win.widgetWindow.isHide = false;
                win.widgetWindow.show();
            } else {
                win.widgetWindow.isHide = true;
                win.widgetWindow.hide();
            }
            return false;
        } else {
            win.createWidgetWindow();
            return true;
        }
    })
    .handler("Toggle Observer", async (plugin, event, { aliveTime }) => {
        if(plugin.awaked) {
            console.log("Close Observer");
            if(plugin.observer) clearInterval(plugin.observer);
            plugin.awaked = false;
            return;
        };
        console.log("Awake Observer", aliveTime?aliveTime:"");
        plugin.awaked = true;
        let win = plugin.getData("window");
        if (!win || !win.mainWindow) return false;
        plugin.observer = si.observe({
            currentLoad: "currentLoad",
            mem: 'total, free, used, active',
            battery: 'isCharging, currentCapacity, percent, timeRemaining',
            fsSize: 'fs, size, used, available, use'
        }, 5000, async (data) => {
            win.mainWindow.webContents.send(plugin.ipcEvent.name, plugin.createPkg("Device Data Update", data));
        });

        if (!isNaN(aliveTime) && aliveTime > 0) {
            setTimeout(() => {
                clearInterval(plugin.observer);
                plugin.awaked = false;
            }, aliveTime);
        }

        return true;
    })

