/**
 * Created by maxime on 16/07/15.
 */

/**
 * Location settings manager (in the accordion)
 * @type {{knownLocations: Array, geocoder: null, map: null, initialize: Function, codeAddress: Function, ajaxAddUnauthorizedLocation: Function, populateUnauthorizedLocationsList: Function, ajaxGetUnauthorizedLocations: Function, bindDeleteButtons: Function}}
 */
var locationSettings = {
    knownLocations: [],

    geocoder : null,

    map : null,

    initialize: function(){
        this.geocoder = new google.maps.Geocoder();

        $("#addLocButton").click(this.codeAddress.bind(this));

        if(!google){
            Materialize.toast("No internet access found. Geocoding is disabled : you can not add locations.");
            return;
        }
        $("#locName").geocomplete();

    },

    codeAddress: function(){
        var self = this;
        if(typeof google === 'undefined'){
            return;
        }
        var address = document.getElementById('locName').value;
        this.geocoder.geocode({'address': address}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var lat = results[0].geometry.location.lat();
                var long = results[0].geometry.location.lng();
                self.ajaxAddUnauthorizedLocation(address, lat, long);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    },

    ajaxAddUnauthorizedLocation: function(address, lat, long){
        var self = this;
        if(typeof google === 'undefined'){
            Materialize.toast("Geocoding is disabled : it needs an internet connexion. Please connect you and restart the app.");
            return;
        }
        $.get("/addUnLocation", {"address": address, "lat": lat, "long": long}, function (data) {
            self.populateUnauthorizedLocationsList(data);
            $('#locName').val('');
        });
    },

    populateUnauthorizedLocationsList : function(data){
        this.knownLocations = data.locations;
        LocationFilter.populateLocationFilter();
        document.dispatchEvent(new Event('knownLocationOk'));

        willBeDeletedSwimlane.RAZAuthorizedLocations(); //Delete all old locations on the object used by the visualization

        var locs = data.locations;
        $("#locList").find("ul").html('');
        $.each(locs, function (i, item) {
            $("#locList").find("ul").append("<li><span class='col s10'>" + item.address.split(",")[0] + "</span><a href='#' class='col s2' ><img src='/images/glyphicons/png/glyphicons-257-delete.png' class='deleteLocButton' data-lat='" + item.lat + "'  data-long='" + item.lon + "'/></a></li>");
            willBeDeletedSwimlane.addAutorizedLocation(item.address, item.lat, item.lon); //add news locations to the visualiztion privacy object
        });

        this.bindDeleteButtons();
    },

    ajaxGetUnauthorizedLocations: function(){
        var self = this;
        $.get("/getUnLocation", function(data){
            self.populateUnauthorizedLocationsList(data);
        })
    },

    bindDeleteButtons: function(){
        var self = this;
        $(".deleteLocButton").on("click", function (event) {
            var lat =  event.target.attributes[2].value;
            var lon =  event.target.attributes[3].value;
            $.get("/removeLoc", {"lat":lat, "lon":lon}, function (data) {
                self.populateUnauthorizedLocationsList(data);
            });
        });
    }

};


if(typeof google !== 'undefined'){
    google.maps.event.addDomListener(window, 'load', locationSettings.initialize.bind(locationSettings));
    google.maps.event.addDomListener(window, 'load', locationSettings.ajaxGetUnauthorizedLocations.bind(locationSettings));
}
else{
    Materialize.toast("No internet access found. Geocoding is disabled : you can not add locations.", 6000);
}