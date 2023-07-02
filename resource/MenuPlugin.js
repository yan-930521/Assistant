var { ipcRenderer } = require('electron');

class MenuPlugin {
    constructor(name) {
        this.name = name;

        this.events = {};

        ipcRenderer.on(this.name, this.ondata);
    }

    register = (type, callback) => {
        this.events[type] = callback;

        return this;
    }

    onEvent = (type) => {
        window.menuStatus = type;
        window.closeAllSubMenu();
        this.events[type](this);
    }
    
    handleHTML = () => {
        const htmlTemplate = `<li id="EVENT" onclick='${this.name}.onEvent("EVENT");'>EVENT</li>`;
        let htmls = "";
        for (let event in this.events)
            htmls += htmlTemplate.replaceAll("EVENT", event);
        return htmls;
    }

    send = (type, data) => {
        ipcRenderer.send(this.name, this.createPkg(type, data));
    }

    invoke = (type, data) => {
        console.log(this.createPkg(type, data))
        return ipcRenderer.invoke(this.name, this.createPkg(type, data));
    }

    createPkg = (type, data) => {
        return {
            type,
            data
        }
    }

    onData = (callback) => {
        this.ondata = callback;
        return this;
    }

    ondata = (...data) => {
        console.log(...data);
    }
}