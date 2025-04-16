const { Kafka } = require('kafkajs')
const { brokers } = require('../config/config');

const kafka = new Kafka({
  clientId: 'logs-server',
  brokers
});

const consumer = kafka.consumer({ groupId: 'logs-writing' });

module.exports = consumer;
