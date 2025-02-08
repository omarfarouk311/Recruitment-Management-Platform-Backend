const { Kafka } = require('kafkajs')
const { brokers } = require('../config/config');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers
});

const consumer = kafka.consumer({ groupId: 'logs-writing' });

module.exports = consumer;
