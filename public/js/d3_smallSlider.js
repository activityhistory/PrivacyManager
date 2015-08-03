/**
 * Created by Maxime on 23/07/2015.
 */

var brushSmallSlider;
function initializeSmallSlider() {

    var margin = {top: 5, right: 10, bottom: 10, left: 10},
        width = 950 - margin.left - margin.right,
        height = 50 - margin.bottom - margin.top,
        moving,
        currentValue = 0,
        targetValue = 70,
        alpha = .2;

    var xSmallSlider = d3.time.scale()
        .domain([interVal.start, d3.time.hour.offset(interVal.stop, 1)])
        .range([0, width])
        .clamp(true);

    brushSmallSlider = d3.svg.brush()
        .x(xSmallSlider)
        .extent([0, 0])
        .on("brush", brushedSmallSlider);

    var svg = d3.select("#smallSlider").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height / 2 + ")")
        .call(d3.svg.axis()
            .scale(xSmallSlider)
    )
        .select(".domain")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "halo");

    var slider = svg.append("g")
        .attr("class", "slider")
        .call(brushSmallSlider);

    slider.selectAll(".extent,.resize")
        .remove();

    slider.select(".background")
        .attr("height", height);

    var handle = slider.append("circle")
        .attr("class", "handle")
        .attr("transform", "translate(0," + height / 2 + ")")
        .attr("r", 9);

    slider
        .call(brushSmallSlider.event)
        .transition() // gratuitous intro!
        .duration(750)
        .call(brushSmallSlider.extent([targetValue, targetValue]))
        .call(brushSmallSlider.event);

    function brushedSmallSlider() {
        if (d3.event.sourceEvent) { // not a programmatic event
            targetValue = xSmallSlider.invert(d3.mouse(this)[0]);
            move();
            printScreenshot(targetValue);
        } else {
            currentValue = brushSmallSlider.extent()[0];
            handle.attr("cx", xSmallSlider(currentValue));
        }
    }

    function move() {
        if (moving) return false;
        moving = true;
        d3.timer(function () {
            currentValue = Math.abs(currentValue - targetValue) < 1e-3
                ? targetValue
                : targetValue * alpha + currentValue * (1 - alpha);

            slider
                .call(brushSmallSlider.extent([currentValue, currentValue]))
                .call(brushSmallSlider.event);

            return !(moving = currentValue !== targetValue);
        });
    }

    $( document ).keypress(function(e) {
        var ch = String.fromCharCode(e.charCode);
        if(ch == "+"){
            zoom();
        }if(ch == "-"){
            unzoom();
        }
    });

    return xSmallSlider;
}




function zoom()
{

    var currentPostion = new Date(brushSmallSlider.extent()[0]);

    var diffStart = currentPostion - interVal.start;
    var diffStop = interVal.stop - currentPostion;

    var newStart = new Date(interVal.start);
    var newStop = new Date(interVal.stop);

    newStart.setMilliseconds(newStart.getMilliseconds() + (diffStart/2)
    );
    newStop.setMilliseconds(newStop.getMilliseconds() - (diffStop/2));

    ajaxMAJSlider(newStart, newStop);
    bigsSlider_manuelBrushMove(newStart, newStop);


}


function unzoom()
{
    var currentPostion = new Date(brushSmallSlider.extent()[0]);

    var diffStart = currentPostion - interVal.start;
    var diffStop = interVal.stop - currentPostion;

    var newStart = new Date(interVal.start);
    var newStop = new Date(interVal.stop);

    newStart.setMilliseconds(newStart.getMilliseconds() - (diffStart/2)
    );
    newStop.setMilliseconds(newStop.getMilliseconds() + (diffStop/2));

    ajaxMAJSlider(newStart, newStop);
    bigsSlider_manuelBrushMove(newStart, newStop);

}

function MAJSlider(data) {
    if ((!data[0]) || (!data[1])) {
        alert("No screenshot found in the selected range");
        return;
    }
    xSmallSlider.domain([data[0].date, d3.time.hour.offset(data[data.length - 1].date, 1)]);
    d3.select("#smallSlider svg").selectAll(".x.axis").call(d3.svg.axis().scale(xSmallSlider));
    interVal.start = data[0].date;
    interVal.stop = data[data.length -1].date;
    interVal.data = data;
    printScreenShotSwimlane();
    getAndPrintAppSwimlane();
    ajaxGetLocations();
    printLocationsSwimlanes();
    notifyTimeFilterChanged();
}

function ajaxMAJSlider(dateStart, dateStop) {

    $.get("/getScreenshotsListBetween", {start: dateStart, end: dateStop}, function (data) {
        var d = data.result;
        var r = [];
        d.forEach(function (one) {
            r.push({date: new Date(one.date), screenshot: one.screenshot});
        });
        MAJSlider(r);
        bigsSlider_manuelBrushMove(r[0].date, r[r.length-1].date); //To put the brush on the screenshot/activity area only
    });

}


function printScreenShotSwimlane() {



    var color = legend_getAColor("Activiy intensity");

    var data = interVal.data;

    d3.select("#smallSlider svg .screenshotSwimlane").remove();


    var mini = d3.select("#smallSlider svg").append('g')
        .attr('transform', 'translate(' + margin.left + ', 0)')
        .attr('width', width)
        .attr('height', 30)
        .attr('class', 'screenshotSwimlane');

    var rectangles = mini.selectAll("circle")
        .data(data)
        .enter()
        .append("circle");


    var rectangleAttributes = rectangles
        .attr("cx", function (d) {
            return xSmallSlider(d.date);
        })
        .attr("cy", 5)
        .attr("r", 5)
        .style("fill", color)
        .style("fill-opacity", 0.05);


}