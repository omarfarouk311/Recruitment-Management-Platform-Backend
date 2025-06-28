const { getReadPool } = require('../../../../config/db');
const { phase_types } = require('../../../../config/config');

class Stats {
    static getReplicaPool() {
        return getReadPool();
    }

    static async getStats(seekerId) {
        const values = [seekerId];
        const query =
            `
            select count(*)::int as "jobsAppliedFor",
            (count(*) filter (where p.name = '${phase_types.job_offer}'))::int as "jobOffers",
            (count(*) filter (where p.name = '${phase_types.assessment}' and c.submited = false and c.phase_deadline > now()))::int as "assessments",
            (count(*) filter (where p.name = '${phase_types.interview}'))::int as "interviews"
            from Candidates c
            join Recruitment_Phase r on c.recruitment_process_id = r.recruitment_process_id and c.phase = r.phase_num
            join Phase_Type p on r.type = p.id
            where c.seeker_id = $1
            `;

        const { rows } = await Stats.getReplicaPool().query(query, values);
        return rows[0];
    }
}

module.exports = Stats;