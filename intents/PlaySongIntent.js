const Alexa = require('ask-sdk-core');
const navidromeApi = require('../navidrome/api');

const PlaySongIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlaySongIntent';
  },
  async handle(handlerInput) {
    const songSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'song');

    if (!songSlot) {
      return handlerInput.responseBuilder
        .speak("Não entendi o nome da música. O que você gostaria de tocar?")
        .reprompt("Diga-me o nome da música.")
        .getResponse();
    }

    try {
      const track = await navidromeApi.searchTrack(songSlot);

      // Subsonic API track model returns track.id and track.title
      if (track && track.id) {
        const publicUrl = process.env.PUBLIC_SERVER_URL;
        const streamUrl = `${publicUrl}/stream/${track.id}`;
        console.log('Stream URL:', streamUrl);

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
          .speak(`Não consegui encontrar uma música reproduzível para ${songSlot} na sua biblioteca de músicas.`)
          .getResponse();
      }

    } catch (error) {
      console.error('PlaySongIntent Error:', error);
      return handlerInput.responseBuilder
        .speak('Desculpe, tive problemas para conectar ao seu servidor Navidrome.')
        .getResponse();
    }
  }
};

module.exports = PlaySongIntentHandler;
