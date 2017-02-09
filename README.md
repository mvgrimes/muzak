Muzak
=====

Muzak is a skill for the Amazon Echo that provides control over a Logitech
(Squeezebox) Media Server.

How To Use
----------

### Create an Alexa Skill:

- Visit: https://developer.amazon.com/myapps.html
- Navigate to Alexa then Alexa Skills Kit
- Create a new "Custom" skill
- Audio Player should be No
- Copy and paste the Intent Schema, Custom Slot Types and Sample Utterances
  from the file in speechAssets
- Use the lambda ARN identifier that you'll create below

Note: you will need to modify `speechAssets/Players.txt` to match the names of
the players in your network and use it to populate a custom slot.

### Configuration:

Edit the provided config.js file and enter the required values to allow the
skill to connect to your squeezebox server and the App ID of the Alexa skill
created above.

Run `npm install` to download the prerequesites into `node_modules`.

Run `npm run build` to create `musak.zip` with the script, configuration and
dependencies.

### Create an Amazon Lambda function:

- Visit: https://console.aws.amazon.com/lambda/home
- Create a new lambda function in the east region
- Upload the `muzak.zip` file created above
- Set the Handler to `muzak.hander`

Commands
--------

* Start Player -- Starts the named player using a random play list of songs
* Stop Player -- Stops the named player
* Set Volume -- Sets the volume of the named player to the given level between 0 and 100
* Increase/decrease volume -- Increases or decreases the volume of the named player by 10
* Sync Players -- Syncs the first named player to the second
* Unsync Player -- Unsyncs the named player
* Whats Playing -- Returns information about the current song playing on the named player

### Interactive Mode:

An interactive mode is supported where multiple commands may be issued in one
session. The target player is remembered between requests so that it does not
have to be specified. e.g.

* "Alexa open muzak"
* "select player1"
* "play"
* "set volume to 25"
* "exit"

Credits and Reason for Fork
-------

This is a fork of lordpengwin's muzak (https://github.com/lordpengwin/muzak).
It was forked to better fit my needs, some differences:

- A default player can be specified in the config file
- Stop causes the player to be paused, not powered off
- Play will un-pause
- Adds Next Song command
- Proper package.json for easier setup

This skill uses an enhanced version of Piotr Raczynski's squeezenode Node.JS
module. It has been modified to support basic HTTP authentication as well as
some additional functionality. I have further modified it to support https
and will publish it shortly.
