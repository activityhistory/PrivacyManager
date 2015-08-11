/**
 * Created by Maxime on 27/07/2015.
 */



var FiltredApps =[];

$.get("/all_apps_list", function (data) {
    $("#appsFilter").html('');
    var names = data.names;
    $.each(names, function (i, item) {
        $("#appsFilter").append("<li><input type='checkbox' value='" + item.name + "' class='filter app' id='" + item.name + "'><label for='" + item.name + "'>" + (item.name.length > 30 ? (item.name.substr(0, 27) + "...") : item.name) + "</label></li>");
    });
    $(".filter.app").change(function (e) {
        var appName = $(e.target).attr("value");
        if($(e.target).is(':checked')) {
            var c = addLegend(appName);
            FiltredApps.push({name: appName, color: c});
            notifyAppsFilterChanged();
        }
        else
        {
            removeLegend(appName);
            FiltredApps = FiltredApps.filter(function(e){ return e.name != appName });
            notifyAppsFilterChanged();
        }
    });
});
