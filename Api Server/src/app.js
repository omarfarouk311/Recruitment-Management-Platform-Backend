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
const { role } = require('../config/config')
const app = express();

minioConnect();

// for testing
app.use((req, res, next) => {
    req.userId = 13;
    req.userRole = role.recruiter;
    next();
})

app.use(express.json());

app.use('/assessments', assessmentRoutes)
app.use('/jobs', jobRoutes)
app.use('/recruitment_processes', recruitment_processRoutes);
app.use('/candidates', candidateRoutes);
app.use('/reviews', reviewRoutes);
app.use('/recruiters', recruiterRoutes)
app.use('/logs', logRoutes);
app.use('/companies', companyRoutes);

app.use(notFound);
app.use(errorHandlingMiddleware);

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});