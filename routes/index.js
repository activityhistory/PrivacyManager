
/*
 * GET home page.
 */

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('selfspy.sqlite');



exports.index = function(req, res){
  res.render('index', { title: 'ActivityHistory PrivacyTool' });
};


exports.test = function(req, res){
  res.render('test', { title: 'Test page' });
};

exports.un_apps_list = sendUnAppsList;

function sendUnAppsList(req, res){
    db.all('SELECT * FROM process WHERE authorized_record == 0', [], function (err, rows) {
        if (err !== null) {
            res.send({ ok: false, message: 'error while fetching' });
            console.log('fetch error', err);
        } else {
            var names = [];
            rows.forEach(function (row) {
                names.push({ name: row.name, message: row.message });
            });
            res.send({ ok: true, names: names });
        }
    });
};

exports.all_apps_list = function(req, res){
    db.all('SELECT * FROM process', [], function (err, rows) {
        if (err !== null) {
            res.send({ ok: false, message: 'error while fetching' });
            console.log('fetch error', err);
        } else {
            var names = [];
            rows.forEach(function (row) {
                names.push({ name: row.name, message: row.message });
            });
            res.send({ ok: true, names: names });
        }
    });
};

exports.upadteApp = function(req, res){
    var name = req.query.appName;
    var action = req.query.action;
    var aut_value = action === "unauthorize" ? 0 : 1;

    db.run("UPDATE process SET authorized_record = ? WHERE name = ?", [aut_value, name]);

    //return the new list of unauthorized apps
    sendUnAppsList(req, res);
};

exports.get_allowed_times = function(req, res){
    db.get('SELECT * FROM privacy_time', [], function (err, row) {
        if (err !== null) {
            res.send({ ok: false, message: 'error while fetching' });
            console.log('fetch error', err);
        } else {
            res.send({ ok: true, times: row });
        }
    });
};


exports.update_allowed_times = function(req, res){
    var fromHour = req.query.fromHour;
    var fromMinute = req.query.fromMinute;
    var toHour = req.query.toHour;
    var toMinute = req.query.toMinute;
    var WE = parseInt(req.query.WE);

    db.run("UPDATE privacy_time SET fromHour = ?, toHour = ?, fromMinute = ?, toMinute = ?, WE = ?",
                fromHour, toHour, fromMinute, toMinute, WE);

    res.send({ok : true}); //TODO : callback if OK or not
};

exports.addUnLocation = function(req, res)
{
    var lat = req.query.lat;
    var long = req.query.long;
    var address = req.query.address;

    db.run("INSERT INTO privacy_location(address, lat, lng) VALUES (?, ?, ?)", address, lat, long);

    res.send({"ok" : true});

};

exports.getUnLocations = getUnLocations;

function getUnLocations(req, res){
    db.all('SELECT * FROM privacy_location', [], function (err, rows) {
        if (err !== null) {
            res.send({ ok: false, message: 'error while fetching' });
            console.log('fetch error', err);
        } else {
            res.send({ ok: true, locations: rows });
        }
    });
};