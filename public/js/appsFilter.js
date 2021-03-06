/**
 * Created by Maxime on 27/07/2015.
 */

/**
 * Manage the application filter that allow visualization of focused applications.
 * @type {{MAX_FILTERED_APP_SIZE: number, FiltredApps: Array, init: Function, printAppsByFilterCounter: Function}}
 */
var AppsFilter = {


    /**
     * Maximum Number of filtered apps in the same time, depends of the layout
     */
    MAX_FILTERED_APP_SIZE: 10,

    /**
     * List of apps name currentely filtered
     */
    FiltredApps: [],


    /**
     * Initialize aplication list and triggers to view filtered applications
     */
    init: function () {
        var self = this;
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
                    var json_app = JSON.parse(app);

                    //If database have changed...
                    if (json_app.name != item.name) {
                        app_data = {id: item.id, name: item.name, count: 0};
                        localStorage.setItem('app_' + item.id, JSON.stringify(app_data));
                    }

                    else {
                        app_data = json_app;
                    }
                }


                apps_counter.push(app_data);

            });

            self.printAppsByFilterCounter(apps_counter);

            $(".filter.app").change(function (e) {
                var appName = $(e.target).attr("value");
                var appID = $(e.target).attr("id");
                if ($(e.target).is(':checked')) {
                    if (self.FiltredApps.length >= (self.MAX_FILTERED_APP_SIZE)) {
                        Materialize.toast(_t.limitAppsFilter + self.MAX_FILTERED_APP_SIZE, 4000);
                        $(e.target).prop('checked', false);
                        return;
                    }

                    //Save check counter in localStorage
                    var app = localStorage.getItem('app_' + appID);

                    app = JSON.parse(app);
                    var app_data = {id: app.id, name: app.name, count: app.count + 1};

                    localStorage.setItem('app_' + appID, JSON.stringify(app_data));


                    var c = Legend.addLegend(appName);
                    self.FiltredApps.push({name: appName, color: c});
                    AppsSwimlane.notifyAppsFilterChanged();
                }
                else {
                    Legend.removeLegend(appName);
                    self.FiltredApps = self.FiltredApps.filter(function (e) {
                        return e.name != appName
                    });
                    notifyAppsFilterChanged();
                }
            });
        });

    },


    /**
     * Print application list in the application filter div
     * @param apps : array of apps objects (name dans number of usage)
     */
    printAppsByFilterCounter: function (apps) {
        apps.sort(function (a, b) {
            return b.count - a.count;
        });

        for (var i = 0; i < apps.length; i++) {
            $("#appsFilter").append("<li><input type='checkbox' value='" + apps[i].name + "' class='filter app' id='" + apps[i].id + "'><label for='" + apps[i].id + "'>" + (apps[i].name.length > 30 ? (apps[i].name.substr(0, 27) + "...") : apps[i].name) + "</label></li>");

        }
    }

};

// Init the application filter
AppsFilter.init();