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
            `select id, company_id as "companyId", title, description, rating, role, created_at as "createdAt"
            from reviews
            where company_id = $${index++}`;

        //specific rating
        if (filters.rating) {
            query += ` and rating = $${index++}`;
            values.push(filters.rating);
        }

        // ensure that rows maintain the same order if no sorting filter is applied, because postgres doesn't guarantee it
        if (!Object.keys(filters).some(value => value === 'sortByDate' || value === 'sortByRating')) {
            query += ' order by id';
        }

        //rating asc
        else if (filters.sortByRating === 1) {
            query += ` order by rating`;
        }

        //rating desc
        else if (filters.sortByRating === -1) {
            query += ` order by rating desc`;
        }

        // oldest
        else if (filters.sortByDate === 1) {
            query += ` order by created_at`;
        }

        // newest
        else if (filters.sortByDate === -1) {
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