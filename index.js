/**
 * Alexa Skills Kit program to expose the SqueezeServer to Alexa
 *
 */

var Alexa = require('alexa-sdk');
var _ = require('lodash');
var FuzzySet = require('fuzzyset.js');

//  Integration with the squeeze server

var SqueezeServer = require('squeezenode-mvgrimes');
var repromptText = 'What do you want me to do';

// Configuration

var config = require('./config');
var fuzzyPlaylists = FuzzySet( Object.keys( config.playlists ) );

/**
 * Route the incoming request based on type (LaunchRequest, IntentRequest,
 * etc.) The JSON body of the request is provided in the event parameter.
 *
 * @param event
 * @param context
 * @param callback
 */

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = config.alexaAppID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {
  // LaunchRequest: startInteractiveSession,
  // Close: closeInteractiveSession,
  StartPlayer: startPlayer,
  StopPlayer: stopPlayer,
  NextSong: nextSong,
  ListPlaylists: listPlaylists,
  ChangePlaylist: setPlaylist,
  // SyncPlayers: function() {
  // UnsyncPlayer: function() {
  // SetVolume: function() {
  // IncreaseVolume: function() {
  // DecreaseVolume: function() {
  // SelectPlayer: function() {
  WhatsPlaying: whatIsPlaying
  // Unhandled:
};

function registerSqueezeServer() {
  var sq = new SqueezeServer(
    config.squeezeserverURL,
    config.squeezeserverPort,
    config.squeezeServerUsername,
    config.squeezeServerPassword
  );

  return new Promise((resolve, reject) => {
    sq.on('register', function() {
      resolve(sq);
    });
  });
}

function getPlayers(sq) {
  return sq
    .getPlayers()
    .then(reply => {
      // console.log('getPlayers: %j', reply);
      return reply.result;
    })
    .catch(reply => {
      console.log('failed getPlayers: %j', reply);
    });
}

function registerAndGetPlayer() {
  return registerSqueezeServer().then(sq => {
    return getPlayers(sq).then(players => {
      var player = getPlayerObject(
        sq,
        players,
        this.event.request.intent,
        this.event.session
      );
      this.attributes['player'] = player.name;
      return player;
    });
  });
}

