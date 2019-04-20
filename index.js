const express = require('express');
const dbHelper = require('./lib/dbHelper');

const app =express();

app.use(express.static('views'))

app.listen('3000')