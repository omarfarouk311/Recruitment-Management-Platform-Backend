const { getReadPool, getWritePool } = require('../../../../config/db');
const { pagination_limit } = require('../../../../config/config');

class Job {
    static replicaPool = getReadPool();

    static async getRecommendedJobs(seekerId, filters, limit = pagination_limit) {
        const values = [seekerId];
        let index = 1;
        let query =
            `
            select j.title, c.name as "companyName", c.rating as "companyRating", j.country, j.city, j.created_at as "createdAt"
            from Recommendations r
            join job j on r.job_id = j.id
            join company c on j.company_id = c.id
            ${filters.industry ? 'join industry i on j.industry_id = i.id' : ''}
            where r.seeker_id = $${index++}
            `;

        if (filters.country) {
            query += ` and j.country = $${index++}`;
            values.push(filters.country);
        }
        if (filters.city) {
            query += ` and j.city = $${index++}`;
            values.push(filters.city);
        }
        if (filters.remote) {
            query += ` and j.remote = true`;
        }
        if (filters.industry) {
            query += ` and i.name = $${index++}`;
            values.push(filters.industry);
        }
        // company rating filter is from the lower bound up to (and not including) the upper bound
        if (filters.companyRating) {
            query += ` and c.rating >= $${index++} and c.rating < $${index++}`;
            values.push(filters.companyRating, filters.companyRating + 1);
        }
        if (filters.fromDate) {
            query += ` and j.created_at between $${index++} and $${index++}`;
            values.push(filters.fromDate, filters.toDate);
        }

        query +=
            ` 
            order by r.similarity_score desc
            limit $${index++} offset $${index++}
            `;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await this.replicaPool.query(query, values);
        return rows;
    }

    static async getSearchedJobs(filters, limit = pagination_limit) {
        const values = [filters.word];
        let index = 2;
        let query =
            `
            select j.title, c.name as "companyName", c.rating as "companyRating", j.country, j.city, j.created_at as "createdAt", similarity($1, j.title) as sim
            from job j
            join company c on j.company_id = c.id
            ${filters.industry ? 'join industry i on j.industry_id = i.id' : ''}
            where similarity($1, j.title) >= 0.2
            `;

        if (filters.country) {
            query += ` and j.country = $${index++}`;
            values.push(filters.country);
        }
        if (filters.city) {
            query += ` and j.city = $${index++}`;
            values.push(filters.city);
        }
        if (filters.remote) {
            query += ` and j.remote = true`;
        }
        if (filters.industry) {
            query += ` and i.name = $${index++}`;
            values.push(filters.industry);
        }
        if (filters.companyRating) {
            query += ` and c.rating >= $${index++} and c.rating < $${index++}`;
            values.push(filters.companyRating, filters.companyRating + 1);
        }
        if (filters.fromDate) {
            query += ` and j.created_at between $${index++} and $${index++}`;
            values.push(filters.fromDate, filters.toDate);
        }

        query +=
            ` 
            order by similarity($1, j.title) desc
            limit $${index++} offset $${index++}
            `;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await this.replicaPool.query(query, values);
        return rows;
    }
}

module.exports = Job;