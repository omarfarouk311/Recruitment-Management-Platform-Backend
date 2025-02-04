const { getReadPool } = require('../../../config/db');

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

    static async getReviews(companyId, filters, limit = 5) {
        const pool = getReadPool();
        const values = [companyId];
        let index = 1;

        // base query
        let query =
            `select company_id as "companyId", title, description, rating, role, created_at as "createdAt"
            from reviews
            where company_id = $${index++}`;

        //specific rating & up
        if (filters.rating) {
            query += ` and rating >= $${index++}`;
            values.push(filters.rating);
        }

        //sorting
        //rating asc
        if (filters.sortByRating === 1) {
            query += ` order by rating asc`;
        }

        //rating desc
        if (filters.sortByRating === -1) {
            query += ` order by rating desc`;
        }

        // oldest
        if (filters.sortByDate === 1) {
            query += ` order by created_at asc`;
        }

        // newest
        if (filters.sortByDate === -1) {
            query += ` order by created_at desc`;
        }

        // pagination
        query += ` limit $${index++} offset $${index++}`;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await pool.query(query, values);
        return rows;
    }

}

module.exports = Review;