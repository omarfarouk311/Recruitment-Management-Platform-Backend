console.log = () => { };
process.env.TZ = 'UTC';
const express = require('express');
const { port } = require('../config/config');
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
const cvRoutes = require('./features/cvs/cvRoutes');
const authRoutes = require('./features/auth/authRoutes');
const skillsRoutes = require('./features/skills/skillsRoutes');
const { authenticateUser } = require('./features/auth/authController');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const app = express();

minioConnect();

app.use(helmet());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use(authenticateUser); // authenticates the user for all the routes below it

app.use('/api/cvs', cvRoutes); // parses the cv when the user uploads it
app.use('/api/assessments', assessmentRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/recruitment_processes', recruitment_processRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/seekers', seekerRoutes);
app.use('/api/industries', industryRoutes);
app.use('/api/skills', skillsRoutes);


// error handling
app.use(notFound);
app.use(errorHandlingMiddleware);

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});