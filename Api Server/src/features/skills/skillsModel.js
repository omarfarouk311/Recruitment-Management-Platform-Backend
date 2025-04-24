const ReadPool = require('../../../config/db').getReadPool;

exports.getSkills = async () => {
    try{
        let result = await ReadPool().query(`
            SELECT id, name FROM skills
            ORDER BY name ASC;
        `)
        return result.rows;
    } catch (err) {
        next(err);
    }
}