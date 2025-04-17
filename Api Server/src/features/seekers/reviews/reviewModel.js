const { getReadPool } = require('../../../../config/db');
const { pagination_limit } = require('../../../../config/config');

class SeekerReview {
    static getReplicaPool() {
        return getReadPool();
    }

    static async getSeekerReviews(seekerId, filters, limit = pagination_limit) {
        const values = [seekerId, limit, (filters.page - 1) * limit];
        const query =
            `
            select r.id, r.company_id as "companyId", c.name as "companyName", r.title, r.description, r.rating, r.role, r.created_at as "createdAt"
            from reviews r
            join company c on r.company_id = c.id
            where creator_id = $1
            order by created_at desc
            limit $2 offset $3
            `;

        const { rows } = await SeekerReview.getReplicaPool().query(query, values);
        return rows;
    }
}

module.exports = SeekerReview;