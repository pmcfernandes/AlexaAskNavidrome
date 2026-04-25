const Alexa = require('ask-sdk-core');
const navidromeApi = require('../navidrome/api');

const PlayRandomSongIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayRandomSongIntent';
  },
  async handle(handlerInput) {
    try {
      const track = await navidromeApi.getRandomSong();

      if (track && track.id) {
        const publicUrl = process.env.PUBLIC_SERVER_URL;
        const streamUrl = `${publicUrl}/stream/${track.id}`;
        console.log('Random Stream URL:', streamUrl);

        const speakOutput = `Tocando ${track.title}.`;

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .addAudioPlayerPlayDirective(
            'REPLACE_ALL',
            streamUrl,
            track.id.toString(), // track token
            0, // offsetInMilliseconds
            null // expectedPreviousToken
          )
          .getResponse();
      } else {
        return handlerInput.responseBuilder
          .speak("Não consegui encontrar nenhuma música na sua biblioteca de músicas.")
          .getResponse();
      }

    } catch (error) {
      // console.error('PlayRandomSongIntent Error:', error);
      return handlerInput.responseBuilder
        .speak('Desculpe, tive problemas para conectar ao seu servidor de músicas.')
        .getResponse();
    }
  }
};

module.exports = PlayRandomSongIntentHandler;
