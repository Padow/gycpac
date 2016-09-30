process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // allows to query auto-signed registry (Not really glam)

var http = require('http');
// var https = require('https');
// var httpreq = require('httpreq');
var fs = require('fs');
var express = require('express');
// var request = require("request");
var path = require("path");
var winston = require('winston');
var app = express();
var config = require('./config.json');

var NodeCouchDb = require('node-couchdb');

// node-couchdb instance talking to external service
var couchExternal = new NodeCouchDb({
    host: '192.168.1.115',
    protocol: 'http',
    port: 5984,
    auth: {
        user: 'ITC',
        pass: 'itc'
    }
});

// var pathSeparator = path.sep;

// init logger
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: __dirname + '/gycpac.log', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: __dirname + '/exceptions.log', json: false })
  ],
  exitOnError: false
});
logger.level = config.log.level;
logger.log(config.log.level, "Log level set to : "+config.log.level);


// browse each folder from dir and add files to epress response
var walk = function (dir, done) {
    fs.readdir(dir, function (error, list) {
        if (error) {
            return done(error);
        }
        //remove from list unwanted folder and file
        var torem = ["node_modules", ".git", "server.js", "index.html", ".gitignore", "README.md", "package.json", "gycpac.log", "exceptions.log"];
        torem.forEach(function(entry){
            var index = list.indexOf(entry);
            if (index > -1) {
                list.splice(index, 1);
            }
        })


        var i = 0;

        (function next () {
            var file = list[i++];

            if (!file) {
                return done(null);
            }

            file = dir + '/' + file;
                fs.stat(file, function (error, stat) {
                    if (stat && stat.isDirectory()) {
                        walk(file, function (error) {
                            next();
                        });
                    } else {
                        file = file.replace(__dirname, "");
                        logger.log('info', file);
                        app.get(file, function(req, res) {
                            fs.readFile(file, function(err, page) {
                                 res.sendFile(path.join(__dirname+file));
                            });
                        });
                        next();
                    }
                });
        })();
    });
};

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Origin");
  next();
 });

 app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
 });

// add index.html to response
app.get('/', function(req, res, next) {
    fs.readFile('index.html', function(err, page) {
         res.sendFile(path.join(__dirname+'/index.html'));
    });
});


// add JS CSS image to response browsing folders content
httpServer = app.listen(config.server.port);
logger.log('info', 'Server running at http://'+config.server.address+':'+config.server.port+"/");
logger.log('info', '-------------------------------------------------------------');
logger.log('info', 'Loading files.');
logger.log('info', '-------------------------------------------------------------');
walk(__dirname, function(error) {
    if (error) {
        throw error;
    } else {

        logger.log('info', '-------------------------------------------------------------');
        logger.log('info', 'finished.');
        logger.log('info', '-------------------------------------------------------------');
    }
});

var io = require('socket.io').listen(httpServer);

io.sockets.on('connection', function(socket){

  socket.on('listDatabases', function(data, callback){
    couchExternal.listDatabases().then(function(response, error){
      logger.info("CoucheDb databases : ");
      logger.info(response);
      callback(error,response);
    });
  });

  // upload csv
  socket.on('uploadcsv', function(data){
    logger.info("Uploading csv");
    var base64Data = data.data.replace(/^data:text\/csv;base64,/, "");
      logger.debug("writeFile data.csv");
      fs.writeFile("data.csv", base64Data, 'base64', function(err) {
      if(err !== null){
        logger.error(err);
      }
    });
  });


  // trigger action when socket is closed (idest user close tab)
  socket.on('disconnect', function(){

  });
});
