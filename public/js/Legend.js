/**
 * Created by Maxime on 24/07/2015.
 */

/**
 * Legend Manager
 * deal and print colored legend
 * @type {{legendData: Array, colorscale, currentColorIndex: number, addLegend: Function, getAColor: Function, removeLegend: Function, printLegend: Function}}
 */
var Legend = {
    legendData: [],
    colorscale: d3.scale.category10(),
    currentColorIndex: 0,


    /**
     * Add a new legend to the list
     * @param _name : String --> name of legended thing
     * @returns color
     */
    addLegend: function (_name) {
        var _color = this.colorscale(this.currentColorIndex);
        this.legendData.push({name: _name, color: _color});
        this.printLegend();

        this.currentColorIndex++;
        return _color;
    },


    /**
     * Seach for a pre-existing legend, if exist return it color, else create it
     * @param name : string --> name of legended thing
     * @returns color
     */
    getAColor: function (name) {
        for (var i = 0; i != this.legendData.length; i++) {
            if (this.legendData[i].name == name)
                return this.legendData[i].color;
        }
        return this.addLegend(name);
    },


    /**
     * remove a legend from the legend and free it color
     * @param name
     */
    removeLegend: function (name) {
        this.legendData = this.legendData.filter(function (e) {
            return e.name != name
        });
        this.printLegend();
    },


    /**
     * Update the printed legend
     */
    printLegend: function () {
        $("#legend").html('');


        var toAdd = [];
        this.legendData.forEach(function (one) {
            if (one.name != "Activity intensity")
                toAdd.push(one);
        });

        var legendSVG = d3.select("#legend").append('svg')
            .attr("width", '100%')
            .attr("height", '200%'); //bigger than the div to allow scroll
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
            })
            .style("fill-opacity", function (d) {
                if (d.name == "Will be deleted")
                    return 0.15;
                return 1.0;
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


};