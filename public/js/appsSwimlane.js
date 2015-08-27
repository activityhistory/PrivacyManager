/**
 * Created by Maxime on 24/07/2015.
 */

/**
 * Manager of apps swimalnes
 * Keep currentAppsData object, that have all data about apps in the selected range.
 * @type {{currentAppsData: Array, getAndPrintAppSwimlane: Function, printAppsSwimlanes: Function, printOneAppSwimlane: Function, notifyAppsFilterChanged: Function}}
 */
var AppsSwimlane = {
    currentAppsData: [],


    /**
     * Get apps data of the range (server-side)
     * Then, print this data if applications are filtered
     */
    getAndPrintAppSwimlane: function () {
        var self = this;
        $.get("/getAppsData", {start: interVal.start, stop: interVal.stop}, function (data) {
            self.currentAppsData = data.result;
            self.printAppsSwimlanes(); //print the resqueted dilters
            willBeDeletedSwimlane.checkDeletedApps(); // print the filters that will be deteted by the privacy filter
        });
    },


    /**
     * Print all filtered application swimlanes
     */
    printAppsSwimlanes: function () {

        var self = this;
        var p = d3.selectAll("#sliderSVG svg  g.appSwimlane");

        p.remove();

        d3.select(".appText").remove();
        d3.select(".appLine").remove();

        d3.select("#sliderSVG svg").append("line")
            .attr("x1", margin.left - 30)
            .attr("x2", width + margin.left + 30)
            .attr("y1", 55)
            .attr("y2", 55)
            .attr("stroke-width", 2)
            .attr("stroke", "grey")
            .attr("class", "appLine");

        var svg = d3.select("#sliderSVG svg");

        var nump = 0;
        AppsFilter.FiltredApps.forEach(function (one) {
            var color = one.color;
            var name = one.name;

            var thisAppData = [];
            for (var i = 0; i != AppsSwimlane.currentAppsData.length; i++) {
                if (self.currentAppsData[i].name == name)
                    thisAppData.push(self.currentAppsData[i]);
            }
            if (thisAppData.length > 0) {
                self.printOneAppSwimlane(name, color, thisAppData, nump);
                nump++;
            }
            else {
                Materialize.toast("No " + name + " usage found in this range.", 4000);
            }


            $('.tooltipped').tooltip({delay: 0});
        })
    },


    /**
     * Print a swimlane
     * @param name : string --> name of the app
     * @param color : color --> color of the swimlane
     * @param data : array of ranges (object start/stop) --> when apps was focused
     * @param bottom : number --> offset to know where to put the swimlane
     */
    printOneAppSwimlane: function (name, color, data, bottom) {


        var mini = d3.select("#sliderSVG svg").append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (100 - height + 10) + ')')
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
            .attr("y1", bottom * 6)
            .attr("y2", bottom * 6)
            .attr("stroke", color)
            .attr("stroke-width", 5)
            .attr("data-tooltip", name)
            .attr("data-position", "bottom")
            .attr("class", "tooltipped");
    },


    /**
     * Call it when there is some change in the apps filter.
     */
    notifyAppsFilterChanged: function () {
        this.printAppsSwimlanes();
    }

};


