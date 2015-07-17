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
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var lat = results[0].geometry.location.lat();
            var long = results[0].geometry.location.lng();
            ajaxAddUnLocation(address, lat, long);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function ajaxAddUnLocation(address, lat, long)
{
    $.get("/addUnLocation", {"address" : address, "lat" : lat, "long" : long});

    //TODO MAJ
}


function populateUnList(data)
{
    var names = data.names;
    $("#appList ul").html('');
    $.each(names, function (i, item) {
        $("#appList ul").append("<li>" + item.name + "<a href='#' ><img src='/images/glyphicons/png/glyphicons-257-delete.png' class='deleteButton' data-appName='"+item.name+"'/></a></li>");
    });

    bindDleteButtons();
}


google.maps.event.addDomListener(window, 'load', initialize);