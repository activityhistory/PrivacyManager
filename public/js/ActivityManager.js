/**
 * Created by Maxime on 13/08/2015.
 */

/**
 * Object to manage activity
 * @type {{allActivityData: Array, init: Function, changeAllDataToDate: Function}}
 */
var ActivityManager = {

    /**
     * Array that contains all user activity
     */
    allActivityData: [],


    /**
     * Init activity data
     * @returns {Promise}
     */
    init: function () {
        var self = this;
        return new Promise(function (ok, ko) {


            $.get("/getActivity", function (data) {
                if (data.result != false) {
                    self.allActivityData = data.result;
                    self.changeAllDataToDate(_t.errorGetActivity);
                    ok();
                }
                else {


                    function checkState() {
                        $.get("/activityCalculerState", function (data) {
                            if (data.state == "done") {
                                return "ok";
                            }
                            else if (data.state == "error") {
                                return "error";
                            }
                            else //calculating
                            {
                                return "calculating";
                            }
                        })
                    }


                    Materialize.toast(_t.waitActivityCalc, 4000);
                    var nb = 0;
                    while (checkState() == "calculating" && nb < 15) {
                        nb++;
                    }
                    var state = checkState();
                    if (state == "error" || state == "calculating") {
                        Materialize.toast(_t.noActivityFound);
                        ko();
                    }
                    //Here all other stuff are already loaded, and get error, so we have to reboot.
                    //this problem could be resolved by usiong promise in all the app.
                    console.log("Rebboting beacsue of too slow activity getting.");
                    setTimeout(function () {
                        document.location.href = "http://localhost:2323/";
                    }, 1000);
                }


            });

        });
    },


/**
 * Convert all activity's date to Date JS object
 */
changeAllDataToDate : function () {
    for (var i = 0; i != this.allActivityData.length; i++) {
        this.allActivityData[i].start = new Date(this.allActivityData[i].start);
        this.allActivityData[i].stop = new Date(this.allActivityData[i].stop);
    }
}
,


}
;



