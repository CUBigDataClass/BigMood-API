import express from 'express';
import trendsController from './controllers/trendsController';
import cors from 'cors';
import Logstash from 'logstash-client';
import logstashConfig from './config/LogstashConfig';

const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

const logger = Logstash({
  type: logstashConfig.type,
  host: logstashConfig.host,
  port: logstashConfig.port
});
logger.send('Ryan meessage if you receive this - NODE - server starting.');
app.use('/bigmoodapi', trendsController);

module.exports.app = app;
module.exports.logger = logger;
