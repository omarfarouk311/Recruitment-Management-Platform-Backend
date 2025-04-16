const { getReadPool } = require('../../../../config/db');
const constants = require('../../../../config/config');


class CompanyModel {
    static async getCompanies(name, type, minSize, maxSize, industry, city, country, rating, offset) {
        const readPool = getReadPool();
        let query = `
            WITH companies as MATERIALIZED (
                SELECT id, name, type, size, rating ${name? ', similarity(company.name, $1) AS similarity' : ''}
                FROM company
                LEFT JOIN company_industry ci ON ci.company_id = company.id
                LEFT JOIN company_location cl ON cl.company_id = company.id
                WHERE 1=1
        `
        let query2 = `
            jobs_count as MATERIALIZED (
                select company_id as id, count(id)::int as job_count
                from job
                where company_id = ANY (SELECT id FROM companies)
                group by company_id
            ),
            reviews_count as MATERIALIZED (
                select company_id as id, count(id)::int as review_count
                from reviews
                where company_id = ANY (SELECT id FROM companies)
                group by company_id
            ),
            industries_count as MATERIALIZED (
                select company_id as id, count(company_id)::int as industry_count
                from Company_Industry
                where company_id = ANY (SELECT id FROM companies)
                group by company_id
            ),
            locations_count as MATERIALIZED (
                select company_id as id, count(company_id)::int as location_count
                from Company_Location
                where company_id = ANY (SELECT id FROM companies)
                group by company_id
            )
            SELECT 
                companies.name, companies.type, companies.size, 
                coalesce(j.job_count, 0) as "jobsCount",
                coalesce(r.review_count, 0) as "reviewsCount",
                coalesce(i.industry_count, 0) as "industriesCount",
                coalesce(l.location_count, 0) as "locationsCount", 
                rating
            FROM companies
            left join jobs_count j using(id)
            left join reviews_count r using(id)
            left join industries_count i using(id)
            left join locations_count l using(id)
            ${name? 'ORDER BY similarity DESC': ''}
        `
        const params = [];
        if (name) {
            query += ` AND similarity(company.name, $${params.length + 1}) > 0.2 `;
            params.push(name);
        }
        if (type) {
            query += ` AND type = $${params.length + 1} `;
            params.push(type);
        }
        if (minSize || maxSize) {
            query += ` AND size < $${params.length + 1} AND size > $${params.length + 2} `;
            params.push(maxSize || 1000000);
            params.push(minSize || 0);
        }
        if (industry) {
            query += ` AND ci.industry_id = $${params.length + 1} `;
            params.push(industry); 
        }
        if (country) {
            query += ` AND cl.country = $${params.length + 1} `;
            params.push(country); 
            
        }
        if (city) {
            query += ` AND cl.city = $${params.length + 1} `;
            params.push(city); 
        }
        if (rating) {
            query += ` AND rating >= $${params.length + 1} `;
            params.push(rating); 
        }
        if (name) {
           query += `ORDER BY similarity DESC`; 
        }
        else {
            query += `ORDER BY company.id`; 
        }
        query += `
                LIMIT ${constants.pagination_limit} OFFSET ${offset}
            ), 
        `;
        query += query2
        const results = await readPool.query(query, params);
        return results.rows;
    }

    static async getCompaniesFilter(userId) {
        const readPool = getReadPool();
        const query = `
            SELECT company.id as id, company.name as name
            FROM candidates
            JOIN job j ON j.id = candidates.job_id
            JOIN company ON j.company_id = company.id
            WHERE candidates.seeker_id = $1;
            `;
        try {

            const { rows } = await readPool.query(query, [userId]);
            if (rows.length === 0) {
                return [];
            }
            return rows;
        }
        catch (error) {
            throw error;
        }
    }
}

module.exports = {
    CompanyModel
};