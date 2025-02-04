const { getReadPool } = require('../../../config/db');

class Company {
    constructor({ id, overview, type, foundedIn, size, rating, name }) {
        this.id = id;
        this.overview = overview;
        this.type = type;
        this.founded_in = founded_in;
        this.size = size;
        this.rating = rating;
        this.name = name;
    }

    static async getCompanyData(companyId) {
        const pool = getReadPool();
        const values = [companyId];
        let index = 1;

        let query =
            `
            with jobs_count as (
                select company_id as id, count(id)::int as job_count
                from job
                where company_id = $${index}
                group by company_id
            ),
            reviews_count as (
                select company_id as id, count(id)::int as review_count
                from reviews
                where company_id = $${index}
                group by company_id
            ),
            industries_count as (
                select company_id as id, count(company_id)::int as industry_count
                from Company_Industry
                where company_id = $${index}
                group by company_id
            ),
            locations_count as (
                select company_id as id, count(company_id)::int as location_count
                from Company_Location
                where company_id = $${index}
                group by company_id
            )
            
            select id, c.overview,
            case 
                when c.type = true then 'public'
                else 'private'
            end as type,
            c.founded_in as "foundedIn", c.size, c.rating, c.name,
            coalesce(j.job_count, 0) as "jobsCount",
            coalesce(r.review_count, 0) as "reviewsCount",
            coalesce(i.industry_count, 0) as "industriesCount",
            coalesce(l.location_count, 0) as "locationsCount"
            from company c
            left join jobs_count j using(id)
            left join reviews_count r using(id)
            left join industries_count i using(id)
            left join locations_count l using(id)
            where id = $${index}
            `;

        const { rows } = await pool.query(query, values);
        return rows;
    }

    static async getCompanyLocations(companyId) {
        const pool = getReadPool();
        const values = [companyId];
        let index = 1;

        let query =
            `
            select country, city
            from Company_Location
            where company_id = $${index}
            `;

        const { rows } = await pool.query(query, values)
        return rows
    }

    static async getCompanyIndustries(companyId) {
        const pool = getReadPool();
        const values = [companyId];
        let index = 1;

        let query =
            `
            select i.name as industry
            from Company_Industry c
            join industry i on c.industry_id = i.id
            where company_id = $${index}
            `;

        const { rows } = await pool.query(query, values)
        return rows
    }
}

module.exports = Company;