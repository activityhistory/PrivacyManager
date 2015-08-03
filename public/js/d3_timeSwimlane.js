/**
 * Created by Maxime on 30/07/2015.
 */

var minDiffPeriod = 360; //seconds


var timeFilterColor = "white";

function setTimeFilterColor(c) {
    timeFilterColor = c;
}



function printTimeSwimlane() {

    d3.select("#timeSwimlane svg").remove();



    var authFrom = privacyParams.auTimes.from,
        authTo = privacyParams.auTimes.to,
        authWE = privacyParams.auTimes.weekEnd;

    var unSCS = [];
    var periodStart = NaN;
    var last = NaN;
    for (var i = 0; i != interVal.data.length; i++) {
        var one = interVal.data[i];
        if (isNaN(periodStart) && (!isInTheRange(authFrom, authTo, one.date, authWE))) // First date out of the auth range
        {
            periodStart = one.date;
            continue;
        }
        if ((!isNaN(periodStart)) && isInTheRange(authFrom, authTo, one.date, authWE)) { // First date in the auth range after some unauth scs
            unSCS.push({start: periodStart, stop: one.date});
            periodStart = NaN;
            last = NaN;
            continue;

        }
        if ((!isNaN(periodStart)) && i == (interVal.data.length - 1 )) { // Last date in an unauth period
            unSCS.push({start: periodStart, stop: one.date});
        }
/*        if((!isNaN(periodStart)) && (!isNaN(last) && (one.date - last > minDiffPeriod))) {//if is too far during an unauth period with smth inside
            unSCS.push({start: periodStart, stop: last});
            periodStart = NaN;
            last = NaN;
            if(!isInTheRange(authFrom, authTo, one.date, authWE))
                periodStart = one.date;
            continue;
        }

        if((!isNaN(periodStart)) && (isNaN(last) && (one.date - periodStart > minDiffPeriod))) {//if is too far during an unauth period with nothing inside
            unSCS.push({start: periodStart, stop: (periodStart +( minDiffPeriod/2))});
            periodStart = NaN;
            last = NaN;
            if(!isInTheRange(authFrom, authTo, one.date, authWE))
                periodStart = one.date;
            continue;
        }*/
        last = one.date;
    }

    if(unSCS.length == 0)
        return;


    var svg = d3.select("#timeSwimlane").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 5);


    var mini = d3.select("#timeSwimlane svg").append('g')
        .attr('transform', 'translate(' + margin.left + ',1)')
        .attr('width', width)
        .attr('height', 5)
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
        .attr("title", "Unauthorized time");





    $( document ).tooltip();
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
    d3.select("#timeSwimlane svg").remove();
}