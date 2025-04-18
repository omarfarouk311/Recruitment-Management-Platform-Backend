const { getReadPool, getWritePool } = require('../../../config/db');
const { pagination_limit } = require('../../../config/config');

class Company {
    constructor({ id, overview, type, foundedIn, size, name, locations, industriesIds }) {
        this.id = id;
        this.overview = overview;
        this.type = type;
        this.foundedIn = foundedIn;
        this.size = size;
        this.name = name;
        this.locations = locations;
        this.industriesIds = industriesIds;
    }

    static getReplicaPool() {
        return getReadPool();
    }

    static getMasterPool() {
        return getWritePool();
    }

    static async getCompanyData(companyId) {
        const values = [companyId];
        const query =
            `
            with jobs_count as (
                select company_id as id, count(id)::int as job_count
                from job
                where company_id = $1
                group by company_id
            ),
            reviews_count as (
                select company_id as id, count(id)::int as review_count
                from reviews
                where company_id = $1
                group by company_id
            ),
            industries_count as (
                select company_id as id, count(company_id)::int as industry_count
                from Company_Industry
                where company_id = $1
                group by company_id
            ),
            locations_count as (
                select company_id as id, count(company_id)::int as location_count
                from Company_Location
                where company_id = $1
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
            where id = $1
            `;

        const { rows } = await Company.getReplicaPool().query(query, values);
        if (!rows.length) {
            const err = new Error('Company not found while retrieving company data');
            err.msg = 'Company not found';
            err.status = 404;
            throw err;
        }
        return rows;
    }

    static async getCompanyLocations(companyId) {
        const values = [companyId];
        let index = 1;

        let query =
            `
            select country, city
            from Company_Location
            where company_id = $${index}
            `;

        const { rows } = await Company.getReplicaPool().query(query, values);
        return rows
    }

    static async getCompanyIndustries(companyId) {
        const values = [companyId];
        let index = 1;

        let query =
            `
            select c.industry_id as "id", i.name
            from Company_Industry c
            join industry i on c.industry_id = i.id
            where c.company_id = $${index}
            `;

        const { rows } = await Company.getReplicaPool().query(query, values);
        return rows;
    }

    static async getCompanyJobs(companyId, filters, userId, limit = pagination_limit) {
        const values = [companyId];
        let index = 1;

        // only the company is allowed to see its closed jobs
        let query =
            `
            select j.id, j.title, j.country, j.city, j.created_at as "createdAt"
            from job j
            where j.company_id = $${index++} ${userId !== companyId ? 'and j.closed = false' : ''} ${filters.remote ? 'and j.remote = true' : ''}
            `;

        // industry filter
        if (filters.industry) {
            query += ` and j.industry_id = $${index++}`
            values.push(filters.industry);
        }

        // ensure that rows maintain the same order if no sorting filter is applied, because postgres doesn't guarantee it
        if (!Object.keys(filters).includes('sortByDate')) {
            query += ' order by j.id desc';
        }
        else if (filters.sortByDate === 1) {
            query += ' order by j.created_at';
        }
        else if (filters.sortByDate === -1) {
            query += ' order by j.created_at desc';
        }

        //pagination
        query += ` limit $${index++} offset $${index++} `;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await Company.getReplicaPool().query(query, values);
        return rows;
    }

    static async getCompanyJobsFilterBar(companyId, userId) {
        const values = [companyId];
        let index = 1;

        // only the company is allowed to see its closed jobs
        let query =
            `
            select id, title
            from job
            where company_id = $${index++} ${userId !== companyId ? 'and closed = false' : ''}
            `;

        // ensure that rows maintain the same order if no sorting filter is applied, because postgres doesn't guarantee it
        query += ' order by id desc';

        const { rows } = await Company.getReplicaPool().query(query, values);
        return rows;
    }

    async update() {
        const client = await Company.getMasterPool().connect();
        let values = [], index;

        try {
            await client.query('begin');

            // delete current locations and industries
            await client.query('delete from Company_Industry where company_id = $1', [this.id]);
            await client.query('delete from Company_Location where company_id = $1', [this.id]);

            // update company info
            index = 2;
            const updateQuery = `
                update company
                set overview = $${index++}, type = $${index++}, founded_in = $${index++}, size = $${index++}, name = $${index++}
                where id = $1
            `;
            values = [this.id, this.overview, this.type, this.foundedIn, this.size, this.name];
            await client.query(updateQuery, values);

            // insert new industries
            const insertIndustries = `
                insert into Company_Industry (company_id, industry_id)
                values ${this.industriesIds.map((_, i) => `($1, $${i + 2})`).join(',')}
            `;
            values = [this.id, ...this.industriesIds];
            await client.query(insertIndustries, values);

            // insert new locations
            index = 2;
            let insertLocations = `
                insert into Company_Location (company_id, country, city)
                values ${this.locations.map((_) => `($1, $${index++}, $${index++})`).join(',')}
            `;
            values = [this.id, ...this.locations.flatMap(({ country, city }) => [country, city])];
            await client.query(insertLocations, values);

            await client.query('commit');
        }
        catch (err) {
            await client.query('rollback');
            if (err.code === '23503') {
                err.msg = 'one or more of the industries not found';
                err.status = 400;
            }
            throw err;
        }
        finally {
            client.release();
        }
    }

    async create() {
        const client = await Company.getMasterPool().connect();
        let values = [], index;

        try {
            await client.query('begin');

            // insert company info
            const insertProfileInfo = `
            insert into company(id, overview, type, founded_in, size, name, rating)
            values($1, $2, $3, $4, $5, $6, 0)
            `;
            values = [this.id, this.overview, this.type, this.foundedIn, this.size, this.name];
            await client.query(insertProfileInfo, values);

            // insert new industries
            const insertIndustries = `
                insert into Company_Industry (company_id, industry_id)
                values ${this.industriesIds.map((_, i) => `($1, $${i + 2})`).join(',')}
            `;
            values = [this.id, ...this.industriesIds];
            await client.query(insertIndustries, values);

            // insert new locations
            index = 2;
            let insertLocations = `
                insert into Company_Location (company_id, country, city)
                values ${this.locations.map((_) => `($1, $${index++}, $${index++})`).join(',')}
            `;
            values = [this.id, ...this.locations.flatMap(({ country, city }) => [country, city])];
            await client.query(insertLocations, values);

            await client.query('commit');
        }
        catch (err) {
            await client.query('rollback');
            if (err.code === '23503') {
                err.msg = 'one or more of the industries not found';
                err.status = 400;
            }
            else if (err.code === '23505') {
                err.msg = 'company already exists';
                err.status = 409;
            }
            throw err;
        }
        finally {
            client.release();
        }
    }

    static async getCompanyReviews(companyId, filters, limit = pagination_limit) {
        const values = [companyId];
        let index = 1;

        // base query
        let query =
            `
            select id, company_id as "companyId", title, description, rating, role, created_at as "createdAt"
            from reviews
            where company_id = $${index++}
`;

        //specific rating
        if (filters.rating) {
            query += ` and rating = $${index++} `;
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
        query += ` limit $${index++} offset $${index++} `;
        values.push(limit, (filters.page - 1) * limit);

        const { rows } = await Company.getReplicaPool().query(query, values);
        return rows;
    }

}

module.exports = Company;