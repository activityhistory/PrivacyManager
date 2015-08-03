/**
 * Created by Maxime on 29/07/2015.
 */


function printLocationsSwimlanes(){

    d3.select("#locationSwimlanes svg").remove();


    if(!locationData){
        console.log("WARNING: NO LOCATION DATA FOUND");
        return;
    }

    var locationToprint = [];
    for(var i = 0 ; i!= locationData.length ; i++)
    {
        var one = locationData[i];
        if(one.filtered == true)
        {
            locationToprint.push(one);
        }
    }


    var svg = d3.select("#locationSwimlanes").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 5);


    var mini = d3.select("#locationSwimlanes svg").append('g')
        .attr('transform', 'translate(' + margin.left + ',1)')
        .attr('width', width)
        .attr('height', 5)
        .attr('class', 'locationSwimlane');

    var rectangles = mini.selectAll("line")
        .data(locationToprint)
        .enter()
        .append("line");


    var rectangleAttributes = rectangles
        .attr("x1", function (d) {
            return xSmallSlider(new Date(d.from));
        })
        .attr("x2", function (d) {
            return xSmallSlider(new Date(d.to));
        })
        .attr( "y1" , 0 )
        .attr( "y2" , 0 )
        .attr("stroke", function(d){return d.color})
        .attr("stroke-width", 3);

}

function notifylocationFilterChanged()
{
    printLocationsSwimlanes();
}