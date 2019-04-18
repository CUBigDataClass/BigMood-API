import redis from 'redis';
import redisConfig from '../config/RedisConfig';
import { logger } from '../service/LoggerService';

const redisExpirationTime = redisConfig.expiration_time;

const client = redis.createClient({
  port: redisConfig.port,
  host: redisConfig.hostname,
  password: redisConfig.redisPassword
});

client.on('error', err => {
  logger.error('Error: ' + err);
});

client.on('connect', () => {
  logger.info('Redis client connected');
});
module.exports.client = client;
module.exports.cacheExpiration = redisExpirationTime;
