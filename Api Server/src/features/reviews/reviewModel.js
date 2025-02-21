const { getWritePool,getReadPool } = require('../../../config/db');

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
            query += ' order by id desc';
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

    static async createReview({ creatorId, companyId, title, description, rating, role }) {
        const pool = getWritePool().connect();

        await pool.query('BEGIN');

        try {   
            const query = `
            INSERT INTO reviews (creator_id, company_id, title, description, rating, role, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING id, company_id as "companyId", title, description, rating, role, created_at as "createdAt";
        `;
        const values = [creatorId, companyId, title, description, rating, role];
        const { rows } = await pool.query(query, values);
        this.updateCompanyAvgRating(companyId, pool);
        await pool.query('COMMIT');
        return rows[0];    
        }

        catch(error){
            await pool.query('ROLLBACK');
            return error;
        }
        finally{    
            pool.release();
        }    
    };

    static async updateReview({ reviewId, title, description, rating, role }) {
        const pool = getWritePool().connect();
        await pool.query('BEGIN');
        try{
            const query = `
            UPDATE reviews
            SET title = $1, description = $2, rating = $3, role = $4, created_at = NOW()
            WHERE id = $5
            RETURNING id, company_id as "companyId", title, description, rating, role, created_at as "createdAt", created_at as "createdAt";`;
            const values = [title, description, rating, role, reviewId];
            const { rows } = await pool.query(query, values);
            this.updateCompanyAvgRating(rows[0].companyId, pool);
            await pool.query('COMMIT');
            return rows[0];

        }
        catch(error){
            await pool.query('ROLLBACK');
            return error;
        }
        finally{
            pool.release();
        }    
    }

    static async deleteReview(reviewId) {
        const pool = getWritePool().connect();
        await pool.query('BEGIN');
        try{
        const query = `
            DELETE FROM reviews
            WHERE id = $1
            RETURNING id, company_id as "companyId", title, description, rating, role, created_at as "createdAt";
        `;
        const values = [reviewId];
        const { rows } = await pool.query(query, values);
        this.updateCompanyAvgRating(rows[0].companyId, pool);
        await pool.query('COMMIT');
        return rows[0];
    }
    catch(error){
        await pool.query('ROLLBACK');
        return error;
    }
    finally{
        pool.release();
    }
}

    static async getReviewById(reviewId) {
        const pool = getReadPool();
        const query = `
            SELECT id, creator_id as "creatorId", company_id as "companyId", title, description, rating, role, created_at as "createdAt"
            FROM reviews
            WHERE id = $1;
        `;
        const values = [reviewId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async updateCompanyAvgRating(companyId,pool) {
        const query = `
            UPDATE company
            SET rating = (
                SELECT AVG(rating)
                FROM reviews
                WHERE company_id = $1
            )
            WHERE id = $1
            RETURNING id, rating;
        `;
        const values = [companyId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    

}

module.exports = Review;