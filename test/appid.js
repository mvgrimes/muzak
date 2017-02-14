/* eslint-env node, mocha */

var expect = require('chai').expect;
var _ = require('lodash/fp');
var index = require('../index');

const context = require('aws-lambda-mock-context');
const ctx = context();

describe('Testing a session with a bad id', function() {
  var speechResponse = null;
  var speechError = null;
  var event = require('./event.js').event; // an event

  before(done => {
    index.handler(
      _.merge(event, { session: { application: { applicationId: 'bad' } } }),
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
      it('should have errored', () => {
        expect(speechError).not.to.be.null;
      });

      it('should be an Invalid App Id', function() {
        expect(speechError.toString()).to.match(/Error: Invalid Application/);
      });
    }
  );
});
