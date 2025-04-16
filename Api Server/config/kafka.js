const { Kafka } = require('kafkajs')
const { brokers } = require('./config');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers
});

const producer = kafka.producer();

const connetProducer = async () => {
  try {
    await producer.connect();
  } catch (error) {
    console.error(error)
  }
}

connetProducer();

module.exports = producer;
