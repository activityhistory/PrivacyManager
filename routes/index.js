/*
 * GET home page.
 */

var sqlite3 = require('sqlite3');
sqlite3.verbose();
var Promise = require('promise');
//var db = new sqlite3.Database('selfspy.sqlite');
//var db = new sqlite3.Database(process.env.HOME + '/.selfspy/selfspy.sqlite');
var db; //will be initialize by the call of "initDBPath"
//var db = new sqlite3.Database(localStorage.getItem("SELFSPY_PATH"));
//var db = new sqlite3.Database(localStorage.getItem("SELFSPY_PATH"));
var fs = require('fs');
var pathToScreenShots = "public/images/screenshots/";
//var pathToScreenShots = process.env.HOME + "/.selfspy/screenshots/";
var xdb = require('express-db');


var  path = require('path'),
    activityDB = require(path.join(process.cwd(), 'activityDB.js'));

var distMinBetweenTwoLocations = 2000; // in meters

exports.index = function (req, res) {
    res.render('index', {title: 'ActivityHistory PrivacyTool'});
};


function run_cmd(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
}



exports.initDBPath = initThisAppDatabase;



function initThisAppDatabase(){

    var p = xdb.get("SELFSPY_PATH");
    db = new sqlite3.Database(p + "/selfspy.sqlite");

    run_cmd("ln", ["-s", "-h", "-F", p+"/screenshots", "public/images/screenshots"], function(resp){window.console.log("NOTICE: Just making the link. Answer : " + resp);});
};

exports.checkInitSqlDb = function(){
    db.get('SELECT * FROM privacytimeinterval', [], function (err, row) {
        if(typeof(row) === 'undefined')
        {
            var fromHour = 9,
                toHour = 19,
                fromMinute = 0,
                toMinute = 0,
                WE = 0;
            db.run("INSERT INTO privacytimeinterval (fromHour, toHour, fromMinute, toMinute, weekend) VALUES ( ?,  ?,  ?, ?, ?)", fromHour, toHour, fromMinute, toMinute, WE);
        }
    });
};

exports.un_apps_list = sendUnAppsList;

function sendUnAppsList(req, res) {
    db.all('SELECT * FROM process WHERE authorized_recording == 0', [], function (err, rows) {
        if (err !== null) {
            res.send({ok: false, message: 'error while fetching'});
            console.log('fetch error', err);
        } else {
            var names = [];
            rows.forEach(function (row) {
                names.push({name: row.name, message: row.message});
            });
            res.send({ok: true, names: names});
        }
    });
}

//TODO
exports.all_apps_list = function (req, res) {
    db.all('SELECT * FROM process ORDER BY UPPER(name)', [], function (err, rows) {
        if (err !== null) {
            res.send({ok: false, message: 'error while fetching'});
            console.log('fetch error', err);
        } else {
            var apps = [];
            rows.forEach(function (row) {
                apps.push({id: row.id, name: row.name, record: row.authorized_recording});
            });
            res.send({ok: true, apps: apps});
        }
    });
};


exports.all_windows_list = function (req, res) {
    db.all('SELECT * FROM window', [], function (err, rows) {
        if (err !== null) {
            res.send({ok: false, message: 'error while fetching'});
            console.log('fetch error', err);
        } else {
            var windows = [];
            rows.forEach(function (row) {
                windows[row.id] = row.title;
            });
            res.send({ok: true, windows: windows});
        }
    });
};


exports.runningApps = function (req, res) {
    var start_date = new Date(req.query.start);
    var end_date = new Date(req.query.end);

    db.all('SELECT * FROM snapshot' +
        ' WHERE created_at BETWEEN "' + formatJSToSQLITE(start_date) + '" AND "' + formatJSToSQLITE(end_date) + '";',
        [], function (err, rows) {
            if (err !== null) {
                res.send({ok: false, message: 'error while fetching'});
                console.log('fetch error', err);
            } else {
                var runningApps = [];
                rows.forEach(function (row) {
                    runningApps.push({date: row.created_at, runningAppsID: row.state});
                });
                res.send({ok: true, apps: runningApps});
            }
        });
};


//To sort the app list array
function compare(_a, _b) {
    a = _a.name.toLowerCase();
    b = _b.name.toLowerCase();
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}

