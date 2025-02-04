process.env.TZ = 'UTC';
const express = require('express');
const { port } = require('../config/config');
const reviewRoutes = require('./features/reviews/reviewRoutes');
const logRoutes = require('./features/logs/logRoutes');
const { errorHandlingMiddleware, notFound } = require('./common/errorMiddleware');

const app = express();

app.use('/reviews', reviewRoutes);

app.use('/logs', logRoutes);

app.use(notFound);

app.use(errorHandlingMiddleware);

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});