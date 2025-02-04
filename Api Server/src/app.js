process.env.TZ = 'UTC';
const express = require('express');
const { port } = require('../config/config');
const candidateRoutes = require('./features/candidates/candidateRoutes');
const reviewRoutes = require('./features/reviews/reviewRoutes');

const app = express();

app.use(express.json());

app.use('/candidates', candidateRoutes);
app.use('/reviews', reviewRoutes);

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});