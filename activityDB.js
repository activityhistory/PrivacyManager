/**
 * Created by Maxime on 13/08/2015.
 */


var fs = require('fs');

module.exports = {


    madeAllActivity: function(xdb, db){

        var allScreenshots = removeHiddenFiles(fs.readdirSync("public/images/screenshots/"));

        if(allScreenshots[allScreenshots.length - 1] == xdb.get("lastScreenshotWhenLastActivity"))
        {
            window.console.log("NOTICE: No need to recalculate the activity.");
            return;
        }
        var res = [];
        //Activity by snapchot table
        db.all("SELECT * FROM snapshot ; ", function (err, rows) {
            var encours = {start:"undefined", stop:"undefined", apps:"undefined"};
            var theVeryLastTime = NaN;
            for(var i = 0 ; i != rows.length; i++){
                var row = rows[i];
                if(encours.start == "undefined")
                {
                    encours.start = row.created_at;
                    encours.apps = row.state;
                    theVeryLastTime = row.created_at;
                    continue;
                }
                if(encours.apps != row.state || new Date(row.created_at) - new Date(theVeryLastTime) > 120000 )
                {
                    res.push({start:encours.start, stop:theVeryLastTime, apps:encours.apps});
                    encours.start = row.created_at;
                    encours.apps = row.state;

                    theVeryLastTime = row.created_at;
                    continue;
                }
                if(i == (rows.length -1))
                {
                    res.push({start:encours.start, stop:theVeryLastTime, apps:encours.apps});
                }
                theVeryLastTime = row.created_at;
            }
            //Activity by screenshots (...)
            var notInAnyActivityScreenshots = [];
            for(var i = 0 ; i != allScreenshots.length; i++)
            {
                if(!isOnOneRange(res, getJSDateAndTime(allScreenshots[i])))
                    notInAnyActivityScreenshots.push(allScreenshots[i]);
            }
            //Add 2min ranges to each screenshots that aren't in a range
            for(var i=0; i != notInAnyActivityScreenshots.length ; i++)
            {
                var unClassedScreenshot = notInAnyActivityScreenshots[i];
                var start = getJSDateAndTime(unClassedScreenshot);
                var stop = getJSDateAndTime(unClassedScreenshot);
                start.setMinutes(start.getMinutes()-1);
                stop.getMinutes(stop.getMinutes()+1);

                res.push({start: start, stop:stop, apps:"undefined"});
            }
            res.sort(compare);

            //Add apps to new ranges and remove les parties qi s'emnjambent
            for(var i = 1 ; i < res.length ; i++)
            {
                var one = res[i-1];
                var two = res[i];

                var oneStop = new Date(one.stop);
                var twoStart = new Date(two.start);
                if(oneStop > twoStart)
                {
                    one.stop = two.start;
                }
                if(two.apps == "undefined")
                    two.apps = one.apps;
            }

            //Add apps to the firsts ranges if it's undefined
            var i;
            for(i=0; res[i].apps == "undefined" ; i++);
            for(var k = 0 ; k != i; k++)
                res[k].apps = res[i].apps;
            xdb.set("backgroundActivity", res);
            xdb.set("lastScreenshotWhenLastActivity", allScreenshots[allScreenshots.length - 1]);
        });

    }

};
function isOnOneRange(rangeSet, _date)
{
    var date = new Date(_date);
    for(var i = 0 ; i != rangeSet.length; i++)
    {
        var start = new Date(rangeSet[i].start);
        var stop = new Date(rangeSet[i].stop);
        if(date >= start && date <= stop) {
            return true;
        }
    }
    return false;
}

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

//TODO : remove all files started by a .
function removeHiddenFiles(fileSet)
{
    var r = [];
    fileSet.forEach(function(one){
        if(one != ".DS_Store")
            r.push(one);
    });
    return r;
}

function compare(_a,_b) {
    var a = new Date(_a.start);
    var b = new Date(_b.start);
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}
