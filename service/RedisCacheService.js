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
    return 'trend' + value.locationType + '-' + value.country;
  } else if (value.locationType == 'City') {
    return (
      'trend' + value.locationType + '-' + value.country + '-' + value.country
    );
  }
};

// 
const insertTrendLocationWise = value => {
  return new Promise((resolve, reject) => {
    key = createKeyForLocation(value);
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
    insertTrendLocationWise(element);
  });
};

// Find all keys matching a given pattern
const getAllKeys = pattern => {
  RedisClient.client.keys(pattern, (err, res) => {
    if (err) {
      logger.error('Failed to get keys matching pattern: ' + pattern);
      reject(err);
    }
    resolve(res);
  });
};

// Gets alls trends by finding all the keys in redis that start with 'trend'
const getAllTrends = () => {
  return new Promise((resolve, reject) => {
    const keys = getAllKeys('trend*');
    if (!keys) {
      logger.error('No keys returned by Redis with trend in key')
      reject(new Error('No keys returned by Redis with trend in key'))
    }
    const result = [];
    keys.forEach(key => {
      RedisClient.client.get(key, (err, res) => {
        if (err) {
          logger.error('Error in getting value for key:' + key);
        } else {
          logger.info(res);
          result.push(res);
        }
      });
      resolve(result);
    });
  });
};

module.exports = { cacheTrendsInRedis, getTrendingTopicsFromRedis };
