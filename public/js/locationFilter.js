/**
 * Created by Maxime on 29/07/2015.
 */

//distance between two places
var distMinBetweenTwoLocations = 2000; // meters

var LocationFilter = {

    /**
     * Array that will contain all locations (lat,lng, name)
     */
    locationData: [],

    ajaxGetLocations: function () {

        return new Promise(function(ok, ko){
            $.get("/getGeoloc", {start: interVal.start, stop: interVal.stop}, function (data) {
                if (data.error == true) {
                    console.log("WARNING : NO LOCATION DATA FOUND. Error : " + data.error);
                    ko();
                }
                ok(data.result);
            });
        })
    },


    /**
     * Give a name to all locations in locationData
     * To avoid long name if we use only address
     */
    decorateLocationDataWithLocationNames: function () {
        if (!this.locationData) {
            console.log("WARNING: NO LOCATION DATA FOUND");
            return;
        }
        if(!locationSettings.knownLocations){
            console.log("NOTICE: No known location found.");
            return;
        }
        for (var i = 0; i != this.locationData.length; i++) {
            this.locationData[i].name = "";
            for (var k = 0; k != locationSettings.knownLocations.length; k++) {
                var onek = locationSettings.knownLocations[k];
                var dist = haversine({latitude: onek.lat, longitude: onek.lon}, {
                    latitude: this.locationData[i].lat,
                    longitude: this.locationData[i].lon
                }, {unit: 'meter'});
                if ((!isNaN(dist)) && dist <= distMinBetweenTwoLocations)
                    this.locationData[i].name = onek.address;
            }
            if( this.locationData[i].name == "")
                this.locationData[i].name = "unknown";
        }
    },

    /**
     * Init filter
     * @returns {Promise}
     */
    initLocationFilter: function () {
        var self = this;
        return new Promise(function (ok) {
            self.ajaxGetLocations().then(function (res) {
                self.locationData = res;
                self.decorateLocationDataWithLocationNames();
                self.filterLocations();
                willBeDeletedSwimlane.checkLocations();
                ok();
            });

        })

    },

    /**
     * Init the filter and then print it.
     */
    initAndPrint: function(){
        var self = this;
        if(!locationSettings.knownLocations){
            document.addEventListener('knownLocationOk', function(){
                self.initAndPrint();
            });
            return;
        }
        this.initLocationFilter().then(function(){
              printLocationsSwimlanes();
        });
    },

    /**
     * Clean up all filter's location
     */
    removeFilteredAndColorForAllLocations : function(){
        for (var i = 0; i != this.locationData.length; i++) {
            this.locationData[i].color = NaN;
            this.locationData[i].filtered = false;
        }
    },

    /**
     * Print all the checked locations
     */
    filterLocations: function () {
        this.removeFilteredAndColorForAllLocations();

        var self = this;

        $(".filter.location").each(function(){
            var ceLieux = $(this);

            if(!ceLieux.is(':checked')){ //ugly workly
                return;
            }

            var lat = ceLieux.attr("data-lat");
            var long = ceLieux.attr("data-lon");
            var address = ceLieux.attr("data-name");

            var c = Legend.getAColor(address.split(',')[0]);


            for (var i = 0; i != self.locationData.length; i++) {
                var one = self.locationData[i];
                if (one.name == address || (address == 'unknow address' && one.name == "unknow")) {
                    self.locationData[i].color = c;
                    self.locationData[i].filtered = true;
                }
            }
            
        })
    },

    /**
     * Unbind location filter
     */
    unBindLocationFilterChange: function () {
        $(".filter.location").unbind("change");
    },


    /**
     * Bind filter
     */
    bindLocationFilterChange: function () {
        var self = this;

        this.unBindLocationFilterChange();

        $('.filter.location').change(function (e) {

            var lat = $(e.target).attr("data-lat");
            var long = $(e.target).attr("data-lon");
            var address = $(e.target).attr("data-name");

            if ($(e.target).is(':checked')) {
                if (!self.locationData) {
                    alert("Sorry, no location data found. Are you sure you used the good version of SelfSpy ?");
                    return;
                }
                var c = Legend.getAColor(address.split(',')[0]);

                //add color and 'filtered' attribute
                for (var i = 0; i != self.locationData.length; i++) {
                    var _one = self.locationData[i];
                    if (_one.name == address || (address == 'unknown address' && _one.name == "unknown")) {
                        self.locationData[i].color = c;
                        self.locationData[i].filtered = true;
                    }
                }
                printLocationsSwimlanes();
            }
            else {
                if (!self.locationData) {
                    return;
                }
                Legend.removeLegend(address.split(',')[0]);
                //remove color and 'filtered' attribute
                for (i = 0; i != self.locationData.length; i++) {
                    var one = self.locationData[i];
                    if (one.name == address || (address == 'unknown address' && one.name == "unknown")) {
                        one.color = '';
                        one.filtered = false;
                    }
                }
                printLocationsSwimlanes();
            }
        });

    },

    /**
     * Print all location inside the accordion
     */
    populateLocationFilter: function () {
        $('#locationFilter').html('');
        locationSettings.knownLocations.forEach(function (one) {
            $("#locationFilter").append("<li><input type='checkbox' id='" + one.lat + "_" + one.lon + "'  data-lat='" + one.lat + "' data-lon='" + one.lon + "' data-name='" + one.address + "' class='filter location'/><label for='" + one.lat + "_" + one.lon + "'>" + one.address.split(',')[0] + "</label></li>");
        });

        $("#locationFilter").append("<li><input type='checkbox' id='unknow' data-lat='unknown' data-lon='unknown' data-name='unknow address' class='filter location'><label for='unknow'>Unknow Address</label></li>");

        this.bindLocationFilterChange();
    }


};

/**
 * Calculate circle distance between two points considering longitude and latitude
 */
var haversine = (function () {

    // convert to radians
    var toRad = function (num) {
        return num * Math.PI / 180
    };

    return function haversine(start, end, options) {
        var earth_radius = {
            'km': 6371,
            'meter': 6371000,
            'mile': 3960
        };
        options = options || {};

        var R = earth_radius['km'];
        if (options.unit in earth_radius)
            R = earth_radius[options.unit];

        var dLat = toRad(end.latitude - start.latitude);
        var dLon = toRad(end.longitude - start.longitude);
        var lat1 = toRad(start.latitude);
        var lat2 = toRad(end.latitude);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        if (options.threshold) {
            return options.threshold > (R * c)
        } else {
            return R * c
        }
    }

})();
