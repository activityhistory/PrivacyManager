/**
 * Created by Maxime on 23/07/2015.
 */

var brushSmallSlider;
var zoomBrush;
var xAxisSmallSlider;
var manualMoveSmallSlder;
var zooming;

function initializeSmallSlider() {

    var margin = {top: 5, right: 10, bottom: 10, left: 20},
        width = 800 - margin.left - margin.right,
        height = 50 - margin.bottom - margin.top,
        moving,
        currentValue = 0,
        targetValue = 70,
        alpha = .6;

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


    zooming = d3.behavior.zoom()
        .center(xSmallSlider(currentValue), 0)
        .on("zoom", zoomed);

    function zoomed() {
        var wheelDelta = d3.event.sourceEvent.wheelDelta;

        var start_zoom_date = interVal.start;
        var end_zoom_date = interVal.stop;

        var diff = end_zoom_date - start_zoom_date;


        //if diff >= 1 day
        if (diff >= 86400000) {
            //zoom in
            if (wheelDelta > 0) {
                start_zoom_date.setDay(interVal.start.getDay() + 1);
                end_zoom_date.setDay(interVal.stop.getDay() - 1);
                manualBrushedZoom(start_zoom_date, end_zoom_date);
            }
            //zoom out
            else if (wheelDelta < 0) {
                start_zoom_date.setHours(interVal.start.getDay() - 1);
                end_zoom_date.setHours(interVal.start.getDay() + 1);
                manualBrushedZoom(start_zoom_date, end_zoom_date);
            }
        }
        //diff >= 1h
        else if (diff >= 3600000) {
            //zoom in
            if (wheelDelta > 0) {
                start_zoom_date.setHours(interVal.start.getHours() + 1);
                end_zoom_date.setHours(interVal.stop.getHours() - 1);
                manualBrushedZoom(start_zoom_date, end_zoom_date);
            }
            //zoom out
            else if (wheelDelta < 0) {
                start_zoom_date.setHours(interVal.start.getHours() - 1);
                end_zoom_date.setHours(interVal.stop.getHours() + 1);
                manualBrushedZoom(start_zoom_date, end_zoom_date);
            }
        }
        //diff < 1hour
        else {
            //zoom in
            if (wheelDelta > 0) {
                start_zoom_date.setMinutes(interVal.start.getMinutes() + 15);
                end_zoom_date.setMinutes(interVal.stop.getMinutes() - 15);
                manualBrushedZoom(start_zoom_date, end_zoom_date);
            }
            //zoom out
            else if (wheelDelta < 0) {
                start_zoom_date.setMinutes(interVal.start.getMinutes() - 15);
                end_zoom_date.setMinutes(interVal.stop.getMinutes() + 15);
                manualBrushedZoom(start_zoom_date, end_zoom_date);
            }
        }

    }

    var slider = svg.append("g")
        .call(zooming)
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
        .attr("height", 145)
        .style("fill", "white");


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

    $('#sliders .arrow.right').click(function(){
        var start_zoom_date = new Date(interVal.stop);
        var end_zoom_date = new Date(interVal.stop);

        var diff = interVal.stop - interVal.start;


        end_zoom_date.setMilliseconds(end_zoom_date.getMilliseconds() + diff);


        manualBrushedZoom(start_zoom_date, end_zoom_date);
    });

    $('#sliders .arrow.left').click(function(){
        var start_zoom_date = new Date(interVal.start);
        var end_zoom_date = new Date(interVal.start);

        var diff =  interVal.stop - interVal.start;

        start_zoom_date.setMilliseconds(start_zoom_date.getMilliseconds() - diff);

        manualBrushedZoom(start_zoom_date, end_zoom_date);
    });

    $( document ).keydown(function(e) {
        e = e || window.event;
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
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", 34);


    return xSmallSlider;
}


function brushedZoom(){
    var ext = zoomBrush.extent();



    //unauthorized zoom too much
    var a = new Date(ext[0]),
        b = new Date(ext[1]);
    if(b - a < 300000)//5min
    {
        Materialize.toast("Sorry, you want to zoom too much. Maybe you  &nbsp;<a href='http://www.glassesusa.com/'> need glasses</a>&nbsp;?", 5000);
        return;
    }

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



function majZoomBrush(){

    d3.select("#sliderSVG svg .zoomBrush").remove();

    d3.select("#sliderSVG svg").append("g")
        .attr('transform', 'translate(' + margin.left + ', 95)')
        .attr("class", "zoomBrush")
        .call(zoomBrush)
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", 34);
}

function goToOneScreenshotNext(direction) {
    var currentScreenshot = $("#bigScreenShot").attr("src").split("/");
    currentScreenshot = currentScreenshot[currentScreenshot.length -1];

    if (currentScreenshot == "no-image.jpg" || currentScreenshot == "tuto.png") {
        Materialize.toast("You have to be somewhere to go elsewhere ...",4000);
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
        Materialize.toast("Invalid operation : out of limit or unrecognized screenshot", 4000);
        return;
    }
    if(direction == "right")
        res ++;
    else
        res--;

    var exactDate = interVal.data[res].date;
    manualMoveSmallSlder(exactDate);
}




function goToOneScreenshot(scsName)
{

    var res = NaN;
    for(var i = 0 ; i != interVal.data.length; i++ ){
        var one = interVal.data[i];
        if(one.screenshot == scsName)
            res = i;
    }

    if(
        isNaN(res)
        ||      (res  >= interVal.data.length)
        ||      ( res < 0)
    )
    {
        Materialize.toast("Invalid operation : out of limit or unrecognized screenshot", 4000);
        return;
    }
    var exactDate = interVal.data[res].date;
    manualMoveSmallSlder(exactDate);
}


function manualBrushedZoom(start_date, end_date) {
    if (end_date - start_date < 300000)//5min
    {
        if($('#errorZoomZoom').length == 0)
            Materialize.toast("<div id='errorZoomZoom'>Sorry, you want to zoom too much. Maybe you  &nbsp;<a href='http://www.glassesusa.com/'> need glasses</a>&nbsp;?</div>", 5000);
        return;
    }

    interVal.start = new Date(start_date);
    interVal.stop = new Date(end_date);


    ajaxMAJSlider(start_date, end_date);
    zoomBrush.clear();
    d3.select("#sliderSVG svg g.zoomBrush")
        .call(zoomBrush)
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", 34);

}

function MAJSlider(data) {
    if ((!data[0]) || (!data[1])) {
        Materialize.toast("No screenshot found in the selected range",4000);
        return;
    }

    /* interVal.start = data[0].date;
     interVal.stop = data[data.length - 1].date;*/
    interVal.data = data;

    xSmallSlider.domain([data[0].date, data[data.length - 1].date]);

    d3.select("#sliderSVG svg .x.axis")
        .call(xAxisSmallSlider);


    printScreenShotSwimlane();
    majZoomBrush();
    AppsSwimlane.getAndPrintAppSwimlane();
    LocationFilter.initAndPrint();
    timeSwimlane.notifyTimeFilterChanged();
    willBeDeletedSwimlane.checkUnauthorizedTimes();

    var data_length = interVal.data.length;
    var middle = Math.round(data_length / 2);


    var exactDate = interVal.data[middle].date;
    manualMoveSmallSlder(exactDate);
}

function ajaxMAJSlider(dateStart, dateStop) {
    $.get("/getScreenshotsListBetween", {start: dateStart, end: dateStop}, function (data) {
        var d = data.result;
        var r = [];
        d.forEach(function (one) {
            r.push({date: new Date(one.date), screenshot: one.screenshot});
        });
        MAJSlider(r);
        if (r) {
            //TODO
            bigsSlider_manuelBrushMove(dateStart, dateStop); //To put the brush on the screenshot/activity area only
            ajaxMAJRunningAppsList(dateStart, dateStop);
        }
    });
}


function ajaxMAJRunningAppsList(dateStart, dateStop) {
    $.get("/runningAppsBetween", {start: dateStart, end: dateStop}, function (data) {
        runningApps = data.apps;
    });
}

function printScreenShotSwimlane() {

    var color = Legend.getAColor("Activity intensity");

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
        //.style("fill-opacity", 0.03)
        .attr("class", "bobobop");

    var b = $(".bobobop").length;
     b =((5/b)+0.005 > 1) ? 1 : ((5/b)+0.005);
    $(".bobobop").css({'fill-opacity' : b});
}