exports.upadteApp = function (req, res) {
    var name = req.query.appName;
    var action = req.query.action;
    var aut_value = action === "unauthorize" ? 0 : 1;

    db.run("UPDATE process SET authorized_recording = ? WHERE name = ?", [aut_value, name]);

    //return the new list of unauthorized apps
    sendUnAppsList(req, res);
};

exports.get_allowed_times = function (req, res) {
    db.get('SELECT * FROM privacytimeinterval', [], function (err, row) {
        if (err !== null) {
            res.send({ok: false, message: 'error while fetching'});
            console.log('fetch error', err);
        } else {
            res.send({ok: true, times: row});
        }
    });
};


exports.update_allowed_times = function (req, res) {
    var fromHour = req.query.fromHour;
    var fromMinute = req.query.fromMinute;
    var toHour = req.query.toHour;
    var toMinute = req.query.toMinute;
    var WE = parseInt(req.query.WE);

    db.run("DELETE FROM privacytimeinterval");
    db.run("INSERT INTO privacytimeinterval (fromHour, toHour, fromMinute, toMinute, weekend) VALUES ( ?,  ?,  ?, ?, ?)", fromHour, toHour, fromMinute, toMinute, WE);

    res.send({ok: true}); //TODO : callback if OK or not
};

exports.addUnLocation = function (req, res) {
    var lat = req.query.lat;
    var long = req.query.long;
    var address = req.query.address;

    db.run("INSERT INTO privacylocation(address, lat, lon) VALUES (?, ?, ?)", address, lat, long);

    getUnLocations(req, res);

};

exports.getUnLocations = getUnLocations;

function getUnLocations(req, res) {
    db.all('SELECT * FROM privacylocation', [], function (err, rows) {
        if (err !== null) {
            res.send({ok: false, message: 'error while fetching'});
            console.log('fetch error', err);
        } else {
            res.send({ok: true, locations: rows});
        }
    });
}
exports.removeLoc = function (req, res) {
    db.run("DELETE FROM privacylocation WHERE lat = ? AND lon = ?", req.query.lat, req.query.lon);
    getUnLocations(req, res);
};


exports.getAllScreenshotsNames = function (req, res) {
    res.send(fs.readdirSync(pathToScreenShots));
};


exports.getAllScreenshotsDateAndTime = function (req, res) {
    var all = fs.readdirSync(pathToScreenShots);
    all.sort();
    var result = [];
    all.forEach(function (one) {
        if (one != ".DS_Store") { //TODO : reove all files started by .
            var date = getJSDateAndTime(one);
            result.push(date);
        }
    });
    res.send({allRecords: result});
};


exports.getAllScreenshotsRange = function (req, res) {
    var all = fs.readdirSync(pathToScreenShots);
    all.sort();
    if (all[0] === ".DS_Store")//TODO : reemove all files started with .
        var start = getDateByScreenshotName(all[1]);
    else
        var start = getDateByScreenshotName(all[0]);
    var end = getDateByScreenshotName(all[all.length - 1]);

    var startDate = getJSDate(start);
    var endDate = getJSDate(end);

    var nbOfDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
    res.send({start: start, end: end, numberOfDays: nbOfDays});

};

exports.getAllRecordedDays = function (req, res) {
    var all = fs.readdirSync(pathToScreenShots);
    all.sort();
    var allRecordedDays = [];
    var last = "";
    all.forEach(function (one) {
        if (one != ".DS_Store" && getJSDate(one).valueOf() != last) {//TODO DS STORAGE
            allRecordedDays.push(getJSDate(one));
            last = getJSDate(one).valueOf();
        }
    });
    res.send({allRecordedDays: allRecordedDays});

};


exports.getScreenshotsListBetween = function (req, res) {
    var start = new Date(req.query.start);
    var end = new Date(req.query.end);

    var all = fs.readdirSync(pathToScreenShots);
    all.sort();
    var result = [];
    all.forEach(function (one) {
        if (one != ".DS_Store") { //TODO
            var d = getJSDateAndTime(one);
            if (d > start && d < end) {
                result.push({screenshot: one, date: d});
            }
        }
    });

    res.send({result: result});

};


