const { getWritePool } = require('../../../config/db');
const { role } = require('../../../config/config');

class User {
    constructor({ email, password, role }) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    static getMasterPool() {
        return getWritePool();
    }

    async create() {
        const query =
            `
            INSERT INTO Users (email, password, role)
            VALUES ($1, $2, $3)
            RETURNING id
            `;
        const { rows } = await User.getMasterPool().query(query, [this.email, this.password, this.role]);
        return rows[0];
    }
}

module.exports = User;