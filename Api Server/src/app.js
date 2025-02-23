process.env.TZ = 'UTC';
const express = require('express');
const { port, role } = require('../config/config');
const { errorHandlingMiddleware, notFound } = require('./common/errorMiddleware');
const { minioConnect } = require('../config/MinIO');
const candidateRoutes = require('./features/candidates/candidateRoutes');
const reviewRoutes = require('./features/reviews/reviewRoutes');
const logRoutes = require('./features/logs/logRoutes');
const companyRoutes = require('./features/companies/companyRoutes');
const recruitment_processRoutes = require('./features/recruitment_process/recruitment_processRoute');
const assessmentRoutes = require('./features/assessments/assessmentRoutes');
const recruiterRoutes = require('./features/recruiters/recruiterRoutes');
const jobRoutes = require('./features/jobs/jobRoutes')
const invitationRoutes = require('./features/invitations/invitationRoutes');
const interviewRoutes = require('./features/interviews/interviewRoutes')
const templatesRoutes = require('./features/templates/templateRoutes');
const reportRoutes = require('./features/reports/reportRoutes');
const seekerRoutes = require('./features/seekers/seekerRoutes');
const industryRoutes = require('./features/industries/industryRoutes');
const experienceRoutes = require('./features/seekers/experience/experienceRoutes');
const app = express();


minioConnect();

// for testing
app.use((req, res, next) => {
    req.userId = 3;
    req.userRole = role.jobSeeker;
    next();
});

app.use(express.json());

app.use('/assessments', assessmentRoutes);
app.use('/templates', templatesRoutes);
app.use('/jobs', jobRoutes);
app.use('/recruitment_processes', recruitment_processRoutes);
app.use('/candidates', candidateRoutes);
app.use('/reviews', reviewRoutes);
app.use('/recruiters', recruiterRoutes);
app.use('/logs', logRoutes);
app.use('/companies', companyRoutes);
app.use('/interviews', interviewRoutes);
app.use('/invitations', invitationRoutes);
app.use('/reports', reportRoutes);
app.use('/seekers', seekerRoutes);
app.use('/industries', industryRoutes);

app.use(notFound);
app.use(errorHandlingMiddleware);

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});