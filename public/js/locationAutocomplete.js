/**
 * Created by maxime on 16/07/15.
 */

if(typeof google !== 'undefined')
    $("#locName").geocomplete();
else
    Materialize.toast("No internet access found. Geocoding is disabeld : you can not add locations.", 6000);

var geocoder;
var map;
function initialize() {

    $("#addLocButton").click(codeAddress);
    if(!google){
        Materialize.toast("No internet access found. Geocoding is disabeld : you can not add locations.");
        return;
    }
    geocoder = new google.maps.Geocoder();
}

function codeAddress() {
    if(typeof google === 'undefined'){
        return;
    }
    var address = document.getElementById('locName').value;
    geocoder.geocode({'address': address}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var lat = results[0].geometry.location.lat();
            var long = results[0].geometry.location.lng();
            ajaxAddUnLocation(address, lat, long);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function ajaxAddUnLocation(address, lat, long) {
    if(typeof google === 'undefined'){
        Materialize.toast("Geocoding is disabeld : it needs an internet connexion. Please connect you and restart the app.");
        return;
    }
    $.get("/addUnLocation", {"address": address, "lat": lat, "long": long}, function (data) {
        populateUnLocationsList(data);
        $('#locName').val('');
    });
}

//Authorized or not ? that is the question.
function populateUnLocationsList(data) {


    knownLocations = data.locations;
    LocationFilter.populateLocationFilter();
    document.dispatchEvent(new Event('knownLocationOk'));

    privacyFilter_RAZAuthorizedLocations(); //Delete all old locations ion the object used by the visualization

    var locs = data.locations;
    $("#locList ul").html('');
    $.each(locs, function (i, item) {
        $("#locList ul").append("<li><span class='col s10'>" + item.address.split(",")[0] + "</span><a href='#' class='col s2' ><img src='/images/glyphicons/png/glyphicons-257-delete.png' class='deleteLocButton' data-lat='" + item.lat + "'  data-long='" + item.lon + "'/></a></li>");
        privacyFilter_addAutorizedLocation(item.address, item.lat, item.lon); //add news locations to the visualiztion privacy object
    });

    bindDleteLocButtons();
}

var knownLocations; // lat lng name

function ajaxGetUnLocations(){
    $.get("/getUnLocation", function(data){
        populateUnLocationsList(data);
    })
}

//remove
function bindDleteLocButtons() {
    $(".deleteLocButton").on("click", function (event) {
        var lat =  event.target.attributes[2].value;
        var lon =  event.target.attributes[3].value;
        $.get("/removeLoc", {"lat":lat, "lon":lon}, function (data) {
            populateUnLocationsList(data);
        });
    });
}

if(typeof google !== 'undefined'){
    google.maps.event.addDomListener(window, 'load', initialize);
    google.maps.event.addDomListener(window, 'load', ajaxGetUnLocations);
}