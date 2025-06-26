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
            INSERT INTO Users (email, password, role, token_version)
            VALUES ($1, $2, $3, 0)
            RETURNING id
            `;
        const { rows } = await User.getMasterPool().query(query, [this.email, this.password, this.role]);
        return rows[0];
    }

    static async getUserData(email) {
        const query =
            `
            SELECT id as "userId", password as "hashedPassword", role as "userRole", token_version as "tokenVersion"
            FROM Users
            WHERE email = $1
            `;
        const { rows } = await User.getMasterPool().query(query, [email]);
        return rows.length > 0 ? rows[0] : null;
    }

    static async getUserName(id, userRole) {
        let query;
        if (userRole === role.jobSeeker) {
            query = 'SELECT name FROM Job_Seeker WHERE id = $1';
        }
        else if (userRole === role.company) {
            query = 'SELECT name FROM Company WHERE id = $1';
        }
        else {
            query = 'SELECT name FROM Recruiter WHERE id = $1';
        }

        const { rows } = await User.getMasterPool().query(query, [id]);
        return rows.length > 0 ? rows[0].name : null;
    }

    static async getTokenVersion(id) {
        const query = 'SELECT token_version as "tokenVersion" FROM Users WHERE id = $1';
        const { rows } = await User.getMasterPool().query(query, [id]);
        return rows[0].tokenVersion;
    }

    static async updateTokenVersion(id) {
        const query = 'UPDATE Users SET token_version = token_version + 1 WHERE id = $1';
        await User.getMasterPool().query(query, [id]);
    }
}

module.exports = User;