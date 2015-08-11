/**
 * Created by Maxime on 23/07/2015.
 */

var brushSmallSlider;
var zoomBrush;
var xAxisSmallSlider;
var manualMoveSmallSlder;

function initializeSmallSlider() {

    var margin = {top: 5, right: 10, bottom: 10, left: 150},
        width = 950 - margin.left - margin.right,
        height = 50 - margin.bottom - margin.top,
        moving,
        currentValue = 0,
        targetValue = 70,
        alpha = .9;

    var xSmallSlider = d3.time.scale()
        //.domain([interVal.start, d3.time.hour.offset(interVal.stop, 1)])
        .domain([interVal.start, interVal.stop])
        .range([0, width])
        .clamp(true);

    brushSmallSlider = d3.svg.brush()
        .x(xSmallSlider)
        .extent([0, 0])
        .on("brush", brushedSmallSlider);

    var svg = d3.select("#sliderSVG svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 100 + ")");

    xAxisSmallSlider = d3.svg.axis()
        .scale(xSmallSlider)
        .innerTickSize(4);//espace entre le légende de l'axis et celui-ci

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, 30)")
        .call(xAxisSmallSlider)
        .select(".domain")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "halo");

    //change the font size fo all the tick, and the size of the smallslider axis line
    svg.selectAll('.axis line, .axis path')
        .style({'stroke': 'Black', 'fill': 'none', 'stroke-width': '2px'});
    d3.selectAll(".tick > text")
        .style("font-size", 10);


    //hr
    d3.select("#sliderSVG svg").append("line")
        .attr("x1", margin.left - 30)
        .attr("x2", width+margin.left +30)
        .attr("y1", 95)
        .attr("y2", 95)
        .attr("stroke-width", 2)
        .attr("stroke", "grey");


    var slider = svg.append("g")
        .attr("class", "slider")
        .call(brushSmallSlider);

    slider.selectAll(".extent,.resize")
        .remove();

    slider.select(".background")
        .attr("height", height/2)
        .attr("transform", "translate(0, 30)");

    var handle = slider.append("rect")
        .attr("class", "handle")
        .attr("transform", "translate(0,-100)")
        .attr("x", width/2+margin.left )
        .attr("y", 0)
        .attr("width", 2)
        .attr("height", 130)
        .style("fill", "white");

    //slider
    //    .call(brushSmallSlider.event)
    //    .transition() // gratuitous intro!
    //    .duration(750)
    //    .call(brushSmallSlider.extent([targetValue, targetValue]))
    //    .call(brushSmallSlider.event);

    function brushedSmallSlider() {
        if (d3.event.sourceEvent) { // not a programmatic event
            targetValue = xSmallSlider.invert(d3.mouse(this)[0]);
            move();
            printScreenshot(targetValue);
        } else {
            currentValue = brushSmallSlider.extent()[0];
            handle.attr("x", xSmallSlider(currentValue));
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

    manualMoveSmallSlder = function(to) {
        slider.call(brushSmallSlider.extent([to, to]))
            .call(brushSmallSlider.event);
        printScreenshot(to);
    };

    $( document ).keydown(function(e) {
        e = e || window.event;
        // RIP Zoom +/-
        //if(e.keyCode == 107){//+
        //    zoom();
        //}
        //if(e.keyCode == 109){ //-
        //    unzoom();
        //}
        if(e.keyCode == 39){// ->
            goToOneScreenshotNext("right");
            e.preventDefault();
        }
        if(e.keyCode == 37){ // <-
            goToOneScreenshotNext("left");
            e.preventDefault();
        }

    });


    zoomBrush = d3.svg.brush()
        .x(xSmallSlider)
        .on("brushend", brushedZoom);

    d3.select("#sliderSVG svg").append("g")
        .attr('transform', 'translate(' + margin.left + ', 95)')
        .attr("class", "zoomBrush")
        .call(zoomBrush)
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", 34);



    function brushedZoom(){
        var ext = zoomBrush.extent();
        interVal.start = new Date(ext[0]);
        interVal.stop = new Date(ext[1]);
        ajaxMAJSlider(ext[0], ext[1]);
        zoomBrush.clear();
        d3.select("#sliderSVG svg g.zoomBrush")
            .call(zoomBrush)
            .selectAll("rect")
            .attr("y", 0)
            .attr("height", 34);
    }


    return xSmallSlider;
}


function goToOneScreenshotNext(direction)
{
    var currentScreenshot = $("#bigScreenShot").attr("src").split("/");
    currentScreenshot = currentScreenshot[currentScreenshot.length -1];
    if(currentScreenshot == "no-image.jpg" || currentScreenshot == "tuto.png")
    {
        alert("You have to be somewhere to go elsewhere ...");
        return;
    }

    var res = NaN;
    for(var i = 0 ; i != interVal.data.length; i++ ){
        var one = interVal.data[i];
        if(one.screenshot == currentScreenshot)
            res = i;
    }

    if(
                    isNaN(res)
            ||      (direction == "right" && res +1 >= interVal.data.length)
            ||      (direction == "left" && res -1 < 0)
        )
    {
        alert("Invalid operation : out of limit or unrecognized screenshot");
        return;
    }
    if(direction == "right")
        res ++;
    else
        res--;

    var exactDate = interVal.data[res].date;
    console.log(interVal.data[res].date);
    manualMoveSmallSlder(exactDate);


}

/*function zoom()
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

}*/

function MAJSlider(data) {
    if ((!data[0]) || (!data[1])) {
        alert("No screenshot found in the selected range");
        return;
    }
    xSmallSlider.domain([data[0].date, data[data.length - 1].date]);

    d3.select("#sliderSVG svg .x.axis")
        .call(xAxisSmallSlider);

    interVal.start = data[0].date;
    interVal.stop = data[data.length -1].date;
    interVal.data = data;
    printScreenShotSwimlane();
    getAndPrintAppSwimlane();
    LocationFilter.initAndPrint();
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
        if(r)
            bigsSlider_manuelBrushMove(r[0].date, r[r.length-1].date); //To put the brush on the screenshot/activity area only
    });

}


function printScreenShotSwimlane() {



    var color = legend_getAColor("Activity intensity");

    var data = interVal.data;

    d3.select("#sliderSVG svg  g.screenshotSwimlane").remove();


    var mini = d3.select("#sliderSVG svg").append('g')
        .attr('transform', 'translate(' + margin.left + ', 100)')
        .attr('width', width)
        .attr('height', 40)
        .attr('class', 'screenshotSwimlane');

    var rectangles = mini.selectAll("circle")
        .data(data)
        .enter()
        .append("circle");


    var rectangleAttributes = rectangles
        .attr("cx", function (d) {
            return xSmallSlider(d.date);
        })
        .attr("cy", 12)
        .attr("r", 10)
        .style("fill", color)
        .style("fill-opacity", 0.03);


}