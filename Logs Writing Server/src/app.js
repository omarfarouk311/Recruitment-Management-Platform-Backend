process.env.TZ = 'UTC';
const consumer = require('../config/kafka');
const { getWritePool } = require('../config/db');
const { logs_topic } = require('../config/config');

(async function () {
    const pool = getWritePool();
    await consumer.connect();
    await consumer.subscribe({ topic: logs_topic, fromBeginning: false });

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
            const { id, performed_by, company_id, created_at, extra_data, action_type } = JSON.parse(message.value);
            try {
                // ensure the operation is idempotent by handling the conflict to insert each log exactly once
                const query =
                    `
                    insert into logs (id, performed_by, company_id, created_at, extra_data, action_type)
                    values ($1, $2, $3, $4, $5, $6)
                    on conflict (id) do nothing
                    `;

                await pool.query(query, [id, performed_by, company_id, created_at, extra_data, action_type]);
                await consumer.commitOffsets([{
                    topic,
                    partition,
                    offset: (Number(message.offset) + 1).toString()
                }]);
            }
            catch (err) {
                console.error(err);
            }
        }
    });
})();
