/**
 * Created by Maxime on 28/07/2015.
 */


var privacyParams = {
    unApps : [],
    auTimes : {from : "undefined", to : "undefined", weekEnd : "undefined"},
    auLocations : []
};

var willBeDeletedData = []; //TODO : rename it to willBeDeletedApps
var willBeDeletedLocations = [];

var willBeDeletedColor = legend_getAColor("Will be deleted");

function privacyFilter_RAZunApps(){
    privacyParams.unApps = [];
}

function privacyFilter_RAZAuthorizedTimes(){
    privacyParams.auTimes = {from : "undefined", to : "undefined", weekEnd : "undefined"};
}

function privacyFilter_RAZAuthorizedLocations(){
    privacyParams.auLocations = [];
}

function privacyFilter_addUnApp(appName) {
    privacyParams.unApps.push(appName);
}

function privacyFilter_setAuthorizedTimes(dateFrom, dateTo, weekend){
    privacyParams.auTimes = { from : dateFrom, to : dateTo, weekEnd: weekend};
}

function privacyFilter_addAutorizedLocation(locationName, _lat, _long){
    privacyParams.auLocations.push({name: locationName, lat : _lat, long : _long})
}


function privacyFilter_checkLocations(){
    willBeDeletedLocations = [];
    //LocationFilter.locationData); .name
    //privacyParams.auLocations);  . name

    LocationFilter.locationData.forEach(function(locationRange){
        if(locationRange.name == "unknow")
        {
            willBeDeletedLocations.push({start:locationRange.from,stop:locationRange.to, caused_by:"location"});
        }

    });

    if(willBeDeletedLocations.length != 0)
    {
        var chk = $("#unknow.filter.location");
        if(!chk.is(':checked'))
        {
            chk.prop('checked', true);
            chk.trigger("change");
        }
    }

    MAJWillBeDeletedSwimlane();
}

function privacyFilter_checkDeletedApps() {
    var filterdApps = getFilterdApps();
    willBeDeletedData = filterdApps;
    MAJWillBeDeletedSwimlane();
    //extract apps names that will delete some parts
    var appNames = [];
    for (var i = 0; i != filterdApps.length; i++) {
        var an = filterdApps[i].name;
        var ajouter = true;
        for (var k = 0; k != appNames.length; k++) {
            if (appNames[k] == an)
                ajouter = false;
        }
        if (ajouter == true)
            appNames.push(an);
    }
    //print the filter swimlane of apps that delete some parts
    appNames.forEach(function (one) {
        var inp = $("input[value='" + one + "']");
        if (!inp.is(':checked')) {
            inp.prop('checked', true);
            inp.trigger("change");
        }
    });
}
var willBeDeletedByTime = [];
function privacyFilter_checkUnauthorizedTimes(){
    willBeDeletedByTime = getUnauthorizedTimeRanges();

    willBeDeletedByTime.forEach(function(one){
        one.caused_by = "Time";
    });

    if(willBeDeletedByTime.length != 0){
        var chk = $(".filter.time");
        if(!chk.is(':checked')){
            chk.prop('checked', true);
            chk.trigger("change");
        }
    }
    MAJWillBeDeletedSwimlane();
}


function MAJWillBeDeletedSwimlane(){

    var allWillBeDeletedData = (willBeDeletedData.concat(willBeDeletedByTime)).concat(willBeDeletedLocations);

    d3.select("#sliderSVG svg g.willBeDeleted").remove();


    var svg = d3.select("#sliderSVG svg");

    var mini = d3.select("#sliderSVG svg").append('g')
        .attr('transform', 'translate(' + margin.left + ', 15 )')
        .attr('width', width)
        .attr('height', 100)
        .attr('class', 'willBeDeleted');

    var rectangles = mini.selectAll("line")
        .data(allWillBeDeletedData)
        .enter()
        .append("line");


    var rectangleAttributes = rectangles
        .attr("x1", function (d) {
            return xSmallSlider(new Date(d.start));
        })
        .attr("x2", function (d) {
            return xSmallSlider(new Date(d.stop));
        })
        .attr("y1", 40)
        .attr("y2", 40)
        .attr("stroke", willBeDeletedColor)
        .attr("stroke-width", 80)
        .style("stroke-opacity", 0.15)
        .attr("data-tooltip", function(d){return "Deleted because of " + d.caused_by})
        .attr("data-position", "bottom")
        .attr("class", "tooltipped");


    $('.tooltipped').tooltip({delay: 50});

    putAllOtherSwimlaneToTheTop();

}

function getFilterdApps()
{
    var result = [];
    for(var i = 0; i != currentAppsData.length ; i++)
    {
        for(var k = 0 ; k != privacyParams.unApps.length ; k++)
        {
            if(currentAppsData[i].name == privacyParams.unApps[k])
            {
                result.push(currentAppsData[i]);

            }
        }
    }


    result.forEach(function(one){
       one.caused_by="Application" ;
    });

    return result;

}


function putAllOtherSwimlaneToTheTop(){
    putGroupOnTheTop("appSwimlane");
    putGroupOnTheTop("timeSwimlane");
    putGroupOnTheTop("locationSwimlane");

}