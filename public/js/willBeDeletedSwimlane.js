/**
 * Created by Maxime on 28/07/2015.
 */


var privacyParams = {
    unApps : [],
    auTimes : {from : "undefined", to : "undefined", weekEnd : "undefined"},
    auLocations : []
};

var willBeDeletedData = [];

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


function privacyFilter_checkDeletedApps() {
    var filterdApps = getFilterdApps();
    willBeDeletedData = filterdApps; //TODO changer l'organisation pouyr pouvoir supprimer certaines parties
    MAJWillBeDeletedSwimlane();
    //extract apps names that will delete some part
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
    //print the filter swimlane of apps that delete some part
    appNames.forEach(function (one) {
        var inp = $("input[value='" + one + "']");
        if (!inp.is(':checked')) {
            inp.prop('checked', true);
            inp.trigger("change");
        }
    });
}


function MAJWillBeDeletedSwimlane(){


    d3.select("#willBeDeleted svg").remove();


    var svg = d3.select("#willBeDeleted").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var mini = d3.select("#willBeDeleted svg").append('g')
        .attr('transform', 'translate(' + margin.left + ',' + (height + 15) + ')')
        .attr('width', width)
        .attr('height', 30)
        .attr('class', 'willBeDeleted');

    var rectangles = mini.selectAll("line")
        .data(willBeDeletedData)
        .enter()
        .append("line");


    var rectangleAttributes = rectangles
        .attr("x1", function (d) {
            return xSmallSlider(new Date(d.start));
        })
        .attr("x2", function (d) {
            return xSmallSlider(new Date(d.stop));
        })
        .attr("y1", 5)
        .attr("y2", 5)
        .attr("stroke", willBeDeletedColor)
        .attr("stroke-width", 8);



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

    return result;

}