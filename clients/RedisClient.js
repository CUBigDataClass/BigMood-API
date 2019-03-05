import redis from 'redis';
import redisConfig from '../config/RedisConfig';

const redisExpirationTime = redisConfig.expiration_time;

const client = redis.createClient({
  port: redisConfig.port,
  host: redisConfig.hostname,
  password: redisConfig.redisPassword
});

client.on('error', err => {
  console.log('Error: ' + err);
});

client.on('connect', () => {
  console.log('Redis client connected');
});
module.exports.client = client;
module.exports.cacheExpiration = redisExpirationTime;
