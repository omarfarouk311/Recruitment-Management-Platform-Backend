const Stats = require('./statsModel');

exports.getStats = async (seekerId) => {
    return await Stats.getStats(seekerId);
};