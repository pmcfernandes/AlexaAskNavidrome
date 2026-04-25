const Alexa = require('ask-sdk-core');
const navidromeApi = require('../navidrome/api');

const PlayRandomSongFromArtistIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayRandomSongFromArtistIntent';
  },
  async handle(handlerInput) {
    const artistSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'artist');

    if (!artistSlot) {
      return handlerInput.responseBuilder
        .speak("Não entendi o nome do artista. De quem você gostaria de ouvir uma música aleatória?")
        .reprompt("Diga-me o nome do artista.")
        .getResponse();
    }

    try {
      const track = await navidromeApi.getRandomSongFromArtist(artistSlot);

      if (track && track.id) {
        const publicUrl = process.env.PUBLIC_SERVER_URL;
        const streamUrl = `${publicUrl}/stream/${track.id}`;
        console.log('Random Artist Stream URL:', streamUrl);

        const speakOutput = `Tocando ${track.title} de ${track.artist}.`;

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
          .speak(`Não consegui encontrar nenhuma música de ${artistSlot} na sua biblioteca.`)
          .getResponse();
      }

    } catch (error) {
      return handlerInput.responseBuilder
        .speak('Desculpe, tive problemas para conectar ao seu servidor de músicas.')
        .getResponse();
    }
  }
};

module.exports = PlayRandomSongFromArtistIntentHandler;
