/**
 * Created by Maxime on 28/07/2015.
 */

/**
 * Manage the "will be deleted" swimlane
 * @type {{privacyParams: {unApps: Array, auTimes: {from: string, to: string, weekEnd: string}, auLocations: Array}, willBeDeletedData: Array, willBeDeletedLocations: Array, willBeDeletedByTime: Array, willBeDeletedColor: *, RAZunApps: Function, RAZAuthorizedLocations: Function, addUnApp: Function, setAuthorizedTimes: Function, addAutorizedLocation: Function, checkLocations: Function, checkDeletedApps: Function, checkUnauthorizedTimes: Function, MAJWillBeDeletedSwimlane: Function, getFilterdApps: Function, putAllOtherSwimlaneToTheTop: Function}}
 */
var willBeDeletedSwimlane = {


    /**
     * Object that keep privacy params up to date
     */
    privacyParams: privacyParams = {
        unApps: [],
        auTimes: {from: "undefined", to: "undefined", weekEnd: "undefined"},
        auLocations: []
    },


    /**
     * List of ranges that should be deleted because of focused apps
     */
    willBeDeletedData: [],
    /**
     * List of ranges that should be deleted because of location
     */
    willBeDeletedLocations: [],
    /**
     * List of ranges that should be deleted because of unauthorized times
     */
    willBeDeletedByTime: [],
    /**
     * The (always same) color of the willbedeleted swimlane
     */
    willBeDeletedColor: Legend.getAColor("Will be deleted"),

    /**
     * Remove all data in unauthorized applications
     */
    RAZunApps: function () {
        this.privacyParams.unApps = [];
    },

    /**
     * Remove all data in unauthorized locations
     */
    RAZAuthorizedLocations: function () {
        this.privacyParams.auLocations = [];
    },

    /**
     * Add an application name to the list of unauthorized applications.
     * @warning : There is not pre-existence test : should have redundant data
     * @param appName : string -> the name of the app.
     */
    addUnApp: function (appName) {
        this.privacyParams.unApps.push(appName);
    },

    /**
     * Update unauthorized times
     * @param dateFrom : Date
     * @param dateTo : Date
     * @param weekend : bool
     */
    setAuthorizedTimes: function (dateFrom, dateTo, weekend) {
        this.privacyParams.auTimes = {from: dateFrom, to: dateTo, weekEnd: weekend};
    },

    /**
     *  Add a location to the authorized location list.
     * @param locationName : String
     * @param _lat : Number
     * @param _long : Number
     */
    addAutorizedLocation: function (locationName, _lat, _long) {
        this.privacyParams.auLocations.push({name: locationName, lat: _lat, long: _long})
    },


    /**
     * Update the list of location that should be deleted,
     * Use LocationFilter Object
     * Then, update the swimlane
     */
    checkLocations: function () {
        this.willBeDeletedLocations = [];

        var self = this;
        LocationFilter.locationData.forEach(function (locationRange) {
            if (locationRange.name == "unknow") {
                self.willBeDeletedLocations.push({start: locationRange.from, stop: locationRange.to, caused_by: "location"});
            }

        });

        if (this.willBeDeletedLocations.length != 0) {
            var chk = $("#unknow.filter.location");
            if (!chk.is(':checked')) {
                chk.prop('checked', true);
                chk.trigger("change");
            }
        }

        this.MAJWillBeDeletedSwimlane();
    },

    /**
     * Update the list of apps that should be deleted
     * then, update the swimlane
     */
    checkDeletedApps: function () {
        var filterdApps = this.getFilterdApps();
        this.willBeDeletedData = filterdApps;
        this.MAJWillBeDeletedSwimlane();
        //extract apps names that will delete some parts
        var appNames = [];
        for (var i = 0; i != filterdApps.length; i++) {
            var an = filterdApps[i].name;
            var ajouter = true;
            for (var k = 0; k != appNames.length; k++) {
                if (appNames[k] == an)
                    ajouter = false;
            }
            if (ajouter == true)
                appNames.push(an);
        }
        //print the filter swimlane of apps that delete some parts
        appNames.forEach(function (one) {
            var inp = $("input[value='" + one + "']");
            if (!inp.is(':checked')) {
                inp.prop('checked', true);
                inp.trigger("change");
            }
        });
    },

    /**
     * Update the list of times range that should be deleted
     * Then update the swimlane
     */
    checkUnauthorizedTimes: function () {
        this.willBeDeletedByTime = timeSwimlane.getUnauthorizedTimeRanges();

        this.willBeDeletedByTime.forEach(function (one) {
            one.caused_by = "Time";
        });

        if (this.willBeDeletedByTime.length != 0) {
            var chk = $(".filter.time");
            if (!chk.is(':checked')) {
                chk.prop('checked', true);
                chk.trigger("change");
            }
        }
        this.MAJWillBeDeletedSwimlane();
    },

    /**
     * Update the "will be deleted" swimlane
     * @constructor
     */
    MAJWillBeDeletedSwimlane: function () {

        var allWillBeDeletedData = (this.willBeDeletedData.concat(this.willBeDeletedByTime)).concat(this.willBeDeletedLocations);

        d3.select("#sliderSVG svg g.willBeDeleted").remove();


        var svg = d3.select("#sliderSVG svg");

        var mini = d3.select("#sliderSVG svg").append('g')
            .attr('transform', 'translate(' + margin.left + ', 15 )')
            .attr('width', width)
            .attr('height', 100)
            .attr('class', 'willBeDeleted');

        var rectangles = mini.selectAll("line")
            .data(allWillBeDeletedData)
            .enter()
            .append("line");


        rectangles
            .attr("x1", function (d) {
                return xSmallSlider(new Date(d.start));
            })
            .attr("x2", function (d) {
                return xSmallSlider(new Date(d.stop));
            })
            .attr("y1", 40)
            .attr("y2", 40)
            .attr("stroke", this.willBeDeletedColor)
            .attr("stroke-width", 80)
            .style("stroke-opacity", 0.15)
            .attr("data-tooltip", function (d) {
                return "Deleted because of " + d.caused_by
            })
            .attr("data-position", "bottom")
            .attr("class", "tooltipped");


        $('.tooltipped').tooltip({delay: 50});

        this.putAllOtherSwimlaneToTheTop();

    },

    getFilterdApps: function () {
        var result = [];
        for (var i = 0; i != AppsSwimlane.currentAppsData.length; i++) {
            for (var k = 0; k != privacyParams.unApps.length; k++) {
                if (AppsSwimlane.currentAppsData[i].name == privacyParams.unApps[k]) {
                    result.push(AppsSwimlane.currentAppsData[i]);

                }
            }
        }


        result.forEach(function (one) {
            one.caused_by = "Application";
        });

        return result;
    },


    putAllOtherSwimlaneToTheTop: function () {
        util.putGroupOnTheTop("appSwimlane");
        util.putGroupOnTheTop("timeSwimlane");
        util.putGroupOnTheTop("locationSwimlane");

    }

};



