process.env.TZ = 'UTC';
const express = require('express');
const { port } = require('../config/config');
const reviewRoutes = require('./features/reviews/reviewRoutes');

const app = express();

app.use('/reviews', reviewRoutes);

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});