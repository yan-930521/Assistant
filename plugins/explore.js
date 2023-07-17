const Plugin = require("../utils/Plugin");
const Logger = require("../utils/Logger");

const fetch = require("node-fetch");

const { getConfig } = require("../config");

module.exports = new Plugin("explore")
    .handler("Get Weather", async (plugin, event) => {
        Logger.log("info", "Get Weather");
        const { WEATHER_API_KEY, weatherLocationName, weatherObservatory } = getConfig();
        const currentWeather = await fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${WEATHER_API_KEY}&locationName=${weatherObservatory}`)
            .then((response) => response.json())
            .then((data) => {
                const locationData = data.records.location[0];

                const weatherElements = locationData.weatherElement.reduce(
                    (neededElements, item) => {
                        if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
                            neededElements[item.elementName] = item.elementValue;
                        }
                        return neededElements;
                    },
                    {},
                );

                return {
                    observationTime: locationData.time.obsTime,
                    locationName: locationData.locationName,
                    temperature: weatherElements.TEMP,
                    windSpeed: weatherElements.WDSD,
                    humid: weatherElements.HUMD,
                };
            }).catch(err => {
                Logger.log("error", err);
            });

        const weatherForecast = await fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${WEATHER_API_KEY}&locationName=${weatherLocationName}`)
            .then((response) => response.json())
            .then((data) => {
                const locationData = data.records.location[0];

                const weatherElements = locationData.weatherElement.reduce(
                    (neededElements, item) => {
                        if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
                            neededElements[item.elementName] = item.time[0].parameter;
                        }
                        return neededElements;
                    },
                    {},
                );

                return {
                    description: weatherElements.Wx.parameterName,
                    weatherCode: weatherElements.Wx.parameterValue,
                    rainPossibility: weatherElements.PoP.parameterName,
                    comfortability: weatherElements.CI.parameterName,
                };
            }).catch(err => {
                Logger.log("error", err);
            });

            if(weatherForecast && weatherForecast) Object.assign(weatherForecast, currentWeather)

        return weatherForecast
    });