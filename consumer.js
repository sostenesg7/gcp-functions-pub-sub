/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const saveToDatabase = async (message) => {
  const {
    USER,
    SOCKET_PATH,
    PASSWORD,
    DATABASE,
    HOST,
  } = process.env;

  const mysql = require('mysql');

  console.log('MESSAGE', message)

  const connection = mysql.createConnection({
    host: HOST,
    socketPath: SOCKET_PATH,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
  });

  try {
    connection.connect();
    console.log('DATABASE CONNECTED', message);

    // connection.query({ sql: 'SELECT * FROM user_message', timeout: 40000, }, (err, res) => {
    //   if (err) {
    //     connection.end();
    //     return console.error('SELECT', err)
    //   }
    //   connection.end();
    //   console.log(res);
    // })

    connection.query(
      'INSERT INTO user_message SET ?',
      { text: message },
      (error, results) => {
        connection.end();
        if (error) {
          console.error('INSERT ERROR', error);
          return;
        }
        console.log('MESSAGE SAVED TO DATABASE', results);
      }
    );
  } catch (error) {
    console.error('CONNECTION ERROR', error);
    connection.end();
  } finally {
    // console.log('DATABASE CONNECTION CLOSED');
  }
};

// Imports the Google Cloud client library
exports.server = async (req, res) => {
  const { PubSub } = require('@google-cloud/pubsub');

  const message = req.query.message || req.body.message || 'Hello World!';
  saveToDatabase(message);
  // Instantiates a client
  const pubsub = new PubSub();
  // Send a message to the topic
  try {
    await pubsub.topic('taiguara-pub').publish(Buffer.from(message));
    res.status(200).send(message);
  } catch (error) {
    res.status(500).send(error.message);
  }
};



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
