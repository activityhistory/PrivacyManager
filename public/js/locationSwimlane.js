/**
 * Created by Maxime on 29/07/2015.
 */


$( document).ready(function(){
    //
    //d3.select("#sliderSVG svg").append("text")
    //    .attr("x", 10)
    //    .attr("y", 20)
    //    .attr("dy", ".35em")
    //    .text("Location");


});


function printLocationsSwimlanes(){



    d3.select("#sliderSVG svg g.locationSwimlane").remove();


    if(!LocationFilter.locationData){
        console.log("WARNING: NO LOCATION DATA FOUND");
        return;
    }

    var locationToprint = [];
    for(var i = 0 ; i!= LocationFilter.locationData.length ; i++)
    {
        var one = LocationFilter.locationData[i];
        if(one.filtered == true)
        {
            locationToprint.push(one);
        }
    }




    var svg = d3.select("#sliderSVG svg");


    var mini = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',23)')
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
        .attr("stroke-width", 3)
        .attr("data-tooltip", function(d){return d.name})
        .attr("data-position", "bottom")
        .attr("class", "tooltipped");




    $('.tooltipped').tooltip({delay: 50});

}