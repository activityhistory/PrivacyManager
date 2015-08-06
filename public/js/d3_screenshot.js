/**
 * Created by Maxime on 23/07/2015.
 */


$(document).ready(function () {
    $("#fullScreen").click(function (event) {


        if ($('#bigScreenShot').css("position") == 'fixed') {
            $('#bigScreenShot').css({
                position: 'relative',
                width: '530px',
                height: '365px'
            });
        }
        else {
            $('#bigScreenShot').css({
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 999,
                width: '100%',
                height: '100%'
            });
        }
    });

   // document.addEventListener('appIDfound');
});

function printScreenshotContext(){

}


//TODO
function printScreenshot(date) {

    //Get main screenshot
    if (interVal.currentDate.valueOf() == date.valueOf) {
        return false; //because this function could be call many times for the same datetime
    }
    interVal.currentDate = date;

    var betterImg;
    var betterDiff;
    //var imagePosition;
    for (var i = 0; i != interVal.data.length; i++) {
        var one = interVal.data[i];
        var diff = Math.abs(one.date - date);
        if (isNaN(betterDiff) || diff < betterDiff) {
            betterImg = one.screenshot;
            betterDiff = diff;
        }
    }

    //CHANGE HERE IF YOU WANT TO ALWAYS SEE A Screenshot ( also when you'r far away)
    if (betterDiff / 1000 < 60)
        $("#image img").attr("src", '/images/screenshots/' + betterImg); //  file:///Users/Maxime/.selfspy/screenshots/
    else
        $("#image img").attr("src", '/images/no-image.jpg');


    //Get informations about current screenshot
    $.get('/getScreenshotInfos', {date : ''+date},  function (data) {

        $('#mainScreenshotInfos').html('App : '+data.informations.process_name+'<br/>' +
            'Time : ' +  date.toTimeString()+ '<br/>');

        if(data.informations.window_title !== ''){
            $('#mainScreenshotInfos').append('Window title : ' + data.informations.window_title) ;
        }

        //Find previous app screenshot

        var betterPreviousImg;
        var betterPreviousDiff;

        var previousContextDate = new Date(data.context.previousContext.created_at);

        for (var i = 0; i != interVal.data.length; i++) {
            var one = interVal.data[i];
            var diff = Math.abs(one.date - previousContextDate);
            if (isNaN(betterPreviousDiff) || diff < betterPreviousDiff) {
                betterPreviousImg = one.screenshot;
                betterPreviousDiff = diff;
            }
        }


        $("#previousContext .smallSCS").attr("src", '/images/screenshots/' + betterPreviousImg);

        $("#previousContext .appName").html('App name : ' + data.context.previousContext.process_name);


        //Find next app screenshot

        var betterNextImg;
        var betterNextDiff;

        var nextContextDate = new Date(data.context.nextContext.created_at);

        for (var i = 0; i != interVal.data.length; i++) {
            var one = interVal.data[i];
            var diff = Math.abs(one.date - nextContextDate);
            if (isNaN(betterNextDiff) || diff < betterNextDiff) {
                betterNextImg = one.screenshot;
                betterNextDiff = diff;
            }
        }

        $("#nextContext .smallSCS").attr("src", '/images/screenshots/' + betterNextImg);

        $("#nextContext .appName").html('App name : ' + data.context.nextContext.process_name);


    });




/*
    var currentMiniScreenPosition = -3;
    $(".miniscreenshots img").each(function () {
        if((imagePosition + currentMiniScreenPosition) < 0 || (imagePosition + currentMiniScreenPosition)  > ( interVal.data.length -1))
            $(this).attr("src", '/images/no-image.jpg');
        else
        $(this).attr("src", '/images/screenshots/' + interVal.data[imagePosition + currentMiniScreenPosition].screenshot);
        currentMiniScreenPosition++;
        currentMiniScreenPosition = currentMiniScreenPosition == 0 ? currentMiniScreenPosition+1 : currentMiniScreenPosition;

    })
*/

}
