/* eslint-env node, mocha */

var expect = require('chai').expect;
var _ = require('lodash/fp');
var index = require('../index');

const context = require('aws-lambda-mock-context');
const ctx = context();

describe('Testing ChangePlaylist intent', function() {
  var speechResponse = null;
  var speechError = null;
  var event = require('./event.js').event; // an event

  before(done => {
    index.handler(
      _.merge(event, {
        request: {
          intent: {
            name: 'ChangePlaylist',
            slots: { Playlist: { name: 'Playlist', value: 'jzzz' } }
          }
        }
      }),
      ctx
    );

    ctx.Promise
      .then(resp => {
        speechResponse = resp;
        done();
      })
      .catch(err => {
        speechError = err;
        done();
      });
  });

  describe(
    'The response is structurally correct for Alexa Speech Services',
    () => {
      it('should not have errored', () => {
        expect(speechError).to.be.null;
      });

      it('should have a version', function() {
        expect(speechResponse.version).not.to.be.null;
      });

      it('should have a speechlet response', function() {
        expect(speechResponse.response).not.to.be.null;
      });

      it('should have a spoken response', () => {
        expect(speechResponse.response.outputSpeech).not.to.be.null;
      });

      it('should end the alexa session', function() {
        expect(speechResponse.response.shouldEndSession).not.to.be.null;
        expect(speechResponse.response.shouldEndSession).to.be.true;
      });
    }
  );

  describe('The response is correct', () => {
    it('should have playerAttributes == den', () => {
      expect(speechResponse.sessionAttributes.player).not.to.be.null;
      expect(speechResponse.sessionAttributes.player.toLowerCase()).to.match(
        /(den|kitchen|porch|outdoors)/
      );
    });

    it('outputSpeech is Stopping Den', () => {
      // expect(speechResponse.response.outputSpeech.type).to.equal('PlainText');
      // expect(speechResponse.response.outputSpeech.text).to.equal('Stopped Den');
      expect(speechResponse.response.outputSpeech.type).to.equal('SSML');
      expect(speechResponse.response.outputSpeech.ssml).to.match(
        /Change (Den|Kitchen|Outdoors) playlist to jazz/
      );
    });

    it('card is Simple == Stop Player', () => {
      expect(speechResponse.response.card.type).to.equal('Simple');
      expect(speechResponse.response.card.title).to.match(/Change Playlist/);
      expect(speechResponse.response.card.content).to.match(
        /Change (Den|Kitchen|Outdoors|Porch) playlist to jazz/
      );
    });
    // it('reprompt is correct', () => {
    //   expect(speechResponse.response.reprompt.outputSpeech.type).to.equal(
    //     'PlainText'
    //   );
    //   expect(speechResponse.response.reprompt.outputSpeech.text).to.be.null; // <---
    // });
  });
});
