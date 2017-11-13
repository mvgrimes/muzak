// Configuration file for muzak
var config = {};

// Set the Alexa API Application ID to control access
config.alexaAppID = process.env.ALEXAAPPID;

// The connection properties for the squeezebox server. This server must be accessible from the Internet so it should
// be protected by basic authentication. If it is not protected the username and password can be null.

config.squeezeserverURL = process.env.URL;
config.squeezeserverPort = process.env.PORT;
config.squeezeServerUsername = process.env.USERNAME;
config.squeezeServerPassword = process.env.PASSWORD;
config.defaultPlayerName = 'kitchen';
// config.defaultPlayerName = 'outdoors';

config.playlists = {
  'jazz': 'pandora://3141420448449849928.mp3',
  'van morrison': 'pandora://3374695489688595016.mp3',
  'blues': 'pandora://3141422333940492872.mp3',
  'amos lee': 'pandora://1712674494826441288.mp3',
  'dishwashing': 'pandora://1649044550041233992.mp3',
  'jack johnson': 'pandora://1451670186947013192.mp3',
  'james taylor': 'pandora://1247104798763805256.mp3',
  'zac brown': 'pandora://1489272784537283144.mp3',
  'billy joel': 'pandora://2733584939730627144.mp3',
  'tom petty': 'pandora://3611578032873040456.mp3',
  'lyle lovett': 'pandora://44464503630359112.mp3',
  'amos less': 'pandora://1712674494826441288.mp3',
  'david grey': 'pandora://162868518528772680.mp3',
  'the head and the heart': 'pandora://2789020817059506760.mp3',
  'ray lamontagne': 'pandora://552400074928319048',
  'robert earle keen': 'pandora://1232800826796304968.mp3'
};

module.exports = config;
