const { getReadPool } = require('../../../config/db');

class Review {
    constructor({ companyId, title, description, rating, role, createdAt }) {
        this.companyId = companyId;
        this.title = title;
        this.description = description;
        this.rating = rating;
        this.role = role;
        this.createdAt = createdAt;
    }

    static async getReviews(companyId, filters, limit = 5) {
        const pool = getReadPool();
        // base query
        let query = `select company_id as "companyId", title, description, rating, role, created_at as "createdAt" from reviews where company_id = $1`;
        const values = [companyId];
        let index = 2;

        //specific rating & up
        if (filters.rating) {
            query += ` and rating >= $${index}`;
            values.push(filters.rating);
            index++;
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
        query += ` limit $${index} offset $${index + 1}`;
        values.push(limit, (filters.page - 1) * limit);
        index += 2;

        const result = await pool.query(query, values);
        return result.rows;
    }

}

module.exports = Review;