function getPlayerObject(squeezeserver, players, intent, session) {
  var player = findPlayerObject(
    squeezeserver,
    players,
    typeof intent.slots.Player.value !== 'undefined' &&
      intent.slots.Player.value !== null
      ? intent.slots.Player.value
      : typeof session.attributes !== 'undefined' &&
          typeof session.attributes.player !== 'undefined'
          ? session.attributes.player
          : config.defaultPlayerName
  );
  return player;
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */

// function onSessionEnded(sessionEndedRequest, session) {
//   console.log(
//     'onSessionEnded requestId=' +
//       sessionEndedRequest.requestId +
//       ', sessionId=' +
//       session.sessionId
//   );
// }

/**
 * This is called when the user activates the service without arguments
 *
 * @param callback A callback to execute to return the response
 */

// function startInteractiveSession(callback) {
//   // If we wanted to initialize the session to have some attributes we could
//   // add those here.
//
//   var sessionAttributes = {};
//   var cardTitle = 'Muzak Started';
//   var speechOutput = 'Muzak Online';
//   var shouldEndSession = false;
//
//   // Format the default response
//
//   callback(
//     sessionAttributes,
//     buildSpeechletResponse(
//       cardTitle,
//       speechOutput,
//       repromptText,
//       shouldEndSession
//     )
//   );
// }

/**
 * Called to close an insteractive session
 *
 * @param callback A callback to execute to return the response
 */

// function closeInteractiveSession(callback) {
//   var sessionAttributes = {};
//   var cardTitle = 'Muzak Closed';
//   var speechOutput = 'Muzak Offline';
//   var shouldEndSession = true;
//
//   // Format the default response
//
//   callback(
//     sessionAttributes,
//     buildSpeechletResponse(
//       cardTitle,
//       speechOutput,
//       repromptText,
//       shouldEndSession
//     )
//   );
// }

/**
 * Select the given player for an interactive session.
 *
 * @param player The player to select
 * @param session The current session
 * @param callback The callback to use to return the result
 */

// function selectPlayer(player, session, callback) {
//   // The player is already selected
//
//   callback(
//     session.attributes,
//     buildSpeechletResponse(
//       'Select Player',
//       'Selected player ' + player.name,
//       null,
//       false
//     )
//   );
// }

/**
 * register with server and call an action
 *
 * @param action    The action to call on player (string)
 * @param params    An array of paramaters to pass to the action
 * @param templates Object of lodash templates
 */

function playerAction(action, params, templates) {
  var player;

  registerAndGetPlayer
    .call(this)
    .then(_player => {
      player = _player;
      console.log(templates.logTmpl({ action, player }));
      // player[action] calls action method on player
      // need apply(player, params) to destructure params w/o ...parms
      return player[action].apply(player, params);
    })
    .then(reply => {
      console.log(`${action} success: `, reply);
      this.emit(
        ':tellWithCard',
        templates.speakTmpl({ action, player }),
        templates.titleTmpl({ action, player }),
        templates.speakTmpl({ action, player }),
        { smallImage: null, largeImage: null }
      );
    })
    .catch(reply => {
      console.log(`${action} error: `, reply);
      this.emit(':tell', templates.errorTmpl({ action, player }));
    });
}

/**
 * Start a player to play random tracks
 */

function startPlayer() {
  playerAction.call(this, 'play', [], {
    logTmpl: _.template('Executing ${action} with player ${player.name}'),
    speakTmpl: _.template('Starting ${player.name}'),
    titleTmpl: _.template('Playing'),
    errorTmpl: _.template('Failed to start player ${player.name}')
  });
}

/**
 * Stop a player
 */

function stopPlayer() {
  playerAction.call(this, 'pause', [], {
    logTmpl: _.template('Executing ${action} with player ${player.name}'),
    speakTmpl: _.template('Stopping ${player.name}'),
    titleTmpl: _.template('Stopped'),
    errorTmpl: _.template('Failed to stop player ${player.name}')
  });
}

/**
 * Advance to next song
 *
 */

function nextSong(player, session, callback) {
  playerAction.call(this, 'next', [], {
    logTmpl: _.template('Executing ${action} with player ${player.name}'),
    speakTmpl: _.template('Skipping song in ${player.name}'),
    titleTmpl: _.template('Skipping'),
    errorTmpl: _.template('Failed to skip song in the ${player.name}')
  });
}

/**
 * List playlists
 *
 */

function listPlaylists() {
  var playlists = Object.keys(config.playlists).join(', ');
  this.emit(
    ':tellWithCard',
    'The following playlists are available: ' + playlists,
    'List Playlists',
    'Unable to get list of playlists',
    { smallImage: null, largeImage: null }
  );
}

/**
 * Change to new playlist
 *
 */

function getPlaylist(guess) {
  var matches = fuzzyPlaylists.get( guess );
  console.log('... guess: ${guess}:', matches);
  return matches[0][1];
}

function setPlaylist() {
  var intent = this.event.request.intent;
  var playlist = intent.slots.Playlist && getPlaylist(intent.slots.Playlist.value);

  console.log('... and playlist is %j', playlist);
  if (typeof playlist === 'undefined' || playlist === null) {
    this.emit(
      ':tellWithCard',
      'Change Playlist',
      'Unable to find that playlist',
      'Change Playlist',
      { smallImage: null, largeImage: null }
    );
  }

  // Change to different playlist
  var url = config.playlists[playlist];
  console.log('... and url is %j', url);
  if (typeof url === 'undefined' || url === null) {
    return this.emit(
      ':tellWithCard',
      'Change Playlist',
      'Unable to find a playlist for ' + playlist,
      'Change Playlist',
      { smallImage: null, largeImage: null }
    );
  }

  playerAction.call(this, 'setPlaylist', [url], {
    logTmpl: _.template('Executing ${action} with player ${player.name}'),
    speakTmpl: _.template('Change ${player.name} playlist to ' + playlist),
    titleTmpl: _.template('Change Playlist'),
    errorTmpl: _.template(
      'Failed to change playlist on ${player.name} to ' + playlist
    )
  });
}

/**
 * Sync one player to another
 *
 * @param squeezeserver The handler to the SqueezeServer
 * @param players A list of players on the server
 * @param intent The target intent
 * @param session The current session
 * @param callback The callback to use to return the result
 */

// function syncPlayers(squeezeserver, players, intent, session, callback) {
//   //// TODO: Need to make sure that both players are turned on.
//
//   var player1 = null;
//   var player2 = null;
//   try {
//     console.log('In syncPlayers with intent %j', intent);
//
//     // Try to find the target players. We need the sqeezeserver player object
//     // for the first, but only the player info object for the second.
//
//     player1 = findPlayerObject(
//       squeezeserver,
//       players,
//       typeof intent.slots.FirstPlayer.value !== 'undefined' &&
//         intent.slots.FirstPlayer.value != null
//         ? intent.slots.FirstPlayer.value
//         : session.attributes.player
//     );
//     if (player1 == null) {
//       // Couldn't find the player, return an error response
//
//       console.log('Player not found: ' + intent.slots.FirstPlayer.value);
//       callback(
//         session.attributes,
//         buildSpeechletResponse(
//           intentName,
//           'Player not found',
//           null,
//           session.new
//         )
//       );
//     }
//
//     session.attributes = { player: player1.name.toLowerCase() };
//     player2 = null;
//     for (var pl in players) {
//       if (
//         players[pl].name.toLowerCase() ===
//           normalizePlayer(intent.slots.SecondPlayer.value)
//       )
//         player2 = players[pl];
//     }
//
//     // If we found the target players, sync them
//
//     if (player1 && player2) {
//       console.log('Found players: %j and player2', player1, player2);
//       player1.sync(player2.playerindex, function(reply) {
//         if (reply.ok)
//           callback(
//             session.attributes,
//             buildSpeechletResponse(
//               'Sync Players',
//               'Synced ' + player1.name + ' to ' + player2.name,
//               null,
//               session.new
//             )
//           );
//         else {
//           console.log('Failed to sync %j', reply);
//           callback(
//             session.attributes,
//             buildSpeechletResponse(
//               'Sync Players',
//               'Failed to sync players ' + player1.name + ' and ' + player2.name,
//               null,
//               true
//             )
//           );
//         }
//       });
//     } else {
//       console.log('Player not found: ');
//       callback(
//         session.attributes,
//         buildSpeechletResponse(
//           'Sync Players',
//           'Player not found',
//           null,
//           session.new
//         )
//       );
//     }
//   } catch (ex) {
//     console.log(
//       'Caught exception in syncPlayers %j for ' + player1 + ' and ' + player2,
//       ex
//     );
//     callback(
//       session.attributes,
//       buildSpeechletResponse('Sync Players', 'Caught Exception', null, true)
//     );
//   }
// }

/**
 * Get the current volume of a player and then perform a change function on it
 *
 * @param player The player to get the volume for
 * @param session The current session
 * @param callback The callback to use to return the result
 * @param delta The amount to change the player volume
 */

// function getPlayerVolume(player, session, callback, delta) {
//   console.log('In getPlayerVolume with player %s', player.name);
//   try {
//     // Get the volume of the player
//
//     player.getVolume(function(reply) {
//       if (reply.ok) {
//         var volume = Number(reply.result);
//         setPlayerVolume(player, volume + delta, session, callback);
//       } else
//         callback(
//           session.attributes,
//           buildSpeechletResponse(
//             'Get Player Volume',
//             'Failed to get volume for player ' + player.name,
//             null,
//             true
//           )
//         );
//     });
//   } catch (ex) {
//     console.log('Caught exception in stopPlayer %j', ex);
//     callback(
//       session.attributes,
//       buildSpeechletResponse(
//         'Get Player Volume',
//         'Caught Exception',
//         null,
//         true
//       )
//     );
//   }
// }

/**
 * Set the volume of a player.
 *
 * @param player The target player
 * @param volume The level to set the volume to
 * @param session The current session
 * @param callback The callback to use to return the result
 */

// function setPlayerVolume(player, volume, session, callback) {
//   var volume = Number(intent.slots.Volume.value);
//
//   // Make sure the volume is in the range 0 - 100
//
//   if (volume > 100) volume = 100;
//   else if (volume < 0) volume = 0;
//
//   try {
//     console.log('In setPlayerVolume with volume:' + volume);
//
//     // Set the volume on the player
//
//     player.setVolume(volume, function(reply) {
//       if (reply.ok)
//         callback(
//           session.attributes,
//           buildSpeechletResponse(
//             'Set Player Volume',
//             'Player ' + player.name + ' set to volume ' + volume,
//             null,
//             session.new
//           )
//         );
//       else {
//         console.log('Failed to set volume %j', reply);
//         callback(
//           session.attributes,
//           buildSpeechletResponse(
//             'Set Player Volume',
//             'Failed to set player volume',
//             null,
//             true
//           )
//         );
//       }
//     });
//   } catch (ex) {
//     console.log('Caught exception in setPlayerVolume %j', ex);
//     callback(
//       session.attributes,
//       buildSpeechletResponse('Set Player', 'Caught Exception', null, true)
//     );
//   }
// }

/**
 * Unsync a player
 *
 * @param player The player to unsync
 * @param session The current session
 * @param callback The callback to use to return the result
 */

// function unsyncPlayer(player, session, callback) {
//   console.log('In unsyncPlayer with player %s', player.name);
//
//   try {
//     // Unsynchronize the player
//
//     player.unSync(function(reply) {
//       if (reply.ok)
//         callback(
//           session.attributes,
//           buildSpeechletResponse(
//             'Unsync Player',
//             'Player ' + player.name + ' unsynced',
//             null,
//             session.new
//           )
//         );
//       else {
//         console.log('Failed to sync %j', reply);
//         callback(
//           session.attributes,
//           buildSpeechletResponse(
//             'Unsync Player',
//             'Failed to unsync player ' + player.name,
//             null,
//             true
//           )
//         );
//       }
//     });
//   } catch (ex) {
//     console.log('Caught exception in unsyncPlayer %j', ex);
//     callback(
//       session.attributes,
//       buildSpeechletResponse('Unsync Player', 'Caught Exception', null, true)
//     );
//   }
// }

/**
 * Find out what is playing on a player.
 *
 * @param squeezeserver The handler to the SqueezeServer
 * @param player The player to get the information for
 * @param session The current session
 * @param callback The callback to use to return the result
 */

function whatIsPlaying() {
  // Ask the player it what it is playing. This is a series of requests for
  // the song, artist and album
  var player;
  var title, artist, album;

  registerAndGetPlayer
    .call(this)
    .then(_player => {
      player = _player;

      console.log('In whatIsPlaying with player %s', player.name);
      return player.getCurrentTitle();
    })
    .then(reply => {
      title = reply.result;
      return player.getArtist();
    })
    .then(reply => {
      artist = reply.result;
      return player.getAlbum();
    })
    .then(reply => {
      album = reply.result;

      this.emit(
        ':tellWithCard',
        `Player ${player.name} is playing ${title} by ${artist} from ${album}`,
        'What is Playing in {$player.name}',
        `Player ${player.name} is playing ${title} by ${artist} from ${album}`
      );
    })
    .catch(error => {
      console.log('Failed to get info');

      this.emit(
        ':tellWithCard',
        `Player ${player.name} is playing ${title} by ${artist}`,
        'Whats Playing'
      );
    });
}

/**
 * Find a player object given its name. Player objects can be used to interact with the player
 *
 * @param squeezeserver The SqueezeServer to get the Player object from
 * @param players A list of players to search
 * @param name The name of the player to find
 * @returns The target player or null if it is not found
 */

function findPlayerObject(squeezeserver, players, name) {
  name = normalizePlayer(name);
  // console.log('In findPlayerObject with ' + name);

  // Look for the player in the players list that matches the given name. Then
  // return the corresponding player object from the squeezeserver stored by
  // the player's id

  // NOTE: For some reason squeezeserver.players[] is empty but you can still
  // reference values in it. I think it is a weird javascript timing thing

  for (var pl in players) {
    if (players[pl].name.toLowerCase() === name)
      return squeezeserver.players[players[pl].playerid];
  }

  console.log('Player %s not found', name);
}

/**
 * Do any necessary clean up of player names
 *
 * @param playerName The name of the player to clean up
 * @returns The normalized player name
 */

function normalizePlayer(playerName) {
  if (typeof playerName === 'undefined') return playerName;

  // After the switch to custom slots multi name players like living room
  // became living-room. Revert the string back to what it was

  playerName = playerName.toLowerCase().replace('-', ' ');
  if (playerName == 'livingroom') playerName = 'living room';

  return playerName;
}

/**
 * Format a response to send to the Echo
 *
 * @param title The title for the UI Card
 * @param output The speech output
 * @param repromptText The prompt for more information
 * @param shouldEndSession A flag to end the session
 * @returns A formatted JSON object containing the response
 */

// function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
//   return {
//     outputSpeech: {
//       type: 'PlainText',
//       text: output
//     },
//     card: {
//       type: 'Simple',
//       title: 'SessionSpeechlet - ' + title,
//       content: 'SessionSpeechlet - ' + output
//     },
//     reprompt: {
//       outputSpeech: {
//         type: 'PlainText',
//         text: repromptText
//       }
//     },
//     shouldEndSession: shouldEndSession
//   };
// }

/**
 * Return the response
 *
 * @param sessionAttributes The attributes for the current session
 * @param speechletResponse The response object
 * @returns A formatted object for the response
 */

// function buildResponse(sessionAttributes, speechletResponse) {
//   return {
//     version: '1.0',
//     sessionAttributes: sessionAttributes,
//     response: speechletResponse
//   };
// }
