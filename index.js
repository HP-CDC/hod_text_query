require('dotenv').load()

var express = require('express')
var app = express()
var http = require('http').Server(app)
var path = require('path')
var io = require('socket.io')(http)
var Twitter = require('twitter')
var havenondemand = require('havenondemand')

var hodClient = new havenondemand.HODClient('http://api.havenondemand.com', process.env.hpe_apikey)

var twitterClient = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token,
  access_token_secret: process.env.access_token_secret
});

port = process.env.PORT || 5000
app.use(express.static(path.join(__dirname, 'public')));

// io.on('streamTopic', function(msg){
//   console.log(msg)
// })

io.on('connection', function(socket){

  // socket.on('streamTopic', function(msg){
  //   console.log(msg)
  // })

  socket.on('streamTopic', function(msg){
    console.log(msg);
    twitterClient.stream('statuses/filter', {track: msg.topic}, function(stream) {
      stream.on('data', function(tweet) {
        var data = {text: tweet.text}
        hodClient.call('analyzesentiment', data, function(err, resp){
          var sentiment = resp.body.aggregate.sentiment
          var score = resp.body.aggregate.score
          console.log("------------------------------")
          console.log(tweet.text + " | " + sentiment + " | " + score)
          var tweetData = {text: tweet.text, positive: resp.body.positive, negative: resp.body.negative, aggregate: resp.body.aggregate}
          io.emit('tweetData', tweetData)
        })
      });

      stream.on('error', function(error) {
        throw error;
      });
    });
  });

})

app.get("/", function(req, res){
  res.sendFile(__dirname + '/views/index.html');
})

http.listen(port, function(){
  console.log("Listening on port: "+port)
})
