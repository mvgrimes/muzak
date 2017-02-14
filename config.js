// Configuration file for muzak

var config = {};

// Set the Alexa API Application ID to control access

config.alexaAppID = "amzn1.ask.skill.xxxxx";

// The connection properties for the squeezebox server. This server must be accessible from the Internet so it should
// be protected by basic authentication. If it is not protected the username and password can be null.

config.squeezeserverURL = "https://yourdomain.com";
config.squeezeserverPort = 443; // 80 // 9000;
config.squeezeServerUsername = "your username";
config.squeezeServerPassword = "your password";
config.defaultPlayerName = "kitchen";

config.playlists = {
  "jazz": "pandora://3141420448449849928.mp3",
  "van morrison": "pandora://3374695489688595016.mp3",
  "blues": "pandora://3141422333940492872.mp3",
  "amos lee": "pandora://1712674494826441288.mp3",
  "dishwashing": "pandora://1649044550041233992.mp3",
  "jack johnson": "pandora://1451670186947013192.mp3",
  "jack johnsen": "pandora://1451670186947013192.mp3",
  "james taylor": "pandora://1247104798763805256.mp3",
  "zack brown": "pandora://1489272784537283144.mp3"
};

module.exports = config;
