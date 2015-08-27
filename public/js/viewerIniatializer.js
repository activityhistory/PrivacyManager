/**
 * Created by Maxime on 20/07/2015.
 */


/**
 * This object contains all data about the current selected range as:
 *  - start and stop date,
 *  - data: screenshots
 *  - current date : where the cursor is
 * @type {{start: Date, stop: Date, data: string, currentDate: Date}}
 */
var interVal = {start: new Date(), stop: new Date(), data: "", currentDate: new Date()};

/**
 * Running apps contains all the data from the snapshot table
 * in particular all the running apps for a date
 * @type {Array}
 */
var runningApps = [];

/**
 * Contains all data about windows from the windows table.
 * The goal is to avoid server's requests
 * @type {Array}
 */
var windowsData = [];

/**
 * D3's time scale object for the small slider
 */
var xSmallSlider;

/**
 * D3's svg brush object for the big slider
 */
var bigSliderBrush;

/**
 * D3's time scale object for the big slider
 */
var xBigSlider;






/* ****************************************
 * **       Sliders' Initialization      **
 * **  Getting data from recorded days   **
 * **************************************** */


interVal.stop = new Date;
var t = new Date();
t.setHours(6);
t.setMinutes(0);
t.setSeconds(0);
interVal.start = t;

ActivityManager.init();

$.get("/getAllRecordedDays", function (data) {
    xBigSlider = initBigSlider(data.allRecordedDays);
    $.get("/allScreenshotsDateAndTime", function (data) {
        printMiniItems(data.allRecords);
        bigSliderBrush = initBrush();
        xSmallSlider = initializeSmallSlider();

        //Init to last activity
        var activity_data = ActivityManager.allActivityData;
        var last_activity_data = activity_data[activity_data.length - 1];
        var stop = last_activity_data.stop;
        var start;
        var i = 6;


        while (activity_data.length < i) {
            i--;
        }

        start = activity_data[activity_data.length - i].start;

        bigsSlider_manuelBrushMove(start, stop);
        brushed();
    })
});

$.get("/all_windows_list", function (data) {
    windowsData = data.windows;
});

$(document).ready(function () {
    //Init context navigation
    $('#previousContext').click(function () {
        if (typeof($('#previousContext img').attr('src')) !== 'undefined') {
            //Get screenshot's name
            var screenshotName = $('#previousContext img').attr('src').split('/')[3];
            var date = util.getJSDateAndTime(screenshotName);

            manualMoveSmallSlder(date);
        }
    });

    $('#nextContext').click(function () {
        if (typeof($('#nextContext img').attr('src')) !== 'undefined') {
            //Get screenshot's name
            var screenshotName = $('#nextContext img').attr('src').split('/')[3];
            var date = util.getJSDateAndTime(screenshotName);

            manualMoveSmallSlder(date);
        }
    });

});