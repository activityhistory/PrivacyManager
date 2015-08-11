/**
 * Created by Maxime on 23/07/2015.
 */

//TODO
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
        var img_width;
        var img_height;

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
                    $('#previousContext img.smallSCS').css({'margin-top': '0', 'height': 'auto'});

                    //Change next context height
                    $('#nextContext').css({'height': '50%'});
                    $('#nextContext img.smallSCS').css({'margin-top': '0', 'height': 'auto'});


                    //Change main screenshot col
                    $('#mainContext').removeClass('s6');
                    $('#mainContext').addClass('s9');

                    //$('.material-placeholder').css({'width': 'auto','height': 'auto'});


                }
                else {
                    $('#previousContext').css({'float': 'left', 'height': '100%'});
                    $('#previousContext img.smallSCS').css({'margin-top': '65px', 'height': 'auto'});

                    $('#nextContext').css({'height': '100%'});
                    $('#nextContext img.smallSCS').css({'margin-top': '65px', 'height': 'auto'});

                    //$('.material-placeholder').css({'width': '100%','height': '100%'});

                    $('#mainContext').removeClass('s9');
                    $('#mainContext').addClass('s6');
                }
            });


        var tmp_app = betterImg.split('app');
        var tmp_win = betterImg.split('win');

        if(tmp_app[0] === betterImg || tmp_win[0] === betterImg){
            return;
        }
        else{
            mainAppID = parseInt(tmp_app[1].split('_')[0]);
            mainWindowID = parseInt(tmp_win[1].split('_')[0]);

            var bestPreviousAppId;
            var bestPreviousSS = -1;


            //Find previous app screenshot
            for(var j = imagePosition - 1 ; j -- ;){
                var currentScreenshotName = interVal.data[j].screenshot;
                var tmp  = currentScreenshotName.split('app');
                //If appID found in screenshot name
                if(tmp[0] !== currentScreenshotName){
                    bestPreviousSS = currentScreenshotName;
                    var appID = tmp[1].split('_')[0];
                    if(appID !== mainAppID){
                        bestPreviousAppId = appID;
                        break;
                    }
                }
            }


            //Find next app screenshot
            var bestNextAppId;
            var bestNextSS = -1;

            if(imagePosition <  interVal.data.length){
                for(var k = imagePosition + 1 ; k !=  interVal.data.length ; k++){
                    var currentScreenshotName = interVal.data[k].screenshot;
                    var tmp  = currentScreenshotName.split('app');
                    //If appID found in screenshot name
                    if(tmp[0] !== currentScreenshotName){
                        var appID = tmp[1].split('_')[0];
                        if(appID !== mainAppID){
                            bestNextSS = currentScreenshotName;
                            bestNextAppId = appID;
                            break;
                        }
                    }
                }
            }


            //Get informations about current screenshot
            $.get('/getScreenshotInfos',
                {   mainAppID: mainAppID, mainWindowID: mainWindowID, date: date,
                    previousAppId : bestPreviousAppId, nextAppId: bestNextAppId},
                function (data) {


                   if (typeof data.error !== 'undefined') {
                       console.log('Erreur');
                   }
                   else {
                       var min = (date.getUTCMinutes < 10) ? '0' + date.getUTCMinutes() : date.getUTCMinutes();
                       var month = (date.getUTCMonth() < 10) ? '0' + date.getUTCMonth() : date.getUTCMonth();
                       var day = (date.getUTCDay() < 10) ? '0' + date.getUTCDay() : date.getUTCDay();

                       $('#date').html(date.getUTCFullYear() + '/' + month + '/' + day + ' <span>' + date.getHours() + ':' + min + '</span>');

                       $('.card-content').show();

                       $('#mainAppName').html(data.informations.app_name);

                       var appsOpen = data.appsOpen;
                       var appsOpenString = '';

                       if (appsOpen.length > 0) {
                           appsOpenString += 'Other running apps : ';

                           $('#runningApps').show();
                           $('#runningApps').html('Other running apps : <br/> ');

                           $('#runningApps').append('<ul class="contextAppsList"></ul>');

                           for (var j = 0; j < appsOpen.length; j++) {
                               $('#runningApps ul').append('<li>' + appsOpen[j] + '</li>');
                               if (j < 10) {
                                   if (j === 0)
                                       appsOpenString += appsOpen[j];
                                   else
                                       appsOpenString += ', ' + appsOpen[j];
                               }
                               else if (j === 10) {
                                   appsOpenString += '...';

                               }
                           }

                       }

                       else {
                           $('#runningApps').hide();
                       }

                       $("#bigScreenShot")
                           .attr("data-caption", appsOpenString);


                       //if (data.informations.window_title !== '') {
                       //    $('#screenInfos').append('Window title : ' + data.informations.window_title);
                       //}


                       if(data.context){
                           if(data.context.previous){
                               $('#previousContext .smallSCS').attr("src", '/images/screenshots/' + bestPreviousSS);
                               $('#previousContext .appName').html(data.context.previous.name);
                           }
                           else{
                               $('#nextContext .smallSCS').attr("src", '/images/no-image.jpg');
                           }
                           if(data.context.next){
                               $('#nextContext .smallSCS').attr("src", '/images/screenshots/' + bestNextSS);
                               $('#nextContext .appName').html(data.context.next.name);
                           }
                           else{
                               $('#nextContext .smallSCS').attr("src", '/images/no-image.jpg');

                           }
                       }
                   }
               });

            }

    }
    else{
        $("#image img").attr("src", '/images/no-image.jpg');
        $('#mainScreenshotInfos').html(' ');

        $("#previousContext .smallSCS").attr("src", '/images/no-image.jpg');
        $("#nextContext .smallSCS").attr("src", '/images/no-image.jpg');
        $("#nextContext .appName").html( '');
        $("#previousContext .appName").html( '');

        $('#runningApps').hide();
    }

}
