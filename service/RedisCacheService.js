import RedisClient from '../clients/RedisClient';

const getTrendingTopicsFromRedis = cacheKey => {
  console.log('RedisCacheService: getTrendingTopicsFromRedis');
  return new Promise((resolve, reject) => {
    try {
      console.log('CALLING : RedisClient.client.get');
      RedisClient.client.get(cacheKey, function(error, result) {
        if (error || result == null) {
          console.log(
            'Failed to get result from redis Error: ' +
              error +
              ' Response:' +
              result
          );
          reject(error);
        } else {
          console.log('Result from redis cache' + result);
          resolve(result);
        }
      });
    } catch (error) {
      console.debug(
        'RedisCacheService: getTrendingTopicsFromRedis:some error happened: ' +
          error
      );
    }
  });
};

const cacheTrendsInRedis = (cacheKey, topic) => {
  return new Promise((resolve, reject) => {
    try {
      RedisClient.client.set(
        cacheKey,
        topic,
        'EX',
        RedisClient.cacheExpiration,
        (error, result) => {
          if (error) {
            console.debug('Failed to update redis cache: ' + error);
            reject(error);
          }
          resolve(result);
        }
      );
    } catch (error) {
      console.debug('some error happened: ' + error);
    }
  });
};

module.exports = { cacheTrendsInRedis, getTrendingTopicsFromRedis };
