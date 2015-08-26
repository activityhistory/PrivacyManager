/**
 * Created by Maxime on 30/07/2015.
 */

$( document).ready(function(){
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

var timeSwimlane = {
    timeFilterColor : "white",

    /**
     * Change time filter color
     * @param c {String} representing the colour
     */
    setTimeFilterColor: function(c){
        timeFilterColor = c;
    },

    /**
     * Get unauthorized time ranges
     * @returns {Array} that contains all unauthorized time ranges
     */
    getUnauthorizedTimeRanges : function(){
        var authFrom = willBeDeletedSwimlane.privacyParams.auTimes.from,
            authTo = willBeDeletedSwimlane.privacyParams.auTimes.to,
            authWE = willBeDeletedSwimlane.privacyParams.auTimes.weekEnd;

        var unSCS = [];
        var periodStart = NaN;
        var last = NaN;
        for (var i = 0; i != interVal.data.length; i++) { //conditions order is much important
            var one = interVal.data[i];
            if (isNaN(periodStart) && (!this.isInTheRange(authFrom, authTo, one.date, authWE))) // First date out of the auth range
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
            if ((!isNaN(periodStart)) && this.isInTheRange(authFrom, authTo, one.date, authWE)) { // First date in the auth range after some unauth scs
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

        return unSCS;
    },

    /**
     * Print the time swimlane
     */
    printTimeSwimlane : function(){
        d3.select("#sliderSVG svg g.timeSwimlane").remove();

        var unSCS = this.getUnauthorizedTimeRanges();

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


        rectangles
            .attr("x1", function (d) {
                return xSmallSlider(new Date(d.start));
            })
            .attr("x2", function (d) {
                return xSmallSlider(new Date(d.stop));
            })
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke", this.timeFilterColor)
            .attr("stroke-width", 3)
            .attr("data-tooltip", "Unauthorized time")
            .attr("data-position", "bottom")
            .attr("class", "tooltipped");


        $('.tooltipped').tooltip({delay: 0});
    },

    /**
     * Check if a date is in the current range
     * @param dateStart {Date} :  starting hours on time picker selector (settings)
     * @param dateStop {Date} ending hours on time picker selector (settings)
     * @param val {Date} time we want to test
     * @param WE {boolean} check if the checkbox "allow week ends" is checked
     * @returns {boolean} true if val is in the range
     */
    isInTheRange: function(dateStart, dateStop, val, WE){
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
    },

    /**
     * Notify when a change occurred in the time filter
     * If it's the case will update the swimlane "view"
     */
    notifyTimeFilterChanged: function(){
        if ($(".filter.time").is(':checked'))
            this.printTimeSwimlane();
        else
            this.removeTimeFilter();
    },

    /**
     * Disable time filter swimlane
     */
    removeTimeFilter: function(){
        d3.select("#sliderSVG svg g.timeSwimlane").remove();
    }
};
