"use strict";



/**
 * Module dependencies.
 */
var http = require('http')
  , path = require('path')
  , express = require('express')
  , routes = require(path.join(process.cwd(), 'routes', 'index.js'))
  , app = express()
    , xdb = require('express-db'),
    fs = require('fs');

var bdd_content = fs.readFileSync('db.json');
if(bdd_content.length == 0)
{
  fs.writeFileSync('db.json', '{ "info": { "version": "0.0.2", "name": "my_db"},  "data": {}}');
}

var    activityDB = require(path.join(process.cwd(), 'activityDB.js'));

var options = {
  host: 'localhost',
  port: 2323
};


app.use(xdb.init("my_db", {
  file: './db.json', //your db file
  restrictAccess: false, //restrict access via browser
  autoSave: true, //autosave enabled
  backupInterval: 100, //interval in ms,
  viewCaching: true //cache views then requested
}));




activityDB.madeAllActivity(xdb);

//check if server is already running
http.get(options, function(res) {
  console.log('server is running, redirecting to localhost');
  if (window.location.href.indexOf('localhost') < 0) { 
    window.location = 'http://localhost:' + app.get('port');
  }
}).on('error', function(e) {
  //server is not yet running

  //intialize the path of the .selfspy/selfspy.sqlite db
  routes.initDBPath();

  //intialize the presence of unauthorized times if not exist
  routes.checkInitSqlDb();

  // all environments
  app.set('port', process.env.PORT || 2323);
  app.set('views', process.cwd() + '/views');
  app.set('view engine', 'jade');
  app.use(require('stylus').middleware(path.join(process.cwd(), 'public')));
  app.use(express.static(path.join(process.cwd(), 'public')));

  app.get('/', routes.index);
  //app.get('/test', routes.test);
  app.get('/all_apps_list', routes.all_apps_list); // apps list
  app.get('/all_windows_list', routes.all_windows_list); // apps list
  app.get('/un_apps_list', routes.un_apps_list); //Unauthorized apps list
  app.get('/upadteApp', routes.upadteApp); //Chage the reccords status of a process
  app.get('/getAllowedTimes', routes.get_allowed_times); //return the allowed range time in JSON
  app.get('/setAllowedTimes', routes.update_allowed_times);
  app.get('/addUnLocation', routes.addUnLocation); // Add an unauthorized location
  app.get('/getUnLocation', routes.getUnLocations); // get all unauthorized locations
  app.get('/removeLoc', routes.removeLoc); // get all unauthorized locations
  app.get('/getAllRecordedDays', routes.getAllRecordedDays); // return an array with all the screenshots names
  app.get('/allRange', routes.getAllScreenshotsRange); // return an array with all the screenshots names
  app.get('/allScreenshotsDateAndTime', routes.getAllScreenshotsDateAndTime); // return an array with all the screenshots names
  app.get('/getScreenshotsListBetween', routes.getScreenshotsListBetween);
  app.get('/getAppsData', routes.getAppsData);
  app.get('/getGeoloc', routes.getGeoloc);
  app.get('/clean', routes.cleanAll);

  app.get('/runningAppsBetween', routes.runningApps);//return all running apps for the current range

  // app.get('/getScreenshotInfos', routes.getScreenshotInformations); //return informations about current screenshot and its context
  app.get('/getActivity', routes.getActivity); //return informations about activity time range, and bakground apps ids at each range


  app.get('/getSelfspyFolderLocation', routes.getSelfspyFolderPath);
  app.get('/setSelfspyFolderLocation', routes.setSelfspyFolderPath);
  app.get('/activityCalculerState', routes.checkActivityCalculatingState);



  http.createServer(app).listen(app.get('port'), function(err){
    console.log('server created');
    if (window.location.href.indexOf('localhost') < 0) { 
      window.location = 'http://localhost:' + app.get('port');
    }
  });
});
