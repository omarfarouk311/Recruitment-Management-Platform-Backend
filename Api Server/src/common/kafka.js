const producer = require('../../config/kafka');

exports.produce = async (data, topicName) => {
    await producer.send({
        topic: topicName,
        messages: [
            { value: JSON.stringify(data) }
        ]
    });
};
