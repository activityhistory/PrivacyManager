/**
 * Created by Maxime on 20/07/2015.
 */

//d3_smallSlider


var interVal = {start: new Date(), stop: new Date(), data: "", currentDate: new Date()};
var runningApps = [];
var windowsData = [];



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

$(document).ready(function () {
    //Context navigation
    $('#previousContext').click(function () {
        if (typeof($('#previousContext img').attr('src')) !== 'undefined') {
            //Get screenshot's name
            var screenshotName = $('#previousContext img').attr('src').split('/')[3];
            var date = getJSDateAndTime(screenshotName);

            manualMoveSmallSlder(date);
        }
    });

    $('#nextContext').click(function () {
        if (typeof($('#nextContext img').attr('src')) !== 'undefined') {
            //Get screenshot's name
            var screenshotName = $('#nextContext img').attr('src').split('/')[3];
            var date = getJSDateAndTime(screenshotName);

            manualMoveSmallSlder(date);
        }
    });

    $('.modal-trigger').leanModal();

    $('#lever_selfspyLocation').change(function () {
        var state = $('#lever_selfspyLocation').is(':checked');
        localStorage.setItem('ask_location', state);
    });

    if (localStorage.getItem('ask_location') == 'true') {
        $('#lever_selfspyLocation').prop('checked', true);
    }
});


function getJSDateAndTime(screenshotName) {

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
}

ActivityManager.init();

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

$.get("/all_windows_list", function (data) {
    windowsData = data.windows;
});