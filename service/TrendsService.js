import serverConfig from '../config/ServerConfig';
import Request from 'request';
import { logger } from './LoggerService';
import RedisCacheService from './RedisCacheService';

const requestHeader = {
  url:
    'http://' +
    serverConfig.hostname +
    ':' +
    serverConfig.port +
    serverConfig.endpoint,
  header: {
    'User-Agent': 'node-js-service'
  },
  qs: {
    startDate: '',
    endDate: ''
  }
};
const getTrendingTopics = (start, end) => {
  logger.info('Get trending topics');
  return new Promise((resolve, reject) => {
    requestHeader.qs.startDate = start;
    requestHeader.qs.endDate = end;
    Request.get(requestHeader, (error, response, body) => {
      if (error) {
        logger.error('Failed to get response from python service: ' + error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

/*
Assuming that redis stores the recent trends as a list 
*/

const getTrends = (request, response, cacheKey, st, end) => {
  // Look into the cache. If available then returns,
  // Otherwise calls the getTrendingTopics, return result and then cache it.
  logger.info('Trends service : ' + cacheKey, st, end);
  RedisCacheService.getTrendingTopicsFromRedis(cacheKey).then(
    redisResponse => {
      response.setHeader('Content-Type', 'application/json');
      response.status(200).send(redisResponse);
    },
    redisGetFailure => {
      logger.send('Failed from to get from redis: ' + redisGetFailure);
      getTrendingTopics(st, end).then(
        serviceResponse => {
          const jsonObj = JSON.parse(serviceResponse.body);
          logger.info(
            'Got a response from python service: ' + JSON.stringify(jsonObj)
          );
          response.status(200).send(jsonObj);
          RedisCacheService.cacheTrendsInRedis(
            cacheKey,
            JSON.stringify(jsonObj)
          ).then(
            redisResponse => {
              logger.info('Cached successfully in redis. Response');
            },
            redisPutFailure => {
              logger.error('Failed to put in redis.:' + redisPutFailure);
              // No need to send anything to client. just log it.
            }
          );
        },
        serviceFailure => {
          logger.info('Sending failure to client.');
          response.status(500).send();
        }
      );
    }
  );
};

module.exports.getTrends = getTrends;
