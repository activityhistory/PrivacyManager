/**
 * Created by Maxime on 30/07/2015.
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

