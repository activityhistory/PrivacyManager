/**
 * Created by Maxime on 30/07/2015.
 */

var minDiffPeriod = 360; //seconds


var timeFilterColor = "white";

function setTimeFilterColor(c) {
    timeFilterColor = c;
}


$( document).ready(function(){

    //d3.select("#sliderSVG svg").append("svg:image")
    //    .attr("x", 10)
    //    .attr("y", 30)
    //    .attr('width', 25)
    //    .attr('height', 25)
    //    .attr("xlink:href", "images/ic_av_timer_black_18dp_2x.png");

    //hr
    d3.select("#sliderSVG svg").append("line")
        .attr("x1", margin.left - 30)
        .attr("x2", width+margin.left +30)
        .attr("y1", 35)
        .attr("y2", 35)
        .attr("stroke-width", 2)
        .attr("stroke", "grey")
        .attr("class", "timeLine");
});


function printTimeSwimlane() {

    d3.select("#sliderSVG svg g.timeSwimlane").remove();


    var authFrom = privacyParams.auTimes.from,
        authTo = privacyParams.auTimes.to,
        authWE = privacyParams.auTimes.weekEnd;

    var unSCS = [];
    var periodStart = NaN;
    var last = NaN;
    for (var i = 0; i != interVal.data.length; i++) { //conditions order is much important
        var one = interVal.data[i];
        if (isNaN(periodStart) && (!isInTheRange(authFrom, authTo, one.date, authWE))) // First date out of the auth range
        {
            periodStart = one.date;
            last = one.date;
            continue;
        }
        if((!isNaN(periodStart)) && one.date - last > 360000 ) {//during an unauth period, too much distance between two datas
            unSCS.push({start: periodStart, stop: last});
            periodStart = one.date;
            last = one.date;

            continue;

        }
        if ((!isNaN(periodStart)) && isInTheRange(authFrom, authTo, one.date, authWE)) { // First date in the auth range after some unauth scs
            unSCS.push({start: periodStart, stop: one.date});
            periodStart = NaN;
            last = one.date;
            continue;

        }
        if ((!isNaN(periodStart)) && i == (interVal.data.length - 1 )) { // Last date in an unauth period
            unSCS.push({start: periodStart, stop: one.date});
        }
        last = one.date;
    }

    if(unSCS.length == 0) {
        Materialize.toast("No unauthorized times in this range :)", 4000);
        return;
    }


    var svg = d3.select("#sliderSVG svg");


    var mini = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',45)')
        .attr('width', width)
        .attr('height', 10)
        .attr('class', 'timeSwimlane');

    var rectangles = mini.selectAll("line")
        .data(unSCS)
        .enter()
        .append("line");


    var rectangleAttributes = rectangles
        .attr("x1", function (d) {
            return xSmallSlider(new Date(d.start));
        })
        .attr("x2", function (d) {
            return xSmallSlider(new Date(d.stop));
        })
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", timeFilterColor)
        .attr("stroke-width", 3)
        .attr("data-tooltip", "Unauthorized time")
        .attr("data-position", "bottom")
        .attr("class", "tooltipped");



    $('.tooltipped').tooltip({delay: 50});
}


function isInTheRange(dateStart, dateStop, val, WE) {

    var hourVal = val.getHours(),
        minVal = val.getMinutes(),
        hourStart = dateStart.split(":")[0],
        minStart = dateStart.split(":")[1],
        hourStop = dateStop.split(":")[0],
        minStop = dateStop.split(":")[1];

    if(!WE)
    {
        var day = val.getDay();
        if(day == 6 || day == 0)
            return false;


    }

    if (hourVal >= hourStart && hourVal <= hourStop)
        if (
            (hourVal == hourStart && minVal >= minStart)
            || (hourVal == hourStop && minVal <= minStop)
            || (hourVal != hourStart && hourVal != hourStop)
        )
            return true;
    return false;
}

function notifyTimeFilterChanged() {
    if ($(".filter.time").is(':checked'))
        printTimeSwimlane();
    else
        removeTimeFilter();
}

function removeTimeFilter() {
    d3.select("#sliderSVG svg g.timeSwimlane").remove();
}