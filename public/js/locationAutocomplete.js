/**
 * Created by maxime on 16/07/15.
 */


$("#locName").geocomplete();

var geocoder;
var map;
function initialize() {
    geocoder = new google.maps.Geocoder();
    $("#addLocButton").click(codeAddress);
}

function codeAddress() {
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
    $.get("/addUnLocation", {"address": address, "lat": lat, "long": long}, function (data) {
        populateUnLocationsList(data);
        $('#locName').val('');
    });
}

//Authorized or not ? that is the question.
function populateUnLocationsList(data) {


    knownLocations = data.locations;
    populateLocationFilter();

    privacyFilter_RAZAuthorizedLocations(); //Delete all old locations ion the object used by the visualization

    var locs = data.locations;
    $("#locList ul").html('');
    $.each(locs, function (i, item) {
        $("#locList ul").append("<li>" + item.address.split(",")[0] + "<a href='#' ><img src='/images/glyphicons/png/glyphicons-257-delete.png' class='deleteLocButton' data-lat='" + item.lat + "'  data-long='" + item.lng + "'/></a></li>");
        privacyFilter_addAutorizedLocation(item.address, item.lat, item.lng); //add news locations to the visualiztion privacy object
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
        var lng =  event.target.attributes[3].value;
        $.get("/removeLoc", {"lat":lat, "lng":lng}, function (data) {
            populateUnLocationsList(data);
        });
    });
}


google.maps.event.addDomListener(window, 'load', initialize);
google.maps.event.addDomListener(window, 'load', ajaxGetUnLocations);