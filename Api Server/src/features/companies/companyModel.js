const { getReadPool, getWritePool } = require('../../../config/db');

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
        if (!rows.length) {
            const err = new Error('Company not found while retrieving company data');
            err.msg = 'Company not found';
            err.status = 404;
            throw err;
        }
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
            where c.company_id = $${index}
            `;

        const { rows } = await pool.query(query, values)
        return rows
    }

    static async getCompanyJobs(companyId, filters, userRole, limit = 6) {
        const pool = getReadPool();
        const values = [companyId];
        let index = 1;

        // job seeker isn't allowed to see the closed jobs
        let query =
            `
            select j.id, j.company_id as "companyId", j.title, j.country, j.city, j.created_at as "createdAt", c.rating as "companyRating"
            from (
                select id, company_id, title, country, city, created_at, industry_id
                from job
                where company_id = $${index++} ${userRole === 'jobSeeker' ? 'and closed = false' : ''} ${filters.remote ? 'and remote = true' : ''}
            ) j
            join company c on j.company_id = c.id
            `;

        // industry filter
        if (filters.industry) {
            query +=
                ` 
                join (
                    select id, name
                    from industry
                    where name = $${index++}
                ) i on j.industry_id = i.id
                `;
            values.push(filters.industry);
        }

        // ensure that rows maintain the same order if no sorting filter is applied, because postgres doesn't guarantee it
        if (!Object.keys(filters).includes('sortByDate')) {
            query += ' order by j.id desc';
        }
        else {
            if (filters.sortByDate === 1) {
                query += ' order by j.created_at';
            }

            else if (filters.sortByDate === -1) {
                query += ' order by j.created_at desc';
            }
        }

        //pagination
        query += ` limit $${index++} offset $${index++}`;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await pool.query(query, values);
        return rows;
    }

    static async getCompanyJobsSimplified(companyId, filters, userRole, limit = 5) {
        const pool = getReadPool();
        const values = [companyId];
        let index = 1;

        // job seeker isn't allowed to see the closed jobs
        let query =
            `select id, title, country, city, created_at as "createdAt"
            from job
            where company_id = $${index++} ${userRole === 'jobSeeker' ? 'and closed = false' : ''}
            `;

        // ensure that rows maintain the same order if no sorting filter is applied, because postgres doesn't guarantee it
        if (!Object.keys(filters).includes('sortByDate')) {
            query += ' order by id desc';
        }
        else {
            if (filters.sortByDate === 1) {
                query += ' order by created_at';
            }
            else if (filters.sortByDate === -1) {
                query += ' order by created_at desc';
            }
        }

        //pagination
        query += ` limit $${index++} offset $${index++}`;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await pool.query(query, values);
        return rows;
    }

    static async getCompanyJobsFilterBar(companyId, userRole) {
        const pool = getReadPool();
        const values = [companyId];
        let index = 1;

        // job seeker isn't allowed to see the closed jobs
        let query =
            `
            select id, title
            from job
            where company_id = $${index++} ${userRole === 'jobSeeker' ? 'and closed = false' : ''}
            `;

        // ensure that rows maintain the same order if no sorting filter is applied, because postgres doesn't guarantee it
        query += ' order by id desc';

        const { rows } = await pool.query(query, values);
        return rows;
    }

    static async updateCompanyData(companyId, { overview, type, foundedIn, size, name, locations, industries }) {
        const pool = getWritePool();
        const client = await pool.connect();

        try {
            await client.query('begin');

            // delete current locations and industries
            await client.query('delete from Company_Industry where company_id = $1', [companyId]);
            await client.query('delete from Company_Location where company_id = $1', [companyId]);

            // update company info
            let values = [companyId, overview, type, foundedIn, size, name];
            let index = 2;
            const updateQuery =
                `update company
                set overview = $${index++}, type = $${index++}, founded_in = $${index++}, size = $${index++}, name = $${index++}
                where id = $1
                `;
            await client.query(updateQuery, values);

            // insert new industries
            const insertIndustries =
                `
                insert into Company_Industry
                select $1, id
                from industry
                where name = any ($2)
                `;
            const { rowCount } = await client.query(insertIndustries, [companyId, industries]);
            if (rowCount < industries.length) {
                const err = new Error('Invalid industries array');
                err.msg = 'one or more of the industries not found';
                err.status = 400;
                throw err;
            }

            // insert new locations
            values = [companyId];
            index = 2;
            let insertLocations = 'insert into Company_Location (company_id, country, city) values';
            locations.forEach(({ country, city }, i) => {
                insertLocations += `($1, $${index++}, $${index++})` + (i < locations.length - 1 ? ',' : '');
                values.push(country, city);
            });
            await client.query(insertLocations, values);

            await client.query('commit');
        }
        catch (err) {
            await client.query('rollback');
            throw err;
        }
        finally {
            client.release();
        }
    }
}

module.exports = Company;