process.env.TZ = 'UTC';
const express = require('express');
const { port } = require('../config/config');
const reviewRoutes = require('./features/reviews/reviewRoutes');
const recruitment_processRoutes = require('./features/recruitment_process/recruitment_processRoute');
const app = express();
app.use(express.json());

app.use('/company', recruitment_processRoutes);
app.use('/reviews', reviewRoutes);

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});