exports.getAppsData = function (req, res) {
    var result = [];


    var start = new Date(req.query.start);
    start.setHours(start.getHours() - 3);
    var end = new Date(req.query.stop);
    end.setHours(end.getHours() + 3);

    window.console.log("SELECT process.id, process.name, processevent.created_at, event_type from processevent join process " +
        "WHERE processevent.process_id = process.id AND (processevent.event_type = 'Active' OR processevent.event_type = 'Inactive' ) " +
        "AND processevent.created_at between '" + formatJSToSQLITE(start) + "' " +
        "AND '" + formatJSToSQLITE(end) + "' ORDER BY processevent.created_at ASC ; ");

    db.all("SELECT process.id, process.name, processevent.created_at, event_type from processevent join process " +
        "WHERE processevent.process_id = process.id AND (processevent.event_type = 'Active' OR processevent.event_type = 'Inactive' ) " +
        "AND processevent.created_at between '" + formatJSToSQLITE(start) + "' " +
        "AND '" + formatJSToSQLITE(end) + "' ORDER BY processevent.created_at ASC ; ", function (err, rows) {
        var last = {};


        for(var i = 0 ; i != rows.length; i++){

            if(rows[i].name != "selfspy" && rows[i].event_type == 'Active'){ //TODO : check if we keep selfspy
                for(var k = i; k != rows.length; k++){
                    if(rows[k].event_type == 'Inactive' && rows[k].name == rows[i].name)
                    {
                        result.push({name : rows[i].name, start: rows[i].created_at, stop : rows[k].created_at});
                        break;
                    }
                }
            }
        }


        //TODO HERE : the last activity not accept apps activity
        var allActivity = xdb.get("backgroundActivity");
        var currentActivityPosition = 0;
        var trueResult = [];
        for (var i = 0; i != result.length; i++) {

            var resultRow = result[i];
            var rowStart = new Date(resultRow.start);
            var rowStop = new Date(resultRow.stop);

            while(
                    (currentActivityPosition < allActivity.length)
                    &&
                    (rowStart > new Date(allActivity[currentActivityPosition].stop))
                )
                currentActivityPosition++;

            if(currentActivityPosition >= (allActivity.length))
                break;


            //TODO remove and add minutes
            var activityStart = new Date(allActivity[currentActivityPosition].start);
            var activityStop = new Date(allActivity[currentActivityPosition].stop);

            activityStart.setMinutes(activityStart.getMinutes() - 5);
            activityStop.setMinutes(activityStop.getMinutes() + 5);


            if (rowStart >= activityStart && rowStop <= activityStop) //easy !
            {
                trueResult.push({name : result[i].name, start: result[i].start, stop : result[i].stop});
            }
        }
        res.send({result: trueResult});//TODO
        });
};

//function addEndOfAnActiveAppRange(appList, appName, date){
//    var i;
//    var done = false;
//    for(i = appList.length -1 ; i >= 0; i-- ){
//        if(appList[i].name == appName && appList[i].stop == "undefined")
//        {
//            appList[i].stop = date;
//            done = true;
//            break;
//        }
//    }
//    if(done == false)
//        window.console.log("WARNING : Can't put the end of an active app range : the start of the range for the app "+ appName + " not found, sould stop at " + date );
//
//}

