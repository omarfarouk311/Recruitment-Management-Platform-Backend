process.env.TZ = 'UTC';
const consumer = require('../config/kafka');
const { getWritePool } = require('../config/db');
const { logs_topic } = require('../config/config');
const retry = require('async-retry');

(async function () {
    const pool = getWritePool();

    await consumer.connect();
    await consumer.subscribe({ topic: logs_topic, fromBeginning: true });

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
            const { type = 1, id, performed_by, company_id, created_at, extra_data, action_type } = JSON.parse(message.value);
            let query, values;

            if (type) {
                // ensure the operation is idempotent by handling the conflict to insert each log exactly once
                query =
                    `
                    insert into logs (id, performed_by, company_id, created_at, extra_data, action_type)
                    values ($1, $2, $3, $4, $5, $6)
                    on conflict (id) do nothing
                    `;
                values = [id, performed_by, company_id, created_at, extra_data, action_type];
            }
            else {
                query =
                    `
                    delete from logs
                    where id = $1
                    `;
                values = [id];
            }

            // retry the operaion in case of no available connections to borrow from the pool
            try {
                await retry(async (bail, attempt) => {
                    await pool.query(query, values);
                    await consumer.commitOffsets([{
                        topic,
                        partition,
                        offset: (Number(message.offset) + 1).toString()
                    }]);
                }, {
                    retries: 4,
                    factor: 2,
                    minTimeout: 2000,
                    onRetry: err => console.error(err),
                });
            }
            catch (err) {
                console.error(err);
            }
        }
    });
})();