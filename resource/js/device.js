window.device = new MenuPlugin("device")
    .register("System Info", (plugin) => {
        plugin.invoke("Toggle System Info", {});
    })
    .register("Device State", (plugin) => {
        window.openMenu(".menu-state");
        document.querySelector(".menu-state");

        plugin.invoke("Toggle Observer", { aliveTime: null });
    })
    .onData((event, data) => {
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
            document.getElementById("BATTERY").innerHTML = (data.battery.isCharging ? `<i class="fa-solid fa-plug" style="color: #ffffff;"></i> ` : "") + (data.battery.percent) + "%";
        }
    });