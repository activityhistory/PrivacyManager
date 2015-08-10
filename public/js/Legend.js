/**
 * Created by Maxime on 24/07/2015.
 */


var legendData = [];
var colorscale = d3.scale.category10();
var currentColorIndex = 0;

function addLegend(_name)
{
    var _color = colorscale(currentColorIndex);
    legendData.push({name:_name, color:_color});
    printLegend();

    currentColorIndex++;
    return _color;
}

function legend_getAColor(name)
{
    for(var i = 0 ; i != legendData.length ; i++)
    {
        if(legendData[i].name == name)
            return legendData[i].color;
    }
    return addLegend(name);
}


function removeLegend(name){
    legendData = legendData.filter(function(e){ return e.name !=  name });
    printLegend();
}

function printLegend(){
    $("#legend").html('');


    var toAdd = [];
    legendData.forEach(function(one){
        if(one.name != "Will be deleted" && one.name != "Activity intensity")
            toAdd.push(one);
    });

    var legendSVG = d3.select("#legend").append('svg')
        .attr("width", '100%')
        .attr("height", '90%');
    var circles = legendSVG.selectAll("circle")
        .data(toAdd)
        .enter()
        .append("circle");
    var currentY = -10;
    circles.attr("cy", function (d) {
        currentY += 20;
        return currentY;
    })
        .attr("cx", 20)
        .attr("r", 7)
        .style("fill", function (d) {
            return d.color;
        });
    currentY = -5;
    var texts = legendSVG.selectAll("text")
        .data(toAdd)
        .enter()
        .append("text");
    texts.attr("x", 35)
        .attr("y", function (d) {
            currentY += 20;
            return currentY;
        })
        .text(function (d) {
            return d.name
        })
        .attr("font-size", '14px');
}