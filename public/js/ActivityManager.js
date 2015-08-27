/**
 * Created by Maxime on 13/08/2015.
 */


var ActivityManager = {

    allActivityData: [],


    init : function(){
        var self = this;
        return new Promise(function(ok,ko){
            $.get("/getActivity", function (data) {
                if(data.result == false)
                {
                    Materialize.toast("Please wait during activity calculating. This could take time.", 15000);
                    setTimeout(function(){
                        Materialize.toast("Tring to get activity ...", 1000);
                        $.get("/getActivity", function (data) {
                            if(data.result == false)
                            {
                                Materialize.toast("No activity data found. Please wait a little more and restart the app.");
                                ko();
                            }
                            else{
                                Materialize.toast("Activity is now updated. The app will restart soon.", 1000);
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
                    self.changeAllDataToDate();
                    ok();

                }
            })
                .fail(function(){
                    alert("Error during getting activity data. Please restart.");
                    ko();
                });

        });
    },


    changeAllDataToDate : function(){
      for(var i = 0 ; i != this.allActivityData.length ; i++)
      {
          this.allActivityData[i].start = new Date(this.allActivityData[i].start);
          this.allActivityData[i].stop = new Date(this.allActivityData[i].stop);
      }
    },


    isOnActivity : function(date){
        var d = new Date(date);
        for(var i = 0 ; i!= this.allActivityData.length; i++){
           if(d >= this.allActivityData[i].start && d <= this.allActivityData[i].stop )
            return true;
        }
        return false;
    }
};



