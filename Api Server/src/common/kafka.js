const producer = require('../../config/kafka');
const { logs_topic } = require('../../config/config');

exports.produceLog = async (data) => {
    const createdAt = new Date();

    try {
        await producer.send({
            topic: logs_topic,
            messages: [
                {
                   value: JSON.stringify({
                        ...data,
                        createdAt,
                    })
                }
            ],
        });
    }
    catch (err) {
        console.error("error in producing message in logs topic\n" + err);
        throw err;
    }
};
