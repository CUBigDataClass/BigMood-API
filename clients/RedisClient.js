import redis from 'redis';
import redisConfig from '../config/RedisConfig';

//console.log(redisConfig.port,redisConfig.hostname,redisConfig.redisPassword)
const redisExpirationTime = redisConfig.expiration_time;

var client = redis.createClient({
  port: redisConfig.port,
  host: redisConfig.hostname,
  password: redisConfig.redisPassword
});

client.on('error', err => {
  console.log('Error: ' + err);
});

client.on('connect', function() {
  console.log('Redis client connected');
});
module.exports.client = client;
module.exports.cacheExpiration = redisExpirationTime;
