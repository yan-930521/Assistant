const Plugin = require("../utils/Plugin");
const fetch = require("node-fetch");

module.exports = new Plugin("explore")
    .handler("Get Weather", async (plugin, event, location) => {
        console.log("Get Weather", location);
        if(!location.latitude || !location.longitude) return;
        let url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+location.latitude+','+location.longitude+'&sensor=true';
        console.log(url);
        fetch(url).then((res) => res.json()).then((data) => {
          console.log(data);
        }).catch((err) => {
          console.log(err);
        });
    });
    /**
     * function displayLocation(latitude,longitude){
        var request = new XMLHttpRequest();

        var method = 'GET';
        var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude+'&sensor=true';
        var async = true;

        request.open(method, url, async);
        request.onreadystatechange = function(){
          if(request.readyState == 4 && request.status == 200){
            var data = JSON.parse(request.responseText);
            var address = data.results[0];
            document.write(address.formatted_address);
          }
        };
        request.send();
      };

      var successCallback = function(position){
        var x = position.coords.latitude;
        var y = position.coords.longitude;
        displayLocation(x,y);
      };

      var errorCallback = function(error){
        var errorMessage = 'Unknown error';
        switch(error.code) {
          case 1:
            errorMessage = 'Permission denied';
            break;
          case 2:
            errorMessage = 'Position unavailable';
            break;
          case 3:
            errorMessage = 'Timeout';
            break;
        }
        document.write(errorMessage);
      };
     */