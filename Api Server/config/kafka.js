const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092', 'kafka2:9092']
})

const producer = kafka.producer();

const connetProducer = async () => {
  try {
    await producer.connect();
  } catch(error) {
    console.error(error)
  }
}

connetProducer();
module.exports = producer;
