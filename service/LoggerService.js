import logstashConfig from '../config/LogstashConfig';
import winston from 'winston';

const logger = new winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.Http({
      port: logstashConfig.port,
      host: logstashConfig.host,
    })
  ]
});
logger.info('Checking LogStash!')

module.exports = { logger };