import express from 'express';
import trendsController from './controllers/trendsController';
const app = express();

app.use('/bigmoodapi', trendsController);

module.exports = app;
