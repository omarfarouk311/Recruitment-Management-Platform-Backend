process.env.TZ = 'UTC';
const express = require('express');
const { port } = require('../config/config');
const candidateRoutes = require('./features/candidates/candidateRoutes');

const app = express();

app.use('/candidates', candidateRoutes);

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});