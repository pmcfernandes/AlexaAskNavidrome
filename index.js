require('dotenv').config();
const express = require('express');
const { ExpressAdapter } = require('ask-sdk-express-adapter');
const Alexa = require('ask-sdk-core');
const axios = require('axios');

const PlaySongIntentHandler = require('./intents/PlaySongIntent');
const PlayRandomSongIntentHandler = require('./intents/PlayRandomSongIntent');
const PlayRandomSongFromArtistIntentHandler = require('./intents/PlayRandomSongFromArtistIntent');
const navidromeApi = require('./navidrome/api');

const app = express();
const PORT = process.env.PORT || 3000;

const skillBuilder = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    PlayRandomSongFromArtistIntentHandler,
    PlayRandomSongIntentHandler,
    PlaySongIntentHandler,
    {
      canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
      },
      handle(handlerInput) {
        const speakOutput = 'Bem-vindo ao Player Navidrome. Qual música você gostaria de tocar?';
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .getResponse();
      }
    },
    {
      canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent');
      },
      handle(handlerInput) {
        const speakOutput = 'Você pode dizer toque seguido do nome de uma música.';
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .getResponse();
      }
    },
    {
      canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
            || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
            || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent');
      },
      handle(handlerInput) {
        // Stop the audio
        return handlerInput.responseBuilder
          .addAudioPlayerStopDirective()
          .getResponse();
      }
    }
  );

const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, true, true);

// Endpoint for Alexa Skill requests
app.post('/skill', adapter.getRequestHandlers());

// Endpoint for proxying audio to Alexa securely
app.get('/stream/:songId', async (req, res) => {
  const songId = req.params.songId;

  try {
    const navidromeStreamUrl = navidromeApi.getStreamUrl(songId);

    const response = await axios({
      method: 'get',
      url: navidromeStreamUrl,
      responseType: 'stream'
    });

    // Forward important headers for the audio stream
    res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    res.setHeader('Accept-Ranges', 'bytes');

    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying audio:', error.message);
    res.status(500).send('Error proxying audio');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Navidrome Alexa Skill server running on port ${PORT}`);
  console.log(`Skill endpoint: http://localhost:${PORT}/skill`);
  console.log(`Audio Proxy endpoint: http://localhost:${PORT}/stream/:songId`);
});
