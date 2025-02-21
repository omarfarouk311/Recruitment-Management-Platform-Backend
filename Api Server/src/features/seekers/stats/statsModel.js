const { getReadPool } = require('../../../../config/db');
const { phase_types } = require('../../../../config/config');

class Stats {
    static async getStats(seekerId) {
        const pool = getReadPool();
        const values = [seekerId];
        const query =
            `
            select count(*) as "JobsAppliedFor",
            count(*) filter (where p.name = '${phase_types.job_offer}'  ) as "jobOffers",
            count(*) filter (where p.name = '${phase_types.assessment}') as "assessments",
            count(*) filter (where p.name = '${phase_types.interview}') as "upcomingInterviews"
            from Candidates c
            join Recruitment_Phase r on c.recruitment_process_id = r.recruitment_process_id and c.phase = r.phase_num
            join Phase_Type p on r.type = p.id
            where c.seeker_id = $1 and p.name != '${phase_types.cv_screening}'
            `;

        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = Stats;