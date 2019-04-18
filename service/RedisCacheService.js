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
        'RedisCacheService: getTrendingTopicsFromRedis: Error occured: ' +
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

module.exports = { cacheTrendsInRedis, getTrendingTopicsFromRedis };
