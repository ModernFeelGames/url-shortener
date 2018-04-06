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
  coolCode = Math.random().toString(36).substring(7);
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dataBase = db.db("urldata");
  var mydata = { OLD_URL: `${oldUrl}`, SHORT_URL: `https://shortendurl.glitch.me/${coolCode}`, GO_TO: coolCode };
  dataBase.collection("urls").count({GO_TO: coolCode}, function (err, GO_TO) {
    if(GO_TO>0){
      
      insertData(urlToShorten)
    } else {
      
      dataBase.collection("urls").insertOne(mydata, function(err, res) {
      if (err) throw err;
        console.log(`${urlToShorten} has been shortend.`);
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
    
    const collection = dataStuff.collection( 'urls' );
    http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      if(req.url.startsWith("/create")) {
        
        toShorten = req.url.replace("/create/", "")
        if(toShorten.startsWith("http://")) {
          
          insertData(toShorten)
          res.write(`{"GO_TO": ${coolCode}, "OLD_URL": "${urlToShorten}", "SHORT_URL": "https://shortendurl.glitch.me/${coolCode}"}`)
          res.end();

        } else if(toShorten.startsWith("https://")) {
          
          insertData(toShorten)
          res.write(`{"GO_TO": ${coolCode}, "OLD_URL": "${urlToShorten}", "SHORT_URL": "https://shortendurl.glitch.me/${coolCode}"}`)
          res.end();
        } else {
          
          res.write('{"err": "invalid_url"}')
          res.end();
        }
      } else if(req.url.startsWith("/")){
      var goTo = req.url.replace("/", "")
      if (goTo == "") {
        
        res.write('<html><head><title>URL Shortener</title><style>body {background-color: #f2f2f2; font-family: Arial, Helvetica, sans-serif;}</style></head><body><center><h1><br/>Url Shortener<br/></h1><p>This is a url shortener written in node js with mongodb <br/><b>Pass a url, and get a shortend one back</b> for example: <br/><br/><span style="background-color: #d9d9d9">&nbsphttps://shortendurl.glitch.me/create/https://www.foo.com/&nbsp</span><b>&nbspmay return</b><br/><span style="background-color: #d9d9d9">https://shortendurl.glitch.me/5j9ef</span></br><br/>This is a project made for freecodecamp.org</center></body></html>')
        res.end();
      } else if (goTo == "favicon.ico") {
        //this is just to ignore favicon.ico as a request
      }else {
        dataStuff.collection("urls").count({GO_TO: goTo}, function (err, lol) {
          
          if(lol>0){
            
            dataStuff.collection("urls").findOne({ "GO_TO": goTo} , function(err, result) {
              if (err) throw err;
              console.log('A visit was made to ' + result.OLD_URL + ' at id ' + goTo)
              res.writeHead(302, {'Location': result.OLD_URL});
              res.end();
            });
          } else {
            console.log("Requested URL is invalid");
          }
        });
      }
    } }).listen(process.env.PORT);
  }
})