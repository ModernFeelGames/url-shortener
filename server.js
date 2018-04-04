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
//------------------------------------------------//
function insertData(oldUrl) {
  urlToShorten = oldUrl
  coolCode = Math.floor(Math.random()*90000) + 10000;
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dataBase = db.db("urldata");
  var mydata = { OLD_URL: `${oldUrl}`, SHORT_URL: `https://shortendurl.glitch.me/${coolCode}`, _id: coolCode };
  dataBase.collection("urls").count({_id: coolCode}, function (err, id) {
    if(id>0){
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
                    
//-----------------------------------------------//
  MongoClient.connect(url, function (err, db) {
  var dataStuff = db.db("urldata");
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      if(req.url.startsWith("/create")) {
        console.log(`A requets was made to shorten ${req.url.replace("/create/", "")}`);
        toShorten = req.url.replace("/create/", "")
        if(toShorten.startsWith("http://")) {
          console.log('valid url');
          insertData(toShorten)
        } else if(toShorten.startsWith("https://")) {
          console.log('valid url');
          insertData(toShorten)
          res.write(`{"_id": ${coolCode}, "OLD_URL": "${urlToShorten}", "SHORT_URL": "https://shortendurl.glitch.me/${coolCode}"}`)
        } else {
          console.log('invalid url');
          res.write('{"err" : "invalid_url"}')
        }
      } else if(req.url.startsWith("/")){
      var goTo = req.url.replace("/", "")
      if (goTo == "") {
        console.log("A request was made to visit the home page")
        res.write('<html><head><title>URL Shortener</title><style>body {background-color: #f2f2f2; font-family: Arial, Helvetica, sans-serif;}</style></head><body><center><h1><br/>Url Shortener<br/></h1><p>This is a url shortener written in node js with mongodb <br/><b>Pass a url, and get a shortend one back</b> for example: <br/><br/><span style="background-color: #d9d9d9">&nbsphttps://shortendurl.glitch.me/create/https://www.foo.com/&nbsp</span><b>&nbspmay return</b><br/><span style="background-color: #d9d9d9">https://shortendurl.glitch.me/12345</span></br><br/>This is a project made for freecodecamp.org</center></body></html>')
      } else {
        console.log(`A request was made to visit id ${goTo}`)
        
      }
      }
  res.end();}).listen(process.env.PORT);
  db.close();
  }
})
