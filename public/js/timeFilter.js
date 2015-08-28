/**
 * Created by Maxime on 30/07/2015.
 */

/**
 * Manage time filter's action (checked or not) from the accordion filter's part.
 * Will add "Unauthorized time" in the legend and also print the related swimlane on the slider.
 */
$(function () {
    $(".filter.time").change(function (e) {
        if ($(e.target).is(':checked')) {
            var c = Legend.addLegend("Unauthorized times");
            timeSwimlane.setTimeFilterColor(c);
            timeSwimlane.notifyTimeFilterChanged();
        }
        else {
            Legend.removeLegend("Unauthorized times");
            timeSwimlane.removeTimeFilter();
        }
    });
});

