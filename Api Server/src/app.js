process.env.TZ = 'UTC';
const express = require('express');
const { port } = require('../config/config');

const app = express();

app.listen(port, () => {
    console.log(`The server is running and listening on port ${port}`);
});