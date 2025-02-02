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

    static async getReviews(companyId, page, filters = {}, limit = 5) {
        const pool = getReadPool();
        // base query
        let query = `select company_id as "companyId", title, description, rating, role, created_at as "createdAt" from reviews where company_id = ($1)`;
        const values = [companyId];

        //specific rating & up
        if (filters.rating) {
            query += ` and rating >= ($2)`;
            values.push(filters.rating);
        }

        //sorting by rating
        if (filters.sort) {
            const { sort } = filters;
            const prev = false
            //rating asc
            if (sort.rating === 1) {
                query += ` order by rating asc`;
                prev = true;
            }

            //rating desc
            if (sort.rating === -1) {
                query += ` order by rating desc`;
                prev = true
            }

            // newest
            if (sort.date === 1) {
                if (prev) query += `,created_at asc`
                else {
                    query += `order by created_at asc`
                    prev = true
                }
            }

            // oldest
            if (sort.date === -1) {
                if (prev) query += `,created_at desc`
                else {
                    query += `order by created_at desc`
                    prev = true
                }
            }
        }

        // pagination
        query += `limit ($3) offset ($4)`;
        values.push(limit, (page - 1) * limit);

        const result = await pool.query(query, values);
        return result.rows;
    }

}

module.exports = Review;