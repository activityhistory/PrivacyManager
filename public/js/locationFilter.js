/**
 * Created by Maxime on 29/07/2015.
 */


var distMinBetweenTwoLocations = 2000; // meters
var locationData = [];

function ajaxGetLocations() {
    $.get("/getGeoloc", {start: interVal.start, stop: interVal.stop}, function (data) {
        if (data.error == true) {
            console.log("WARNING : NO LOCATION DATA FOUND. Error : " + data.error);
            return;
        }
        locationData = data.result;
        decorateLocationDataWithLocationNames();
    });
}

function decorateLocationDataWithLocationNames() {
    if(!locationData){
        console.log("WARNING: NO LOCATION DATA FOUND");
        return;
    }
    for(var i = 0; i!= locationData.length ; i++)
    {
            var one = locationData[i];
            for(var k = 0 ; k != knownLocations.length ; k++){
                var onek = knownLocations[k];
                if (haversine({latitude :onek.lat, longitude : onek.lng}, {latitude : one.lat, longitude : one.lon}, {unit : 'meter'}) <= distMinBetweenTwoLocations)
                    one.name = onek.address;
                else
                    one.name = "unknow";
            }

    }
}


var haversine = (function() {

    // convert to radians
    var toRad = function(num) {
        return num * Math.PI / 180
    };

    return function haversine(start, end, options) {
        var earth_radius = {
            'km': 6371,
            'meter': 6371000,
            'mile': 3960
        };
        options   = options || {};

        var R = earth_radius['km'];
        if(options.unit in earth_radius)
            R = earth_radius[options.unit];

        var dLat = toRad(end.latitude - start.latitude);
        var dLon = toRad(end.longitude - start.longitude);
        var lat1 = toRad(start.latitude);
        var lat2 = toRad(end.latitude);

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        if (options.threshold) {
            return options.threshold > (R * c)
        } else {
            return R * c
        }
    }

})();


function populateLocationFilter(){

    decorateLocationDataWithLocationNames();

    $('#locationFilter').html('');
    knownLocations.forEach(function(one){
        $("#locationFilter").append("<li><input type='checkbox' id='" + one.lat + "_" + one.lng + "'/><label for='" + one.lat + "_" + one.lng + "' data-lat='" + one.lat + "' data-lon='" + one.lng + "' data-name='" + one.address + "' class='filter location'>" + one.address.split(',')[0] + "</label></li>");
    });
    $("#locationFilter").append("<li><input type='checkbox' id='unknow'><label for='unknow' data-lat='unknow' data-lon='unknow' data-name='unknow address' class='filter location'>Unknow Address</label></li>");
    $(".filter.location").change(function (e) {
        var lat = $(e.target).attr("data-lat");
        var long = $(e.target).attr("data-lon");
        var addr = $(e.target).attr("data-name");
        if($(e.target).is(':checked')) {
            if(!locationData){
                alert("Sorry, no location data found. Are you sure you used the good version of SelfSpy ?");
                return;
            }
            var c = addLegend(addr.split(',')[0]);
            //add color and 'filtred' attribute
            for(i=0; i!= locationData.length; i++){
                var one = locationData[i];
                if(one.name == addr || (addr == 'unknow address' && one.name == "unknow")) {
                    console.log("11");
                    locationData[i].color = c;
                    locationData[i].filtered = true;
                }
            }
            notifylocationFilterChanged();
        }
        else
        {
            if(!locationData){
            return;
        }
            removeLegend(addr.split(',')[0]);
            //remove color and 'filtred' attribute
            for(i=0; i!= locationData.length; i++){
                var one = locationData[i];
                if(one.name == addr || (addr == 'unknow address' && one.name == "unknow")) {
                    one.color = '';
                    one.filtered = false;
                }
            }
            notifylocationFilterChanged();
        }
    });
}