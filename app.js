import express from 'express';
import trendsController from './controllers/trendsController';
import cors from 'cors';

const app = express();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/bigmoodapi', trendsController);

module.exports = app;
