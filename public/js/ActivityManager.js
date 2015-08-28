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
    init : function(){
        var self = this;
        return new Promise(function(ok,ko){
            $.get("/getActivity", function (data) {
                if(data.result == false)
                {
                    console.log(_t);
                    Materialize.toast(_t.waitActivityCalc, 15000);
                    setTimeout(function(){
                        Materialize.toast(_t.tryGetActivity, 1000);
                        $.get("/getActivity", function (data) {
                            if(data.result == false)
                            {
                                Materialize.toast(_t.noActivityFound);
                                ko();
                            }
                            else{
                                Materialize.toast(_t.activityOkRestart, 1000);
                                setTimeout(function () {
                                    document.location.href = "http://localhost:2323/";
                                }, 1100);
                            }
                        });

                    }, 15000);
                }
                else
                {
                    self.allActivityData = data.result;
                    self.changeAllDataToDate(_t.errorGetActivity);
                    ok();

                }
            })
                .fail(function(){
                    ko();
                });

        });
    },


    /**
     * Convert all activity's date to Date JS object
     */
    changeAllDataToDate : function(){
      for(var i = 0 ; i != this.allActivityData.length ; i++)
      {
          this.allActivityData[i].start = new Date(this.allActivityData[i].start);
          this.allActivityData[i].stop = new Date(this.allActivityData[i].stop);
      }
    }
};



