const producer = require('../../config/kafka');

exports.produce = async (data, topicName) => {
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
