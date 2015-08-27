/**
 * Created by Maxime on 23/07/2015.
 */



var margin = {top: 10, right: 10, bottom: 20, left: 20},
    width = 800 - margin.right - margin.left,
    height = 75 - margin.top - margin.bottom,
    miniHeight = 50;

/**
 * Init big slider's brush
 * @returns {*}
 */
function initBrush() {
    var brush = d3.svg.brush()
        .x(xBigSlider)
        .on("brushend", brushed);

    d3.select("#bigSlider svg").append("g")
        .attr('transform', 'translate(' + margin.left + ',' + ((height - miniHeight) + 7) + ')')
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -2)
        .attr("height", miniHeight + 4);

    return brush;
}

/**
 * Call back for brush's action
 */
function brushed() {
    var ext = bigSliderBrush.extent();
    interVal.start = new Date(ext[0]);
    interVal.stop = new Date(ext[1]);

    ajaxMAJSlider(ext[0], ext[1]);
}

/**
 * Print  activity intensity
 * @param data
 */
function printMiniItems(data) {

    //just to get a most beautiful color :)
    Legend.getAColor("a");
    var color = Legend.getAColor("Activity intensity");
    Legend.removeLegend("a");

    var scsDates = util.JSONToDate(data);

    var mini = d3.select("#bigSlider svg").append('g')
        .attr('transform', 'translate(' + margin.left + ',' + (height - miniHeight + 7) + ')')
        .attr('width', width)
        .attr('height', miniHeight)
        .attr('class', 'mini');

    var rectangles = mini.selectAll("circle")
        .data(scsDates)
        .enter()
        .append("circle");


    rectangles
        .attr("cx", function (d) {
            return xBigSlider(d);
        })
        .attr("cy", function (d) {
            return Math.floor((Math.random() * miniHeight) + 1)
        })
        .attr("r", 3)
        .style("fill", color)
        .style("fill-opacity", 0.05);


}

/**
 * Init big slider
 * @param daysList
 * @returns {*}
 */
function initBigSlider(daysList) {

    var dateList = util.JSONToDate(daysList);

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

    return x;
}

/**
 * Manual brush when we want to move the brush manually
 * @param dateStart
 * @param dateStop
 */
function bigsSlider_manuelBrushMove(dateStart, dateStop) {
    bigSliderBrush.extent([dateStart, dateStop]);
    bigSliderBrush(d3.select(".brush").transition());
}
