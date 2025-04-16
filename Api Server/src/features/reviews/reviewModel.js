const { getWritePool, getReadPool } = require('../../../config/db');

class Review {
    constructor({ id, creatorId, companyId, title, description, rating, role, createdAt }) {
        this.id = id;
        this.creatorId = creatorId;
        this.companyId = companyId;
        this.title = title;
        this.description = description;
        this.rating = rating;
        this.role = role;
        this.createdAt = createdAt;
    }

    static getReplicaPool() {
        return getReadPool();
    }

    static getMasterPool() {
        return getWritePool();
    }

    async create() {
        const pool = Review.getMasterPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const query =
                `
                INSERT INTO reviews (creator_id, company_id, title, description, rating, role, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
                `;
            const values = [this.creatorId, this.companyId, this.title, this.description, this.rating, this.role, this.createdAt];
            const { rows } = await client.query(query, values);

            await Review.updateCompanyAvgRating(this.companyId, client);

            await client.query('COMMIT');

            return rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    };

    async update() {
        const pool = Review.getMasterPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const query =
                `
                UPDATE reviews
                SET title = $1, description = $2, rating = $3, role = $4
                WHERE id = $5
                RETURNING company_id as "companyId"
                `;
            const values = [this.title, this.description, this.rating, this.role, this.id];
            const { rows } = await client.query(query, values);

            await Review.updateCompanyAvgRating(rows[0].companyId, client);

            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }

    static async delete(reviewId) {
        const pool = Review.getMasterPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const query =
                `
                DELETE FROM reviews
                WHERE id = $1
                RETURNING company_id as "companyId"
                `;
            const values = [reviewId];
            const { rows } = await client.query(query, values);

            await Review.updateCompanyAvgRating(rows[0].companyId, client);

            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }

    static async getReviewById(reviewId) {
        const pool = Review.getReplicaPool();
        const query = `
            SELECT id, creator_id as "creatorId"
            FROM reviews
            WHERE id = $1;
        `;
        const values = [reviewId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async updateCompanyAvgRating(companyId, client) {
        const updateRating = `
            UPDATE company
            SET rating = (
                SELECT AVG(rating)
                FROM reviews
                WHERE company_id = $1
            )
            WHERE id = $1
        `;
        await client.query(updateRating, [companyId]);
    }

}

module.exports = Review;