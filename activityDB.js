/**
 * Created by Maxime on 13/08/2015.
 */


var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var db;

module.exports = {

    xdb : "undefined",
    state: "not checked",
    
    madeAllActivity: function(xdb){

        this.state = "calculating";

        this.xdb = xdb;

        var self = this;
        if(!fs.existsSync("public/images/screenshots/"))
        {
            window.console.log("ERROR: Symbolic link to screenshot not exist. Activity calculating is not possible.");
            this.state = "error";
            return;
        }

        var self = this;
        db = new sqlite3.Database(xdb.get("SELFSPY_PATH")+"/selfspy.sqlite", function(error){
            if(error != null){
                window.console.log("ERROR: Can not access database. Activity calculating is not possible.");
                this.state = "error";
            }
            else
            {
                self.makeAll(xdb);
            }
        });

    },

    deleteActivityBetween : function(start, stop){
        var res = [];
        var activity = this.xdb.get("backgroundActivity");

        for(var i = 0 ; i < activity.length ; i++){
            var activityStart = new Date(activity[i].start),
                activityStop = new Date(activity[i].stop);

            if(activityStart >= start && activityStop <= stop) //inside
            {
                continue;
            }
            if(activityStart >= start && activityStart <= stop) // start inside
            {
                res.push({start: stop, stop:activityStart});
                continue;
            }
            if(activityStop >= start && activityStop <= stop) //stop inside
            {
                res.push({start:activityStart, stop:stop});
                continue;
            }
            //else of all
            res.push({start:activityStart, stop:activityStop});
            this.xdb.set("backgroundActivity", res);
        }
    },

    makeAll: function(xdb){
        this.xdb = xdb;
        var allScreenshots = removeHiddenFiles(fs.readdirSync("public/images/screenshots/"));

        if(allScreenshots[allScreenshots.length - 1] == xdb.get("lastScreenshotWhenLastActivity"))
        {
            window.console.log("NOTICE: No need to recalculate the activity.");
            this.state = "done";
            return;
        }
        var lastscs = xdb.get("lastScreenshotWhenLastActivity");
        var useFrom = false;
        if(lastscs != false){
            useFrom = true;
            window.console.log("NOTICE: Calculate the partial activity, from " + getJSDateAndTime(lastscs) + " to " + getJSDateAndTime(allScreenshots[allScreenshots.length -1]));
        }
        var res = [];
        //Activity by snapshot table
        var query = "SELECT * FROM snapshot ; ";
        if(useFrom)
            query = "SELECT * FROM snapshot WHERE created_at > '"+formatJSToSQLITE(getJSDateAndTime(lastscs))+"';";
        db.all(query, function (err, rows) {
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
            var i;
            if(useFrom)
                for(i=0; allScreenshots[i]!= lastscs; i++){
                    if(typeof(allScreenshots[i]) == "undefined"){
                        window.console.log("ERROR: Trying to find a screenshot from another folder. Give up.");
                        this.state="error";
                        return;
                    }
                }
            else
                i = 0;
            for(; i != allScreenshots.length; i++)
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
                stop.setMinutes(stop.getMinutes()+1);

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

            var trueResult = [];
            if(res.length > 0)
                trueResult.push(res[0]);
            for(var i = 1 ; i < res.length ; i++)
            {
                var encours = res[i];
                var lastTrue = trueResult[trueResult.length - 1];

                var lastTrueStop = new Date(lastTrue.stop);
                var encoursStart = new Date(encours.start);

                if(encoursStart - lastTrueStop <= 300000 && encours.apps == lastTrue.apps) //5min
                {
                    trueResult[trueResult.length -1].stop = encours.stop;
                }
                else{
                    trueResult.push(encours);
                }
            }
            if(useFrom)
                xdb.set("backgroundActivity", xdb.get("backgroundActivity").concat(trueResult));
            else
                xdb.set("backgroundActivity", trueResult);
            xdb.set("lastScreenshotWhenLastActivity", allScreenshots[allScreenshots.length - 1]);
            this.state = "done";
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

function getJSDateAndTime(screenshotName){

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

function formatJSToSQLITE(jsDate) {
    return 'Y-m-d h:k:s.p'
        .replace('Y', jsDate.getFullYear())//i'v got 85 years to add the 0 ... YOU, CODER OF 2100, do you still eat pancakes ? The climate still allow me to eat ice cream,  you ? mouhahaha
        .replace('m', jsDate.getMonth() + 1 < 10 ? '0' + (jsDate.getMonth() + 1) : jsDate.getMonth() + 1)
        .replace('d', jsDate.getDate() < 10 ? '0' + jsDate.getDate() : jsDate.getDate())
        .replace('h', jsDate.getHours() < 10 ? '0' + jsDate.getHours() : jsDate.getHours())
        .replace('k', jsDate.getMinutes() < 10 ? '0' + jsDate.getMinutes() : jsDate.getMinutes())
        .replace('s', jsDate.getSeconds() < 10 ? '0' + jsDate.getSeconds() : jsDate.getSeconds())
        .replace('p', jsDate.getMilliseconds());
}