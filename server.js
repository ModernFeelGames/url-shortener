const express = require('express')
const app = express()
app.use(express.static('public'))
var http = require('http');
var toShorten = ('');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.DB_URL;
var coolCode = ''
var urlToShorten = ''
var ObjectId = require('mongodb').ObjectID;
var destination = ''
var ready = ''
//------------------------------------------------//
function insertData(oldUrl) {
  urlToShorten = oldUrl
  coolCode = Math.random().toString(36).substring(7);
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dataBase = db.db("urldata");
  var mydata = { OLD_URL: `${oldUrl}`, SHORT_URL: `https://shortendurl.glitch.me/${coolCode}`, GO_TO: coolCode };
  dataBase.collection("urls").count({GO_TO: coolCode}, function (err, GO_TO) {
    if(GO_TO>0){
      console.log("Id is already in use");
      insertData(urlToShorten)
    } else {
      console.log("id is valid")
      dataBase.collection("urls").insertOne(mydata, function(err, res) {
      if (err) throw err;
        console.log("url has been shortend");
        db.close();
      });
     }
   });
 });
}

function Check(id){
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dataBase = db.db("urldata");
  dataBase.collection("urls").count({GO_TO: id}, function (err, lol) {
    console.log('checked id')
    if(lol>0){
      console.log("Requested URL Exists!");
      ready = true
      dataBase.collection("urls").findOne({ "GO_TO": id} , function(err, result) {
        if (err) throw err;
        var destination = result.OLD_URL
        console.log(destination)
      });
    } else {
      console.log("Requested URL is invalid");
      ready = false
    }
   });
 });
}
                    
//-----------------------------------------------//
  MongoClient.connect(url, function (err, db) {
  var dataStuff = db.db("urldata");
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    
    console.log('Connection established to', url);
    const collection = dataStuff.collection( 'urls' );
    http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      if(req.url.startsWith("/create")) {
        console.log(`A requets was made to shorten ${req.url.replace("/create/", "")}`);
        toShorten = req.url.replace("/create/", "")
        if(toShorten.startsWith("http://")) {
          console.log('valid url');
          insertData(toShorten)
          res.write(`{"GO_TO": ${coolCode}, "OLD_URL": "${urlToShorten}", "SHORT_URL": "https://shortendurl.glitch.me/${coolCode}"}`)

        } else if(toShorten.startsWith("https://")) {
          console.log('valid url');
          insertData(toShorten)
          res.write(`{"GO_TO": ${coolCode}, "OLD_URL": "${urlToShorten}", "SHORT_URL": "https://shortendurl.glitch.me/${coolCode}"}`)
        } else {
          console.log('invalid url');
          res.write('{"err" : "invalid_url"}')
        }
      } else if(req.url.startsWith("/")){
      var goTo = req.url.replace("/", "")
      if (goTo == "") {
        console.log("A request was made to visit the home page")
        res.write('<html><head><title>URL Shortener</title><style>body {background-color: #f2f2f2; font-family: Arial, Helvetica, sans-serif;}</style></head><body><center><h1><br/>Url Shortener<br/></h1><p>This is a url shortener written in node js with mongodb <br/><b>Pass a url, and get a shortend one back</b> for example: <br/><br/><span style="background-color: #d9d9d9">&nbsphttps://shortendurl.glitch.me/create/https://www.foo.com/&nbsp</span><b>&nbspmay return</b><br/><span style="background-color: #d9d9d9">https://shortendurl.glitch.me/12345</span></br><br/>This is a project made for freecodecamp.org</center></body></html>')
      } else if (goTo == "favicon.ico") {
        //this is just to ignore favicon.ico as a request
      }else {
        console.log(`A request was made to visit id ${goTo}`)
        Check(goTo)
      }
    }res.end();}).listen(process.env.PORT);
  }
})
