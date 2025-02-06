const producer = require('../../config/kafka');
const { logs_topic } = require('../../config/config');

exports.produce = async (data, topicName) => {
    const createdAt = new Date();
    let sendData = data;
    if (topicName == logs_topic) {
        sendData = { ...data, createdAt };
    }
    try {
        await producer.send({
            topic: topicName,
            messages: [
                {
                   value: JSON.stringify({ sendData })
                }
            ],
        });
    }
    catch (err) {
        console.error("error in producing message in logs topic\n" + err);
        throw err;
    }
};
