/**
 * Created by maxime on 15/07/15.
 */
$("#slider-range").slider({
    range: true,
    min: 0,
    max: 1440,
    step: 15,
    values: [480,1080],
    slide: function(e, ui){
        updateRangeText(e, ui);
    },
    stop: ajaxSetRange
}).bind({ //To load the previous time on opening
    change: upadteTetManual()
});


$("#slider-range").trigger('change');



//update the text when the values have been changed manually : that's make no event
function upadteTetManual()
{
    var v = $("#slider-range").slider("values");
    var p = {};
    p.values = v;
    updateRangeText(null, p);
}

function updateRangeText(e, ui) {
    var hours1 = Math.floor(ui.values[0] / 60);
    var minutes1 = ui.values[0] - (hours1 * 60);

    if (hours1.length == 1) hours1 = '0' + hours1;
    if (minutes1.length == 1) minutes1 = '0' + minutes1;
    if (minutes1 == 0) minutes1 = '00';
    if (hours1 >= 12) {
        if (hours1 == 12) {
            hours1 = hours1;
            minutes1 = minutes1 + " PM ";
        } else {
            hours1 = hours1 - 12;
            minutes1 = minutes1 + " PM ";
        }
    } else {
        hours1 = hours1;
        minutes1 = minutes1 + " AM ";
    }
    if (hours1 == 0) {
        hours1 = 12;
        minutes1 = minutes1;
    }



    $('.slider-time').html(' ' + hours1 + ':' + minutes1);

    var hours2 = Math.floor(ui.values[1] / 60);
    var minutes2 = ui.values[1] - (hours2 * 60);

    if (hours2.length == 1) hours2 = '0' + hours2;
    if (minutes2.length == 1) minutes2 = '0' + minutes2;
    if (minutes2 == 0) minutes2 = '00';
    if (hours2 >= 12) {
        if (hours2 == 12) {
            hours2 = hours2;
            minutes2 = minutes2 + " PM";
        } else if (hours2 == 24) {
            hours2 = 11;
            minutes2 = "59 PM";
        } else {
            hours2 = hours2 - 12;
            minutes2 = minutes2 + " PM";
        }
    } else {
        hours2 = hours2;
        minutes2 = minutes2 + " AM";
    }

    $('.slider-time2').html(' ' + hours2 + ':' + minutes2);
}

function ajaxGetRange()
{
    $.get("/getAllowedTimes", function(data){
        var times = data.times;
        var fromHour = times.fromHour;
        var fromMinute = times.fromMinute;
        var toHour = times.toHour;
        var toMinute = times.toMinute;
        var WE = times.WE;

        var startTime = fromHour + ":" + fromMinute;
        var endTime = toHour + ":" + toMinute;

        var minuteStart = normalTimeToMinutesSum(startTime);
        var minuteStop = normalTimeToMinutesSum(endTime);

        console.log("modif en :"+minuteStart + "   " +minuteStop);
        $("#slider-range").slider({values:[minuteStart,minuteStop]});
        upadteTetManual();

    })
}

function ajaxSetRange()
{
    var val = $("#slider-range").slider("values");
    console.log("Val dyu slider : " + val[0] + "   " + val[1]);
    var startTime = miutesSumToNormalTime(val[0]);
    var stopTime = miutesSumToNormalTime(val[1]);

    var fromHour = startTime.split(":")[0];
    var fromMinute =startTime.split(":")[1];
    var toHour = stopTime.split(":")[0];
    var toMinute = stopTime.split(":")[1];
    var WE = $("#includingWE").is(':checked') ? 1 : 0;


    console.log("Envoi de :" + fromHour + " " + fromMinute + " "+ toHour + " " + toMinute);
    //TODO callback to verify if it's OK (also on the sever-side)
    $.get("setAllowedTimes", {fromHour: fromHour, fromMinute: fromMinute, toHour : toHour, toMinute : toMinute, WE : WE});

}

function miutesSumToNormalTime (minutesSum) //not the strange 12 hours format
{
    var h = Math.floor(minutesSum/60);
    var m = minutesSum%60;
    return h + ":" + m;
}

function normalTimeToMinutesSum(normalTime)
{
    var h = normalTime.split(":")[0];
    var m = normalTime.split(":")[1];
    return (parseInt(h)*60) + parseInt(m);
}

//first : get the previous value
ajaxGetRange();

//listen the checkbox change to send the new value
$('#includingWE').change(
    function(){
        ajaxSetRange();
    });