exports.getGeoloc = function (req, res) {

    var _start = new Date(req.query.start);
    var _end = new Date(req.query.stop);


    var result = [];


    //remove 17min of the start : that allow  location period to start before the effective start time
    var start = new Date(_start);
    start.setMinutes(start.getMinutes() - 17);

     //add 17min of the start : that allow  location period to start before the effective start time
    var end = new Date(_end);
    end.setMinutes(end.getMinutes() + 17);





    var _activity = getActivityRangeBetween(start, end);

    //make a copy to keep unmofified database
    var activity = [];
    for(var i = 0 ; i != _activity.length; i++)
    {
        var a = _activity[i];
        activity.push({start: a.start, stop: a.stop});
    }

    db.all("SELECT created_at, lat, lon FROM location " +
        "WHERE created_at between '" + formatJSToSQLITE(start) + "' " +
        "AND '" + formatJSToSQLITE(end) + "'", function (err, rows) {


/*
        if (err) {
            res.send({ok: false, error: err});
            return;
        }
        var key = {lat: "undefined", lon: "undefined"};
        var justPreviousTime;
        var keystart;
        for (var i = 0; i != rows.length; i++) {
            var row = rows[i];


            if (key.lat == "undefined") { //first iteration case
                key.lat = row.lat;
                key.lon = row.lon;
                keystart = row.created_at;
                justPreviousTime = row.created_at;
                continue;
            }


            if(new Date(row.created_at) - new Date(justPreviousTime) > 1200000 ){
                result.push({from: keystart, to: justPreviousTime, lat: key.lat, lon: key.lon});
                keystart = row.created_at;
                key.lat = row.lat;
                key.lon = row.lon;
                justPreviousTime = row.created_at;
                continue;

            }

            if (haversine({latitude: row.lat, longitude: row.lon}, {
                    latitude: key.lat,
                    longitude: key.lon
                }, {unit: 'meter'}) > distMinBetweenTwoLocations) { //New location, push the previous, start watching the new //OR time too much different (10 min)
                result.push({from: keystart, to: row.created_at, lat: key.lat, lon: key.lon});
                keystart = row.created_at;
                key.lat = row.lat;
                key.lon = row.lon;
            }
            if (i == (rows.length - 1)) //last row
                result.push({from: keystart, to: row.created_at, lat: key.lat, lon: key.lon});


            justPreviousTime = row.created_at;

        }

        //If there is juste one range or less ^^, send it
        if(result.length <= 1){
            res.send({ok: true, result: result});
            return;

        }
        //fill times holes with "unknow" location
        var trueResult = [];
        for(var i = 0 ; i != result.length - 1 ; i ++)
        {
            var first = result[i];
            var second = result [i+1];

            if(i == 0)
                trueResult.push(first);
            if(first.to != second.from)
            {
                trueResult.push({from: first.to, to: second.from, lat:"unknow", lon:"unknow"})
            }
            trueResult.push(second);
        }

        res.send({ok: true, result: trueResult});
*/



    for(var i = 0 ; i != rows.length ; i ++)
    {
        var thisLocation = rows[i];
        for(var k = 0 ; k != activity.length ; k ++)
        {
            var thisActivity = activity[k];
            
            if(isInTheRange(new Date(thisActivity.start), new Date(thisActivity.stop), new Date(thisLocation.created_at), 35))
            {
                //No other location
                if(typeof(thisActivity.lat) === 'undefined'){
                    thisActivity.lat = thisLocation.lat;
                    thisActivity.lon = thisLocation.lon;
                    var dateLoc = new Date(thisLocation.created_at);
                    var distSta = Math.abs(dateLoc - new Date(thisActivity.start));
                    var distSto = Math.abs(new Date(thisActivity.stop) - dateLoc);
                    thisActivity.dist = distSta > distSto ? distSta : distSto;
                }
                else//Other location
                {
                    var dateLoc = new Date(thisLocation.created_at);
                    var distSta = Math.abs(dateLoc - new Date(thisActivity.start));
                    var distSto = Math.abs(new Date(thisActivity.stop) - dateLoc);
                    var dist = distSta > distSto ? distSta : distSto;
                    if(dist < thisActivity.dist)//this is soonest
                    {
                        thisActivity.lat = thisLocation.lat;
                        thisActivity.lon = thisLocation.lon;
                        thisActivity.dist = dist;
                    }

                }
            }
        }
    }


        //Add the unknow location, rename start and dtop to from and to

        for(var i = 0 ; i != activity.length; i++)
        {
            var thisActivity = activity[i];
            if(typeof(thisActivity.lat) === 'undefined')
            {
                thisActivity.lat = 'unknow';
                thisActivity.lon = 'unknow';
            }
            thisActivity.from = thisActivity.start;
            thisActivity.to = thisActivity.stop;

            delete thisActivity.start;
            delete thisActivity.stop;
            delete thisActivity.apps;
        }


        //smooth
        for(var i = 0 ; i != activity.length-1; i++)
        {
            var un = activity[i],
                deux = activity[i+1];
            if(un.to != deux.from)
            {
                var unDateTo = new Date(un.to),
                    deuxDateFrom = new Date(deux.from);

                if(deuxDateFrom - unDateTo <= 3840000)//8min
                {

                    un.to = deux.from;
                }
            }
        }


        res.send({ok: true, result: activity});

    });


};

function getActivityRangeBetween(start, stop){
    var result = [];
    var allActivity = xdb.get('backgroundActivity');
    var _start = new Date(start);
    var _stop = new Date(stop);
    for(var i = 0; i != allActivity.length ; i++)
    {
        var thisActivity = allActivity[i];
        var thisStart = new Date(thisActivity.start);
        var thisStop = new Date(thisActivity.stop);

        if(thisStart >= _start && thisStop <= _stop)
        {
            result.push(thisActivity);
            continue;
        }
        if(thisStop >= _start && thisStart <= _start)
        {
            result.push(thisActivity);
            continue;
        }
        if(thisStart <= _stop && thisStop >= _stop)
        {
            result.push(thisActivity);
            continue;
        }
    }
    return result;
}

