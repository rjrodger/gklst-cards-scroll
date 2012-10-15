var twitter = require('ntwitter')
  , EventEmitter = require('events').EventEmitter;


exports.init = function(callback) {
  var twit = new twitter({
    consumer_key        : process.env.TWITTER_CONSUMER_KEY,
    consumer_secret     : process.env.TWITTER_CONSUMER_SECRET,
    access_token_key    : process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret : process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

  twitStream = exports.twitStream = new EventEmitter();

  exports.foundtweets = []


  function tweetsearch(){
    twit.search('NodeDublin',{},function(err,data){
      var list = data.results || []
      exports.foundtweets = []
      list.forEach(function(item){
	var tweet = {
	  id: item.id,
	  user: {
	    avatar: item.profile_image_url,
	    screen_name: item.from_user
	  },
	  text: item.text
	}
	//console.dir(tweet)
        exports.foundtweets.push(tweet)
	//twitStream.emit('tweet', tweet);
      })
      console.log('foundtweets:'+exports.foundtweets.length)
    })
  }
  tweetsearch()
  setInterval( tweetsearch, 5*60*1000 )


  twit.stream('statuses/filter', { track: 'NodeDublin' }, function(stream) {
    stream.on('data', function(data) {

      twitStream.emit('tweet', {
        id: data.id,
        user: {
          avatar: data.user.profile_image_url,
          screen_name: data.user.screen_name
        },
        text: data.text
      });
    });

    stream.on('error', function(data) {
	data.user = data.user || {}
      twitStream.emit('tweet', {
        id: data.id,
        user: {
          avatar: data.user.profile_image_url,
          screen_name: data.user.screen_name
        },
        text: data.text
      });
    });
  });

  callback(twitStream);
};