require('neon');

var ref, appData,
    Helpers = require('../lib/helpers'),
    colorNames = require('../lib/color_names.json'),
    fs = require('fs'),
    Firebase = require('firebase'),
    Hue = require('philips-hue'),
    hue = new Hue(),
    chroma = require('chroma-js'),
    config = JSON.parse(fs.readFileSync('config/config.json', 'utf-8')),
    TwitterClient = require('../lib/twitter_client'),
    checkTimeout;

var BOT_COMMAND = 'room';

ref = new Firebase(config.firebaseUrl);

Class('HueWorker')({
  fetchQueue : function fetchQueue(){
    console.log('>', 'fetching');

    //get data
    ref.once("value", function (snapshot) {
      //save into global variable
      appData = snapshot.val() || {};

      //init in case on new db
      appData.commandQueue = appData.commandQueue || [];

      //kickstart the process
      this._process();

    }.bind(this), function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

  },

  _process : function _process(){
    var command = appData.commandQueue.pop();

    ref.set(appData, function(){
      // success? exit!
      if(command && command.entities.hashtags){
        command.entities.hashtags.forEach(function(hashtag){
          // console.log('>>>>>>', hashtag.text);
          // var color = chroma(hashtag.text);
          // try{
            console.log('>>>>', hashtag, colorNames[hashtag.text]);
            if(colorNames[hashtag.text]){
              var rgb = colorNames[hashtag.text],
                  color = Helpers.rgb(255, rgb.r, rgb.g, rgb.b);

              color.effect = 'none';


              hue.bridge = "192.168.100.11";
              hue.username = "newdeveloper";
              hue.light(1).setState(color);

              console.log('>>>', color);
            }

            // var color = chroma('239,247,255'),
            //     tweet = '@'+command.user.screen_name+' sup thanks for tha color: '+hashtag.text;

            // console.log('>', color.hsi());
            // console.log('color.rgb()', color.rgb());
            // console.log('color.hsl()', color.hsl());
            // console.log('color.hsv()', color.hsv());
            // console.log('color.lab()', color.lab());
            // console.log('color.lch()', color.lch());
            // console.log('color.gl()', color.gl());
            // console.log('color.num()', color.num());


            // hue.bridge = "192.168.100.11";  // from hue.getBridges()
            // hue.username = "newdeveloper"; // from hue.auth()

            // var state = {
            //   bri: 255,
            //   sat: 255,
            //   hue: 50000,
            //   effect:'none'
            // };

            // hue.light(1).setState(state);
            // console.log('>>>>', command);

            // TwitterClient.post(tweet, function(){
            //   console.log('> posted:', tweet);
            // }.bind(this));

          // }catch(err){
          //   console.log('>', err);
          // }
          // if(color.hex){
            // console.log('>>>', color.hsv());
          // }
          // if(colors[hashtag.text]){
          //   hue.bridge = "192.168.100.11";  // from hue.getBridges()
          //   hue.username = "newdeveloper"; // from hue.auth()
          //   var state = colors[hashtag.text];
          //   hue.light(1).setState(state);
          //   console.log('>>>>', command);
          // }
        });
      }

      checkTimeout = setTimeout(HueWorker.fetchQueue.bind(HueWorker), 500);
    });

  }
});


checkTimeout = setTimeout(HueWorker.fetchQueue.bind(HueWorker), 500);