exports.getActivity = function(req, res){
    res.send({result:xdb.get("backgroundActivity")});
};


exports.cleanAll = function(req, res){

    var ranges = req.query.ranges;

    for(var i=0; i!= ranges.length; i++){
        var oneRange = ranges[i];
        removeDataBetween(new Date(oneRange.start), new Date(oneRange.stop));
    }

    res.send({ok : "ok"});
};


exports.getSelfspyFolderPath = function(res, res){
    //Au cas ou, on lance une MAJ de l'activité
    activityDB.madeAllActivity(xdb);
    var c = xdb.get("SELFSPY_PATH");
    if(c == false)
        res.send({status:"ko", error:"inexistant"});
    else
        res.send({status:"ok", value:c});
};

exports.setSelfspyFolderPath = function(req, res){
    var path = req.query.path;

    var db2 = new sqlite3.Database(path + "/selfspy.sqlite", sqlite3.OPEN_READONLY, function(error){
        if(error != null){
            res.send({status : "ko", error:error});
        }
        else {
            xdb.set("SELFSPY_PATH", path);
            initThisAppDatabase();
            res.send({status: "ok"});
        }
        db2.close();
    });

};


function removeDataBetween(start, end)
{
    db.run("DELETE  FROM bookmark WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM click WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM debrief WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM experience WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM geometry WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM keys WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM location WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM processevent WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM snapshot WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM window WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");
    db.run("DELETE  FROM windowevent WHERE created_at between '" + formatJSToSQLITE(start) + "' " +  "AND '" + formatJSToSQLITE(end) +"' ;");

    //TODO remove the .DS_Store
    var allscs = fs.readdirSync(pathToScreenShots);
    for(var i = 0; allscs[i] == ".DS_Store" || getJSDateAndTime(allscs[i]) < start; i++);
    while(getJSDateAndTime(allscs[i]) <= end )
    {
        fs.unlinkSync(pathToScreenShots+allscs[i]);
        i++;
    }

}

var haversine = (function () {

    // convert to radians
    var toRad = function (num) {
        return num * Math.PI / 180
    };

    return function haversine(start, end, options) {
        var earth_radius = {
            'km': 6371,
            'meter': 6371000,
            'mile': 3960
        };
        options = options || {};

        var R = earth_radius['km'];
        if (options.unit in earth_radius)
            R = earth_radius[options.unit];

        var dLat = toRad(end.latitude - start.latitude);
        var dLon = toRad(end.longitude - start.longitude);
        var lat1 = toRad(start.latitude);
        var lat2 = toRad(end.latitude);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        if (options.threshold) {
            return options.threshold > (R * c);
        } else {
            return R * c;
        }
    };

})();


function isInTheRange(dateStart, dateStop, val, symp) {

    var start = dateStart.setMinutes(dateStart.getMinutes()-symp);
    var stop = dateStop.setMinutes(dateStop.getMinutes()+symp);

    if(
        val >= start
    &&  val <= stop
    ){
        return true;
    }
    return false;
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


function getDateByScreenshotName(screenshotName) {
    var splited = screenshotName.split("_")[0];//.split("-");
    //var date = splited[0];
    //var time = splited[1];
    //
    //var year = date.substr(0,2);
    //var month = date.substr(3,5);
    //var day = date.substr(6,8);
    //
    //var hour = time.substr(0,2);
    //var min = time.substr(3, 5);
    //var sec = time.substr(6, 8);
    //var nanSec = time.substring(9);

    return splited;


}

function getJSDate(screenshotName) {

    var splited = screenshotName.split("_")[0].split("-");
    var date = splited[0];
    var time = splited[1];

    var year = date.substring(0, 2);
    var month = date.substring(2, 4);
    var day = date.substring(4, 6);
    //
    //var hour = time.substr(0,2);
    //var min = time.substr(3, 5);
    //var sec = time.substr(6, 8);
    //var nanSec = time.substring(9);
    return new Date('20' + year + "-" + month + "-" + day);


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