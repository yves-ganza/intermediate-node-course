require('dotenv').config()

const { MongoClient } = require('mongodb')

async function main(callBack) {
  const URI = process.env.MONGO_URI

  const client = new MongoClient(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  try {
    await client.connect()

    await callBack(client)
  } catch (err) {
    console.err(err)

    throw new Error('Unable to Connect to Database')
  }
}

module.exports = main
