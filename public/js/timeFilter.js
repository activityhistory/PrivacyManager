/**
 * Created by Maxime on 30/07/2015.
 */

$(function () {
    $(".filter.time").change(function (e) {
        if ($(e.target).is(':checked')) {
            var c = addLegend("Unauthorized times");
            setTimeFilterColor(c);
            notifyTimeFilterChanged();
        }
        else {
            removeLegend("Unauthorized times");
            removeTimeFilter();
        }
    });
});

