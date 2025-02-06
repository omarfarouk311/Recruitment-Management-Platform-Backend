process.env.TZ = 'UTC';
const express = require('express');
const { port } = require('../config/config');
const { errorHandlingMiddleware, notFound } = require('./common/errorMiddleware');
const minioConnect = require('../config/MinIO');
const candidateRoutes = require('./features/candidates/candidateRoutes');
const reviewRoutes = require('./features/reviews/reviewRoutes');
const logRoutes = require('./features/logs/logRoutes');
const companyRoutes = require('./features/companies/companyRoutes');
const recruitment_processRoutes = require('./features/recruitment_process/recruitment_processRoute');
const assessmentRoutes = require('./features/assessments/assessmentRoutes');
const app = express();

minioConnect();

app.use(express.json());

app.use('/assessments', assessmentRoutes)
app.use('/company', recruitment_processRoutes);
app.use('/candidates', candidateRoutes);
app.use('/reviews', reviewRoutes);
app.use('/logs', logRoutes);
app.use('/companies', companyRoutes);

app.use(notFound);
app.use(errorHandlingMiddleware);

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});