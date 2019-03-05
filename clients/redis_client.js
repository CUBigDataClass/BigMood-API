import redis from 'redis';
import redicConfig from './config/redisConfig.js';

redisClient = redis.createClient({
  port: redicConfig.port,
  host: redicConfig.hostname,
  password: redicConfig.redisPassword
});

redisClient.on('error', err => {
  console.log('Error: ' + err);
});

redisClient.on('connect', function() {
  console.log('Redis client connected');
});
module.exports = redisClient;
