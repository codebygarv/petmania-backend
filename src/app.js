const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const connectionToMongoDb = require('./database/connection')
connectionToMongoDb();

app.get('/', (req, res) => {
    res.send('Hello World');
});

module.exports = app;