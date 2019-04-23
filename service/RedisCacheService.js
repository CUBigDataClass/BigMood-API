import RedisClient from '../clients/RedisClient';
import { app } from '../app';
import { logger } from './LoggerService';

const getTrendingTopicsFromRedis = cacheKey => {
  logger.info('RedisCacheService: getTrendingTopicsFromRedis');
  return new Promise((resolve, reject) => {
    try {
      logger.info('CALLING : RedisClient.client.get');
      RedisClient.client.get(cacheKey, function(error, result) {
        if (error || !result) {
          logger.error(
            'Failed to get result from redis Error: ' +
              error +
              ' Response:' +
              result
          );
          reject(error);
        } else {
          logger.info('Result from redis cache' + result);
          resolve(result);
        }
      });
    } catch (error) {
      logger.error(
        'RedisCacheService: getTrendingTopicsFromRedis: Error occured: ' + error
      );
      reject(error);
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
            logger.error('Failed to update redis cache: ' + error);
            reject(error);
          }
          resolve(result);
        }
      );
    } catch (error) {
      logger.error('Error occured: ' + error);
    }
  });
};

// Create key for a object to be inserted based on locationType
const createKeyForLocation = value => {
  if (value.locationType == 'Country') {
    return 'trend-' + value.locationType + '-' + value.country;
  } else if (value.locationType == 'City') {
    return (
      'trend-' + value.locationType + '-' + value.country + '-' + value.city
    );
  }
};

//
const insertTrendLocationWise = value => {
  return new Promise((resolve, reject) => {
    const key = createKeyForLocation(value);
    value = JSON.stringify(value);
    RedisClient.client.set(key, value, (err, res) => {
      if (err) {
        logger.error('Failed to update the redis cache: ' + err);
        reject(err);
      }
      resolve(res);
    });
  });
};

const insertAllTrendsLocationWise = trends => {
  trends.forEach(element => {
    insertTrendLocationWise(element).then(
      res => {
        logger.info('Successfully posted new trends from Kafka to Redis', res);
      },
      err => {
        logger.error(
          'Error while posting new trends from Kafka topic to Redis:',
          err
        );
      }
    );
  });
};

// Find all keys matching a given pattern
const getAllKeys = pattern => {
  return new Promise((resolve, reject) => {
    RedisClient.client.keys(pattern, (err, res) => {
      if (err) {
        logger.error('Failed to get keys matching pattern: ' + err);
        reject(err);
      }
      resolve(res);
    });
  });
};

// Gets alls trends by finding all the keys in redis that start with 'trend'
const getAllTrends = () => {
  return new Promise((resolve, reject) => {
    getAllKeys('trend*').then(
      keys => {
        if (!keys) {
          logger.error(
            'No keys returned by Redis for trends. No data cached to Redis'
          );
          reject(new Error('No keys returned by Redis with trend in key'));
        }
        const result = [];
        RedisClient.client.mget(keys, (err, res) => {
          if (err) {
            logger.error('Error in getting value for key:' + err);
            reject(err)
          } else {
            const trends = [];
            res.forEach(item => {
              trends.push(JSON.parse(item));
            });
            resolve(trends);
          }
        });
      },
      err => {
        reject(err);
      }
    );
  });
};

module.exports = {
  cacheTrendsInRedis,
  getTrendingTopicsFromRedis,
  insertAllTrendsLocationWise,
  getAllTrends
};
