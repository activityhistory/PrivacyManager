/**
 * Created by Maxime on 23/07/2015.
 */

function printScreenshot(date) {


    //Get main screenshot
    if (interVal.currentDate.valueOf() == date.valueOf) {
        return false; //because this function could be call many times for the same datetime
    }
    interVal.currentDate = date;

    var betterImg;
    var betterDiff;
    var imagePosition;
    var mainAppID;
    var mainWindowID;

    for (var i = 0; i != interVal.data.length; i++) {
        var one = interVal.data[i];
        var diff = Math.abs(one.date - date);
        if (isNaN(betterDiff) || diff < betterDiff) {
            betterImg = one.screenshot;
            betterDiff = diff;
            imagePosition = i;
        }
    }

    //CHANGE HERE IF YOU WANT TO ALWAYS SEE A Screenshot ( also when you'r far away)
    if (betterDiff / 1000 < 60){
        //interVal.currentIndex = imagePosition;

        var img_width;
        var img_height;

        $('#bigScreenShot').height('100%');
        $('#bigScreenShot').width('100%');

        $('.card-content').show();

        $("#bigScreenShot")
            .attr("src", '/images/screenshots/' + betterImg)
            .load(function () {
                img_width = this.width;
                img_height = this.height;

                var ratioImg = Math.round(img_width / img_height);

                //Change visualisation disposition if 2 screens
                if (ratioImg >= 3) {
                    //Move previous context side:
                    $('#previousContext').css({'float': 'right', 'height': '50%'});
                    $('#previousContext img.smallSCS').css({
                        'margin-top': '0',
                        'height': 'auto',
                        'max-height': '150px'
                    });

                    //Change next context height
                    $('#nextContext').css({'height': '50%'});
                    $('#nextContext img.smallSCS').css({'margin-top': '0', 'height': 'auto', 'max-height': '150px'});


                    //Change main screenshot col
                    $('#mainContext').removeClass('s6');
                    $('#mainContext').addClass('s9');

                }
                //Screenshot with only 1 screen
                else {
                    /*var max_height = 264;
                     if (img_height > max_height) {
                     img_width *= max_height / img_height;
                     }*/
                    $('#previousContext').css({'float': 'left', 'height': '100%'});
                    $('#previousContext img.smallSCS').css({'margin-top': '65px', 'height': 'auto'});

                    $('#nextContext').css({'height': '100%'});
                    $('#nextContext img.smallSCS').css({'margin-top': '65px', 'height': 'auto'});

                    /*$('#bigScreenShot').height(max_height);
                     $('#bigScreenShot').width(img_width);*/


                    $('#mainContext').removeClass('s9');
                    $('#mainContext').addClass('s6');
                }
            })
        ;
        //Get app id and window id
        var tmp_app = betterImg.split('app');
        var tmp_win = betterImg.split('win');

        //Error case when the screenshot's name doesn't contain the app ID and the window ID
        if(tmp_app[0] === betterImg || tmp_win[0] === betterImg){
            return;
        }
        else{
            mainAppID = parseInt(tmp_app[1].split('_')[0]);
            mainWindowID = parseInt(tmp_win[1].split('_')[0]);

            //Get main screenshot's data
            var app_name = JSON.parse(localStorage.getItem('app_' + mainAppID)).name;

            var win_title = windowsData[mainWindowID];

            //Print main screenshot's data
            var min = (date.getUTCMinutes < 10) ? '0' + date.getUTCMinutes() : date.getUTCMinutes();
            var month = (date.getUTCMonth() < 10) ? '0' + date.getUTCMonth() : date.getUTCMonth();
            var day = (date.getUTCDay() < 10) ? '0' + date.getUTCDay() : date.getUTCDay();

            $('#date').html(date.getUTCFullYear() + '/' + month + '/' + day + ' <span>' + date.getHours() + ':' + min + '</span>');

            $('#mainAppName').html(app_name + '<br/> <span class="truncate"> ' + win_title + '</span>');

            //$('#windowTitle').html('Window title : <br/>' + win_title);
            //Get running apps
            var bestDiff;
            var bestRunningAppsIDList = [];

            for (j = 0; j < runningApps.length; j++) {
                var one = runningApps[j];
                var diff = Math.abs(one.date - date);
                if (isNaN(bestDiff) || diff < bestDiff) {
                    bestDiff = diff;
                    bestRunningAppsIDList = one.runningAppsID.replace('[', '').replace(']', '').replace(' ', '').split(',');
                }
            }

            //Print running apps' name
            var runningAppsString = '';

            if (bestRunningAppsIDList.length > 0) {
                $('.card-content').show();

                runningAppsString = 'Other running apps: ';

                $('#runningApps').show();
                $('#runningApps').html('<br/> Other running apps : <br/> ');

                $('#runningApps').append('<ul class="contextAppsList"></ul>');

                var a = 0;
                for (k = 0; k < bestRunningAppsIDList.length; k++) {
                    var id = parseInt(bestRunningAppsIDList[k]);

                    var app = localStorage.getItem('app_' + id);
                    if (app != null) {
                        var appName = JSON.parse(app);
                        $('#runningApps ul').append('<li>' + appName.name + '</li>');

                        if (a < 9) {
                            if (a === 0)
                                runningAppsString += appName.name;
                            else
                                runningAppsString += ', ' + appName.name;
                        }
                        else if (a === 9) {
                            runningAppsString += '...';
                        }
                        a++;
                    }
                }
            }

            //Will print the running apps when main screenshot is in full screen
            $("#bigScreenShot")
                .attr("data-caption", app_name + ' - ' + win_title);


            var bestPreviousAppId;
            var bestPreviousSS = -1;


            //Find previous app screenshot
            for (var j = imagePosition - 1; j--;) {
                if (typeof(interVal.data[j]) !== 'undefined') {
                    var currentScreenshotName = interVal.data[j].screenshot; //TODO: test if screenshot realy exists
                    var tmp = currentScreenshotName.split('app');
                    //If appID found in screenshot name
                    if (tmp[0] != currentScreenshotName) {
                        bestPreviousSS = currentScreenshotName;
                        var appID = tmp[1].split('_')[0];
                        if (appID != mainAppID) {
                            bestPreviousAppId = appID;
                            break;
                        }
                    }
                }
            }


            //Find next app screenshot
            var bestNextAppId;
            var bestNextSS = -1;

            if (imagePosition < interVal.data.length) {
                for (var k = imagePosition + 1; k != interVal.data.length; k++) {
                    if (typeof(interVal.data[k]) !== 'undefined') {
                        var currentScreenshotName = interVal.data[k].screenshot;
                        var tmp = currentScreenshotName.split('app');
                        //If appID found in screenshot name
                        if (tmp[0] != currentScreenshotName) {
                            var appID = tmp[1].split('_')[0];
                            if (appID != mainAppID) {
                                bestNextSS = currentScreenshotName;
                                bestNextAppId = appID;
                                break;
                            }
                        }
                    }
                }
            }

            var previous_app = JSON.parse(localStorage.getItem('app_' + bestPreviousAppId));
            var next_app = JSON.parse(localStorage.getItem('app_' + bestNextAppId));

            //TODO unbind maxime
            //Print context data
            if (previous_app !== null) {
                var previous_appName = previous_app.name;
                $('#previousContext .smallSCS').attr("src", '/images/screenshots/' + bestPreviousSS);
                $('#previousContext .appName').html(previous_appName);
                //$('#previousContext .smallSCS').click(goToOneScreenshot(bestPreviousSS));
            }
            else {
                $('#nextContext .smallSCS').attr("src", '/images/no-image.jpg');
            }
            if (next_app != null) {
                var next_appName = next_app.name;

                $('#nextContext .smallSCS').attr("src", '/images/screenshots/' + bestNextSS);
                $('#nextContext .appName').html(next_appName);
                //$('#nextContext .smallSCS').click(goToOneScreenshot(bestNextSS));
            }
            else {
                $('#nextContext .smallSCS').attr("src", '/images/no-image.jpg');
            }
        }

    }
    //Error case: no recording for this time-lapse
    else{
        $("#bigScreenShot").attr("src", '/images/no-image.jpg');

        $("#previousContext .smallSCS").attr("src", '/images/no-image.jpg');
        $("#nextContext .smallSCS").attr("src", '/images/no-image.jpg');
        $("#nextContext .appName").html( '');
        $("#previousContext .appName").html( '');

        $('.card-content').hide();
    }

}
