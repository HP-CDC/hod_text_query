var express = require('express')
var app = express()
var http = require('http').Server(app)
var path = require('path')
var io = require('socket.io')(http)

port = process.env.PORT || 5000
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req, res){
  res.sendFile(__dirname + '/views/index.html');
})

http.listen(port, function(){
  console.log("Listening on port: "+port)
})
