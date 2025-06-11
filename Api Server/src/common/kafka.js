const producer = require('../../config/kafka');

exports.produce = async (data, topicName) => {
    console.log('Producing data to Kafka topic:', topicName);
    console.log('Data:', data);
    if(!Array.isArray(data)) {
        await producer.send({
            topic: topicName,
            messages: [
                { value: JSON.stringify(data) }
            ]
        });
    } else {
        await producer.send({
            topic: topicName,
            messages: data.map(d => ({ value: JSON.stringify(d) }))
        });
    }
};
