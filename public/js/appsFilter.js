/**
 * Created by Maxime on 27/07/2015.
 */

var FiltredApps =[];

var MAX_FILTERED_APP_SIZE = 4;


$.get("/all_apps_list", function (data) {
    $("#appsFilter").html('');
    var apps = data.apps;
    $.each(apps, function (i, item) {
        $("#appsFilter").append("<li><input type='checkbox' value='" + item.name + "' class='filter app' id='" + item.name + "'><label for='" + item.name + "'>" + (item.name.length > 30 ? (item.name.substr(0, 27) + "...") : item.name) + "</label></li>");

        //Save apps list in LocalStorage
        localStorage.setItem('app_' + item.id, item.name);
    });

    $(".filter.app").change(function (e) {
        var appName = $(e.target).attr("value");
        if($(e.target).is(':checked')) {
            if(FiltredApps.length >= (MAX_FILTERED_APP_SIZE)){
                Materialize.toast("You can not add another apps filter : the limit is " + MAX_FILTERED_APP_SIZE, 4000);
                $(e.target).prop('checked', false);
                return;
            }
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

