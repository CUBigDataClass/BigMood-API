import express from 'express';
import trendsController from './controllers/trendsController';
const app = express();

app.use('/trends', trendsController);

module.exports = app;
