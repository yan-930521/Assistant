var { ipcRenderer } = require('electron');

ipcRenderer.on("device", (event, data) => {
    if (data.type == "Device Data Update") {
        data = data.data;
        console.log(data);
        document.getElementById("CPU").innerText = data.currentLoad.currentLoad.toFixed(1) + "%";
        document.getElementById("MEMORY").innerText = ((data.mem.used / data.mem.total) * 100).toFixed(1) + "%";
        let available = 0, size = 0;
        data.fsSize.map((val) => {
            available += val.available;
            size += val.size;
        });
        document.getElementById("DRIVE").innerText = ((available / size) * 100).toFixed(1) + "%";
        document.getElementById("BATTERY").innerHTML = (data.battery.isCharging ? `<i class="fa-solid fa-plug" style="color: #ffffff;"></i> `:"") + (data.battery.percent) + "%";
    }
});

const device = {
    events: {
        "System Info": () => {
            ipcRenderer.invoke("device", {
                type: "Toggle System Info",
                data: {}
            });
        },
        "Device State": () => {
            window.openMenu(".menu-state");
            document.querySelector(".menu-state");
            
            ipcRenderer.invoke("device", {
                type: "Toggle Observer",
                data: {
                    aliveTime: null
                }
            });
        }
    },
    onEvent: (event) => {
        window.menuStatus = event;
        window.closeAllSubMenu();
        device.events[event]();
    },
    handleHTML: () => {
        const htmlTemplate = `<li id="EVENT" onclick='device.onEvent("EVENT");'>EVENT</li>`;
        let htmls = "";
        for (let event in device.events)
            htmls += htmlTemplate.replaceAll("EVENT", event);
        return htmls;
    }
}

window.device = device;
