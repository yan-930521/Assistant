var { ipcRenderer } = require('electron');

var settingList = {}

window.settingEditor = new MenuPlugin("settingEditor")
    .register("Edit Setting", async (plugin) => {
        let setting = await ipcRenderer.invoke("tool", {
            type: "Get Setting",
            data: {}
        });

        let innerhtml = `<a href="#"  id="input-setting-check" class="fa-solid fa-check" style="color: #ffffff;"></a>`;
        let htmlTemplate = `<li>KEY: <input class="field-input input-setting" id="KEY" placeholder="VALUE"></input></li>`;
        for(let i in setting.allowSet) {
            let key = setting.allowSet[i];
            settingList[key] = setting[key].toString();
            innerhtml += htmlTemplate.replaceAll("KEY", key).replace("VALUE", setting[key]);
        }
        document.querySelector(".menu-setting-list").innerHTML = innerhtml;
        document.querySelectorAll(".input-setting").forEach((ele) => {
            ele.value = settingList[ele.id];
        });
        document.getElementById("input-setting-check").onclick = () => {
            for(let key in settingList) {
                let value = document.getElementById(key).value;
                if(settingList[key] != value) {
                    console.log(key, value);
                    ipcRenderer.invoke("tool", {
                        type: "Set Setting",
                        data: {key, value}
                    }).then((res) => {
                        if(res) {
                            settingList[key] = value;
                        } else {
                            document.getElementById(key).value = settingList[key];
                        }
                    })
                }
            }
        }
        //"input-setting"
        window.openMenu('.menu-setting');
    })
    .onData((event, data) => {
    });