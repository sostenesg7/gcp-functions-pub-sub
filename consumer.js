/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.consumer = (event, context) => {
  const message = event.data
    ? Buffer.from(event.data, 'base64').toString()
    : 'GCF empty event data';
  console.log('ORIGINAL MESSAGE', message);

  const { Translate } = require('@google-cloud/translate').v2;
  const translator = new Translate();

  (async () => {
    try {
      const response = await translator.translate(message, 'pt');

      console.log('TRANSLATED MESSAGE', response);
    } catch (error) {
      console.error(error.message);
    }
  })()

};
