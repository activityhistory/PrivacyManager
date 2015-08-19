/**
 * Created by Maxime on 23/07/2015.
 */



var margin = {top: 10, right: 10, bottom: 20, left: 20},
    width = 900 - margin.right - margin.left,
    height = 75 - margin.top - margin.bottom,
    miniHeight = 50;


function initBrush() {
    brush = d3.svg.brush()
        .x(x)
        .on("brushend", brushed);

    d3.select("#bigSlider svg").append("g")
        .attr('transform', 'translate(' + margin.left + ',' + ((height - miniHeight) + 7) + ')')
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -2)
        .attr("height", miniHeight + 4);






    var aaa = new Date();
    aaa.setDate(aaa.getDate() -1);
    var bbb = new Date();
    bbb.setDate(bbb.getDate() -1);
    aaa.setHours(0);
    aaa.setMinutes(0);
    bbb.setHours(23);
    bbb.setHours(59);


    //Init to yesterday
    bigsSlider_manuelBrushMove(aaa, bbb);
    brushed();


    return brush;
}


function brushed() {
    var ext = brush.extent();
    interVal.start = new Date(ext[0]);
    interVal.stop = new Date(ext[1]);


    ajaxMAJSlider(ext[0], ext[1]); //TODO listener
}

function printMiniItems(data) {


    var color = legend_getAColor("Activity intensity");

    var scsDates = JSONToDate(data);

    var mini = d3.select("#bigSlider svg").append('g')
        .attr('transform', 'translate(' + margin.left + ',' + (height - miniHeight + 7) + ')')
        .attr('width', width)
        .attr('height', miniHeight)
        .attr('class', 'mini');

    var rectangles = mini.selectAll("circle")
        .data(scsDates)
        .enter()
        .append("circle");


    var rectangleAttributes = rectangles
        .attr("cx", function (d) {
            return x(d);
        })
        .attr("cy", function (d) {
            return Math.floor((Math.random() * miniHeight) + 1)
        })
        .attr("r", 3)
        .style("fill", color)
        .style("fill-opacity", 0.05);


}

function initBigSlider(daysList) {

    var dateList = JSONToDate(daysList);

    var x = d3.time.scale()
        .domain([dateList[0], d3.time.day.offset(dateList[dateList.length - 1], 1)])
        .range([0, width]);

    var mainSVG = d3.select("#bigSlider").append("svg");
    var svg = mainSVG
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis().scale(x).orient("bottom"));


    svg.selectAll('.axis line, .axis path')
        .style({'stroke': 'Black', 'fill': 'none', 'stroke-width': '2px'});

    //mainSVG.append("text")
    //    .attr("x", 10)
    //    .attr("y", 5)
    //    .attr("dy", ".35em")
    //    .text("Activity");
    //
    //
    //mainSVG.append("svg:image")
    //    .attr("x", 10)
    //    .attr("y", 0)
    //    .attr('width', 36)
    //    .attr('height', 36)
    //    .attr("xlink:href", "images/ic_history_black_18dp_2x.png");

    return x;
}


function bigsSlider_manuelBrushMove(dateStart, dateStop) {
    brush.extent([dateStart, dateStop]);
    brush(d3.select(".brush").transition());
}
