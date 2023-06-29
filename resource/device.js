var { ipcRenderer } = require('electron');

const device = {
    events: {
        "System Info": () => {
            ipcRenderer.on("device", (event, data) => {
                if(data.type == "System Info-reply") {
                    data = data.data;
                    console.log(data)
                }
            });
            ipcRenderer.send("device", {
                type: "System Info",
                data: {}
            })

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
