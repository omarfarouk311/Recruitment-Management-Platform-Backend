const { getReadPool } = require('../../../config/db');

class IndustryModel {
    static async getIndustries() {
        let results = await getReadPool().query(`
            SELECT  id, name
            FROM industry;
        `);
        return results.rows;
    }

}

module.exports = {
    IndustryModel
}