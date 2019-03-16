import express from 'express';
import trendsController from './controllers/trendsController';
import cors from 'cors';

const app = express();
app.use(cors)

app.use('/bigmoodapi', trendsController);

module.exports = app;
