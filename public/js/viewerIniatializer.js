/**
 * Created by Maxime on 20/07/2015.
 */

    //d3_smallSLider


var interVal = {start: new Date(), stop: new Date(), data: "", currentDate: new Date()};


interVal.stop = new Date;
var t = new Date();
t.setHours(6);
t.setMinutes(0);
t.setSeconds(0);
interVal.start = t;


var xSmallSlider;
var brush;

//main time scale
var x;

$.get("/getAllRecordedDays", function (data) {
    x = initBigSlider(data.allRecordedDays);
    $.get("/allScreenshotsDateAndTime", function (data) {
        printMiniItems(data.allRecords);
        brush = initBrush();
        xSmallSlider = initializeSmallSlider();
    })
});


function JSONToDate(jsonD) {
    dateList = [];
    jsonD.forEach(function (one) {
        //Conversion to Date format
        var d = new Date(one);
        dateList.push(d);
    });
    return dateList;
}