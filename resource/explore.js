window.explore = new MenuPlugin("explore")
    .register("Get Weather", (plugin) => {
        if (!navigator.geolocation) {
            console.log("not support");
            return;
        }
        navigator.geolocation.getCurrentPosition((positopn) => {
            plugin.invoke("Get Weather", positopn);
        }, (error) => {
            console.log(error)
        }, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        });
        
    })
    .onData((event, data) => {
        if (data.type == "Get Weather") {
            data = data.data;
            console.log(data);
        }
    });