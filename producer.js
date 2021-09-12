

exports.producer = (req, res) => {
  const { PubSub } = require('@google-cloud/pubsub');
  const pubsub = new PubSub();

  async function publish() {
    const message = req.query.message || '';
    const dataBuffer = Buffer.from(message);

    try {
      await pubsub.topic('functions-topic').publish(dataBuffer);
      console.log('MESSAGE PUBLISHED', message);
      res.status(200).send('MESSAGE PUBLISHED');
    } catch (error) {
      res.status(200).send(error.message);
      console.error(error.message);
      process.exitCode = 1;
    }
  }

  publish();


};
