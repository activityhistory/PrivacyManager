/**
 * Created by Maxime on 24/08/2015.
 */

/**
 * Different help functions
 * @type {{putGroupOnTheTop: Function, getJSDateAndTime: Function, JSONToDate: Function}}
 */

var util = {
    /**
     * Put a group (<g>) of elements at the end of the parent element.
     * Works with classes, with each element of the class.
     * @param groupClass : name of the class, without "."
     */
    putGroupOnTheTop : function (groupClass) {
        var group = $("."+groupClass);

        group.each(function(id, one){
            var groupe = $(one)[0];
            groupe.parentNode.appendChild(groupe);
        });
    },

    /**
     * Return a date object from the screenshot's name
     * @param screenshotName
     * @returns {Date}
     */
    getJSDateAndTime: function(screenshotName){
        var splited = screenshotName.split("\.")[0].split("_")[0].split("-");
        var date = splited[0];
        var time = splited[1];


        var year = date.substring(0, 2);
        var month = date.substring(2, 4);
        var day = date.substring(4, 6);

        var hour = time.substring(0, 2);
        var min = time.substring(2, 4);
        var sec = time.substring(4, 6);
        var nanSec = time.substr(9);

        return new Date('20' + year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec + ":" + nanSec);

    },


    /**
     * Return a array of date from a json object full of dates
     * @param jsonD
     * @returns {Array}
     * @constructor
     */
    JSONToDate: function (jsonD) {
        var dateList = [];
        jsonD.forEach(function (one) {
            //Conversion to Date format
            var d = new Date(one);
            dateList.push(d);
        });
        return dateList;
    }
};
