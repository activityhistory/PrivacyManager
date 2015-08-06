/*
 * GET home page.
 */

var sqlite3 = require('sqlite3').verbose();
var Promise = require('promise');
//var db = new sqlite3.Database('selfspy.sqlite');
var db = new sqlite3.Database(process.env.HOME + '/.selfspy/selfspy.sqlite');
var fs = require('fs');
var pathToScreenShots = "public/images/screenshots/";
//var pathToScreenShots = process.env.HOME + "/.selfspy/screenshots/";

var distMinBetweenTwoLocations = 2000; // in meters

exports.index = function (req, res) {
    res.render('index', {title: 'ActivityHistory PrivacyTool'});
};


exports.test = function (req, res) {
    res.render('test', {title: 'Test page'});
};

exports.un_apps_list = sendUnAppsList;

function sendUnAppsList(req, res) {
    db.all('SELECT * FROM process WHERE authorized_record == 0', [], function (err, rows) {
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
exports.all_apps_list = function (req, res) {
    db.all('SELECT * FROM process', [], function (err, rows) {
        if (err !== null) {
            res.send({ok: false, message: 'error while fetching'});
            console.log('fetch error', err);
        } else {
            var names = [];
            rows.forEach(function (row) {
                names.push({name: row.name, message: row.message});
            });
            names.sort(compare);
            res.send({ok: true, names: names});
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

    db.run("UPDATE process SET authorized_record = ? WHERE name = ?", [aut_value, name]);

    //return the new list of unauthorized apps
    sendUnAppsList(req, res);
};

exports.get_allowed_times = function (req, res) {
    db.get('SELECT * FROM privacy_time', [], function (err, row) {
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

    db.run("UPDATE privacy_time SET fromHour = ?, toHour = ?, fromMinute = ?, toMinute = ?, WE = ?",
        fromHour, toHour, fromMinute, toMinute, WE);

    res.send({ok: true}); //TODO : callback if OK or not
};

exports.addUnLocation = function (req, res) {
    var lat = req.query.lat;
    var long = req.query.long;
    var address = req.query.address;

    db.run("INSERT INTO privacy_location(address, lat, lng) VALUES (?, ?, ?)", address, lat, long);

    getUnLocations(req, res);

};

exports.getUnLocations = getUnLocations;

function getUnLocations(req, res) {
    db.all('SELECT * FROM privacy_location', [], function (err, rows) {
        if (err !== null) {
            res.send({ok: false, message: 'error while fetching'});
            console.log('fetch error', err);
        } else {
            res.send({ok: true, locations: rows});
        }
    });
}
exports.removeLoc = function (req, res) {
    db.run("DELETE FROM privacy_location WHERE lat = ? AND lng = ?", req.query.lat, req.query.lng);
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
        if (one != ".DS_Store") {
            var date = getJSDateAndTime(one);
            result.push(date);
        }
    });
    res.send({allRecords: result});
};


exports.getAllScreenshotsRange = function (req, res) {
    var all = fs.readdirSync(pathToScreenShots);
    all.sort();
    if (all[0] === ".DS_Store")//TODO
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
        if (one != ".DS_Store") {
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
    var end = new Date(req.query.stop);


    db.all("SELECT process.id, process.name, processevent.created_at, event_type from processevent join process " +
        "WHERE processevent.process_id = process.id " +
        "AND processevent.created_at between '" + formatJSToSQLITE(start) + "' " +
        "AND '" + formatJSToSQLITE(end) + "'", function (err, rows) {
        var last = {};
        rows.forEach(function (one) {
            if ('date' in last) {
                result.push({start: last.date, stop: one.created_at, name: last.name})
            }
            if (one.event_type == "Active" || one.event_type == "Open") {
                last.date = one.created_at;
                last.name = one.name;
            } else {
                last = {};
            }
        });
        res.send({result: result});
    })

};

exports.getGeoloc = function (req, res) {

    var start = new Date(req.query.start);
    var end = new Date(req.query.stop);


    var result = [];


    //remove 12min of the start : that allow  location period to start befor the effective start time
    start.setMinutes(start.getMinutes() - 12);

    db.all("SELECT created_at, lat, lon FROM location " +
        "WHERE created_at between '" + formatJSToSQLITE(start) + "' " +
        "AND '" + formatJSToSQLITE(end) + "'", function (err, rows) {
        if (err) {
            res.send({ok: false, error: err});
            return;
        }
        var key = {lat: "undefined", lon: "undefined"};
        for (var i = 0; i != rows.length; i++) {
            var row = rows[i];
            var keystart;
            if (key.lat == "undefined") {
                key.lat = row.lat;
                key.lon = row.lon;
                keystart = row.created_at;
                continue;
            }
            if (haversine({latitude: row.lat, longitude: row.lon}, {
                    latitude: key.lat,
                    longitude: key.lon
                }, {unit: 'meter'}) > distMinBetweenTwoLocations) {
                result.push({from: keystart, to: row.created_at, lat: key.lat, lon: key.lon});
                keystart = row.created_at;
                key.lat = row.lat;
                key.lon = row.lon;
            }
            if (i == (rows.length - 1)) //last row
                result.push({from: keystart, to: row.created_at, lat: key.lat, lon: key.lon});
        }
        res.send({ok: true, result: result});
    });
};


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


// Audréa

/**
 * Get context before date
 * @param date
 * @param appID -- to prevent same app selection
 * @return -1 if an error occurred
 *          else an object which contains window id, window's activation date,
 *          window's title, process id and process name
 */
//TODO
function getPreviousContext (date, appID) {
    return new Promise(function(resolve, reject){
        var query = "SELECT window.id  window_id," +
            " windowevent.created_at  created_at," +
            " window.title window_title," +
            "  process.id  process_id," +
            " process.name  process_name " +
            "FROM windowevent, window, processevent, process" +
            " WHERE window.id  = windowevent.window_id" +
            "  AND window.process_id=process.id" +
            " AND process.id=processevent.process_id" +
            " AND  windowevent.created_at < '" + date + "'" +
            " AND windowevent.event_type='Active' " +
            " AND process.id != " + appID +
            " ORDER BY created_at desc LIMIT 1 ;";

        db.all(query, function (err, row) {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}

/**
 * Get context after date
 * @param date
 * @param appID -- to prevent same app selection //perhaps diff if app is a browser
 * @return -1 if an error occurred
 *          else an object which contains window id, window's activation date,
 *          window's title, process id and process name
 */
//TODO
function getNextContext(date, appID) {

    return new Promise(function(resolve, reject){
        var query  = "SELECT window.id  window_id," +
            " windowevent.created_at  created_at," +
            " window.title window_title," +
            " process.id  process_id," +
            " process.name  process_name " +
            " FROM windowevent, window, processevent, process" +
            " WHERE window.id  = windowevent.window_id" +
            " AND window.process_id=process.id" +
            " AND process.id=processevent.process_id" +
            " AND  windowevent.created_at >'"+date+ "'" +
            " AND windowevent.event_type='Active' " +
            " AND process.id != " + appID +
            " ORDER BY created_at LIMIT 1 ;";

        db.all(query, function(err, row){
            if(err){
                reject(err);
            }
            else{
                resolve(row);
            }
        });
    });
}


/**
 * Get informations about date
 *
 * @param date
 * @return processId, processName, windowID, windowTitle
 */
function getInformations(date){
    return new Promise(function(resolve, reject){
        var query  = "SELECT window.id  window_id," +
            " window.title window_title," +
            " process.id  process_id," +
            " process.name  process_name " +
            " FROM windowevent, window, process" +
            " WHERE window.id  = windowevent.window_id" +
            " AND window.process_id=process.id" +
            " AND windowevent.created_at <= '"+ date+ "'" +
            " AND windowevent.event_type='Active' ORDER BY windowevent.created_at desc LIMIT 1 ;";

        db.all(query, function(err, row){
            if(err){
                reject(err);
            }
            else{
                resolve(row);
            }
        });

    });
}

function getContextAboutMainScreenshot(date, appID){
    var nextPromise = getNextContext(date, appID);
    var previousPromise = getPreviousContext(date, appID);
    return Promise.all([previousPromise,nextPromise]);
}


function getAllInformationAboutMainScreenshot (date, processID){
    return new Promise(function(resolve,reject){
            var test  = getContextAboutMainScreenshot(date, processID);
            test.then(function(context){
                resolve({previousContext: context[0][0], nextContext: context[1][0]});
            }, function(err){
                reject(err);
            });
    });
}


exports.getScreenshotInformations =  function(req,res){
    var date = new Date(req.query.date);
    var formattedDate = formatJSToSQLITE(date);

    var nextAppID = req.query.nextAppId;
    var previousAppID = req.query.previousAppId;

    var mainAppID = req.query.mainAppID;
    var mainWinID = req.query.mainAppID;

    var informationsPromise = findInformations(mainAppID, mainWinID, formattedDate, previousAppID, nextAppID);


    if(informationsPromise === null){
        res.send({error: 'Error, can\'t find appID and winID from screenshot'});
    }

    informationsPromise.then(function(data){

        res.send({
            informations : {window_title: data[0], app_id :data[1].app_id,app_name: data[1].name },
            appsOpen: data[2],
            context:{
                previous: data[3],
                next: data[4]
            }
        });
    });

};







//NEW VERSION : Context without checking DB

function findInformations(mainAppID, mainWindowID, date, previousAppID, nextAppID){

    var date = formatJSToSQLITE(new Date(date));

    //Check in DB current app name and window title
    var promiseWindowTitle = getWindowTitle(mainWindowID);
    var promiseAppName = getAppName(mainAppID);
    var promiseRunningApps = getRunningApps(date, mainAppID);


    //Check previous and next app name
    var promisePreviousAppName = getAppName(previousAppID);
    var promiseNextAppName = getAppName(nextAppID);

    return Promise.all([promiseWindowTitle, promiseAppName, promiseRunningApps, promisePreviousAppName, promiseNextAppName]);

}

function getWindowTitle(id){
    return new Promise(function(resolve, reject){
        var query = "SELECT title FROM window WHERE id =  " + id;

        db.all(query, function(err, row){
            if(err){
                reject(err);
            }
            else{
                resolve(row[0].title);
            }
        });
    });
}

function getAppName(id){
    return new Promise(function(resolve, reject){
        var query = "SELECT name FROM process WHERE id =  " + id;

        db.all(query, function(err, row){
            if(err){
                reject(err);
            }
            else{
                resolve({name: row[0].name, app_id: id});
            }
        });
    });
}

function getRunningApps(date, appID){
    return new Promise(function(resolve, reject){
        var query = "SELECT name, event_type" +
            " FROM process, processevent" +
            " WHERE processevent.created_at <= '"+ date+ "'" +
            " AND process_id !="+ appID +
            " AND process_id = process.id" +
            " ORDER BY processevent.created_at ASC;";
        db.all(query, function(err, rows){
            if(err){
                reject(err);
            }
            else{
                //resolve(rows);

                //Remove from result all process that have been closed in the meantime
                var results = [];
                for(var i  = 0; i < rows.length; i++){
                    //if it's the first time we find this app
                    if(results.indexOf(rows[i].name) === -1){
                        //And if it's not a close event
                        if(rows[i].event_type !== 'Close'){
                            results.push(rows[i].name);
                        }
                    }
                }
                resolve(results);
            }
        });
    });
}
