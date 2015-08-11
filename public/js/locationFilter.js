/**
 * Created by Maxime on 29/07/2015.
 */





var distMinBetweenTwoLocations = 2000; // meters

var LocationFilter = {

    locationData: [],



    ajaxGetLocations: function () {


        var self = this;

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


    decorateLocationDataWithLocationNames: function () {
        if (!this.locationData) {
            console.log("WARNING: NO LOCATION DATA FOUND");
            return;
        }
        if(!knownLocations){
            console.log("NOTICE: No known location found.");
            return;
        }
        for (var i = 0; i != this.locationData.length; i++) {
            this.locationData[i].name = "";
            for (var k = 0; k != knownLocations.length; k++) {
                var onek = knownLocations[k];
                var dist = haversine({latitude: onek.lat, longitude: onek.lon}, {
                    latitude: this.locationData[i].lat,
                    longitude: this.locationData[i].lon
                }, {unit: 'meter'});
                if ((!isNaN(dist)) && dist <= distMinBetweenTwoLocations)
                    this.locationData[i].name = onek.address;
            }
            if( this.locationData[i].name == "")
                this.locationData[i].name = "unknow";
        }
    },

    initLocationFilter: function () {
        var self = this;
        return new Promise(function (ok, ko) {
            self.ajaxGetLocations().then(function (res) {
                self.locationData = res;
                self.decorateLocationDataWithLocationNames();
                self.filterLocations();
                ok();
            });

        })

    },

    initAndPrint: function(){
        var self = this;
        if(!knownLocations){
            document.addEventListener('knownLocationOk', function(e){
                self.initAndPrint();
            });
            return;
        }
      this.initLocationFilter().then(function(){

          printLocationsSwimlanes();
      })
    },




    removeFilteredAndColorForAllLocations : function(){
        for (i = 0; i != this.locationData.length; i++) {
            var one = this.locationData[i];
                this.locationData[i].color = NaN;
                this.locationData[i].filtered = false;
        }
    },

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
            var addr = ceLieux.attr("data-name");



            var c = legend_getAColor(addr.split(',')[0]);


            for (i = 0; i != self.locationData.length; i++) {
                var one = self.locationData[i];
                if (one.name == addr || (addr == 'unknow address' && one.name == "unknow")) {
                    self.locationData[i].color = c;
                    self.locationData[i].filtered = true;
                }
            }
            
        })
    },

    unBindLocationFilterChange: function () {
        $(".filter.location").unbind("change");
    },


    bindLocationFilterChange: function () {
        var self = this;
        this.unBindLocationFilterChange();
        $(".filter.location").change(function (e) {
            var lat = $(e.target).attr("data-lat");
            var long = $(e.target).attr("data-lon");
            var addr = $(e.target).attr("data-name");
            if ($(e.target).is(':checked')) {
                if (!self.locationData) {
                    alert("Sorry, no location data found. Are you sure you used the good version of SelfSpy ?");
                    return;
                }
                var c = legend_getAColor(addr.split(',')[0]);
                //add color and 'filtred' attribute
                for (i = 0; i != self.locationData.length; i++) {
                    var one = self.locationData[i];
                    if (one.name == addr || (addr == 'unknow address' && one.name == "unknow")) {
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
                removeLegend(addr.split(',')[0]);
                //remove color and 'filtred' attribute
                for (i = 0; i != self.locationData.length; i++) {
                    var one = self.locationData[i];
                    if (one.name == addr || (addr == 'unknow address' && one.name == "unknow")) {
                        one.color = '';
                        one.filtered = false;
                    }
                }
                printLocationsSwimlanes();
            }
        });

    },


    populateLocationFilter: function () {
        $('#locationFilter').html('');
        knownLocations.forEach(function (one) {
            $("#locationFilter").append("<li><input type='checkbox' id='" + one.lat + "_" + one.lon + "'  data-lat='" + one.lat + "' data-lon='" + one.lon + "' data-name='" + one.address + "' class='filter location'/><label for='" + one.lat + "_" + one.lon + "'>" + one.address.split(',')[0] + "</label></li>");
        });
        $("#locationFilter").append("<li><input type='checkbox' id='unknow' data-lat='unknow' data-lon='unknow' data-name='unknow address' class='filter location'><label for='unknow'>Unknow Address</label></li>");
        this.bindLocationFilterChange();
    }


};


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
