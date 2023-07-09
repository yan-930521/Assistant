const weatherTypes = {
    isThunderstorm: [15, 16, 17, 18, 21, 22, 33, 34, 35, 36, 41],
    isClear: [1],
    isCloudyFog: [25, 26, 27, 28],
    isCloudy: [2, 3, 4, 5, 6, 7],
    isFog: [24],
    isPartiallyClearWithRain: [
        8, 9, 10, 11, 12,
        13, 14, 19, 20, 29, 30,
        31, 32, 38, 39,
    ],
    isSnowing: [23, 37, 42],
};
const weatherIcons = {
    day: {
        isThunderstorm: "./",
        isClear: "./",
        isCloudyFog: "./",
        isCloudy: "./",
        isFog: "./",
        isPartiallyClearWithRain: "./",
        isSnowing: "./",
    },
    night: {
        isThunderstorm: "./",
        isClear: "./",
        isCloudyFog: "./",
        isCloudy: "./",
        isFog: "./",
        isPartiallyClearWithRain: "./",
        isSnowing: "./",
    },
};
const weatherCodeToType = (weatherCode) => {
    const weatherType = Object.entries(weatherTypes).find(([, weatherCodes]) =>
        weatherCodes.includes(Number(weatherCode))
      ) || null;
  
    return weatherType;
  };
window.explore = new MenuPlugin("explore")
    .register("Get Weather", async (plugin) => {
        try {
            const weatherData = await plugin.invoke("Get Weather", {});
            console.log(weatherData);
            for(let i in weatherData) {
                if(!document.getElementById(i)) continue;
    
                if(i != "observationTime") document.getElementById(i).innerHTML = weatherData[i];
                else document.getElementById(i).innerHTML = new Date(weatherData[i]).toLocaleString().split(" ")[1];
            }

            window.openMenu('.menu-weather');
        } catch(error) {
            console.log(error);
        }
        

        
        
    })
    .onData((event, data) => {
        if (data.type == "Get Weather") {
            data = data.data;
            console.log(data);
        }
    });