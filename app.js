import express from 'express';
import trendsController from './controllers/trendsController';
import cors from 'cors';
import Logstash from 'logstash-client'
import logstashConfig from './config/LogstashConfig';

const expressApp = express();
expressApp.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


const logger = Logstash({
    type:logstashConfig.type,
    host:logstashConfig.host,
    port:logstashConfig.port
}
);

expressApp.use('/bigmoodapi', trendsController);

module.exports = {expressApp , logger}
