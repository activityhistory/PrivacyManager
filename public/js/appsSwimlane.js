/**
 * Created by Maxime on 24/07/2015.
 */


var currentAppsData;

function getAndPrintAppSwimlane()
{
    $.get("/getAppsData", {start:interVal.start, stop : interVal.stop}, function(data){
        currentAppsData = data.result;
        printAppsSwimlanes(); //print the resqueted dilters
        privacyFilter_checkDeletedApps(); // print the filters that will be deteted by the privacy filter
    });
}


function printAppsSwimlanes(){

    d3.select("#appsSwimlanes svg").remove();


    var svg = d3.select("#appsSwimlanes").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 20);

    var nump = 0;
    FiltredApps.forEach(function(one){
        var color = one.color;
        var name = one.name;

        var thisAppData = [];
        for(var i = 0; i!= currentAppsData.length; i++)
        {
            if(currentAppsData[i].name == name)
                thisAppData.push(currentAppsData[i]);
        }
        if(thisAppData.length > 0) {
            printOneAppSwimlane(name, color, thisAppData, nump);
            nump++;
        }
    })
}

function printOneAppSwimlane(name, color, data, bottom){


    var mini = d3.select("#appsSwimlanes svg").append('g')
        .attr('transform', 'translate(' + margin.left + ',3)')
        .attr('width', width)
        .attr('height', 15)
        .attr('class', 'appSwimlane');

    var rectangles = mini.selectAll("line")
        .data(data)
        .enter()
        .append("line");


    var rectangleAttributes = rectangles
        .attr("x1", function (d) {
            return xSmallSlider(new Date(d.start));
        })
        .attr("x2", function (d) {
            return xSmallSlider(new Date(d.stop));
        })
        .attr("y1", bottom*4)
        .attr("y2", bottom*4)
        .attr("stroke", color)
        .attr("stroke-width", 3);

}

function notifyAppsFilterChanged()
{
    printAppsSwimlanes();
}