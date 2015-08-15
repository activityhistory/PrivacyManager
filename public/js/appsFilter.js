/**
 * Created by Maxime on 27/07/2015.
 */

var FiltredApps =[];

var MAX_FILTERED_APP_SIZE = 4;


$.get("/all_apps_list", function (data) {
    $("#appsFilter").html('');
    var apps = data.apps;
    var apps_counter = [];
    $.each(apps, function (i, item) {
        var app_data = {};


        //Save apps list in LocalStorage
        var app = localStorage.getItem('app_' + item.id);

        if (app == null) {
            app_data = {id: item.id, name: item.name, count: 0};
            localStorage.setItem('app_' + item.id, JSON.stringify(app_data));
        }
        else {
            app_data = JSON.parse(app);
        }


        apps_counter.push(app_data);

    });

    printAppsByFilterCounter(apps_counter);

    $(".filter.app").change(function (e) {
        var appName = $(e.target).attr("value");
        var appID = $(e.target).attr("id");
        if($(e.target).is(':checked')) {
            if(FiltredApps.length >= (MAX_FILTERED_APP_SIZE)){
                Materialize.toast("You can not add another apps filter : the limit is " + MAX_FILTERED_APP_SIZE, 4000);
                $(e.target).prop('checked', false);
                return;
            }

            //Save check counter in localStorage
            var app = localStorage.getItem('app_' + appID);

            app = JSON.parse(app);
            var app_data = {id: app.id, name: app.name, count: app.count + 1};

            localStorage.setItem('app_' + appID, JSON.stringify(app_data));



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

function printAppsByFilterCounter(apps) {
    console.log(apps);
    apps.sort(function (a, b) {
        console.log(a.count - b.count);
        return b.count - a.count;
    });

    console.log(apps);
    for (var i = 0; i < apps.length; i++) {
        console.log(apps[i].count);
        $("#appsFilter").append("<li><input type='checkbox' value='" + apps[i].name + "' class='filter app' id='" + apps[i].id + "'><label for='" + apps[i].id + "'>" + (apps[i].name.length > 30 ? (apps[i].name.substr(0, 27) + "...") : apps[i].name) + "</label></li>");

    }
}