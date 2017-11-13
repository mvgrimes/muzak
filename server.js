'use strict';

require('dotenv').config();

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const context = require('aws-lambda-mock-context');

// lambda.js contains the lambda function for Alexa as in
// https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs
var lambda = require('./index');

const SERVER_PORT = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json({ type: 'application/json' }));

// your service will be available
app.post('/lms/', function(req, res) {
  var ctx = context();
  // TODO: try/catch lambda.handler
  lambda.handler(req.body, ctx);
  ctx.Promise
    .then(resp => {
      return res.status(200).json(resp);
    })
    .catch(err => {
      console.log(err);
    }); // TODO: better error handling
});

var httpsServer = http.createServer(app);

httpsServer.listen(SERVER_PORT, function() {
  console.log(`Alexa Skill service ready on: ${SERVER_PORT} via http`);
});

