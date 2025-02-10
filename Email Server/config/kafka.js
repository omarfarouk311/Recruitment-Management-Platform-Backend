const { Kafka } = require('kafkajs')
const { brokers } = require('../config/config');

const kafka = new Kafka({
  clientId: 'email-server',
  brokers
});

const consumer = kafka.consumer({ groupId: 'email-servers' });

module.exports = consumer;
