import serverConfig from '../config/ServerConfig';
import Request from 'request';

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
  return new Promise((resolve, reject) => {
    requestHeader.qs.startDate = start;
    requestHeader.qs.endDate = end;
    Request.get(requestHeader, (error, response, body) => {
      if (error) {
        console.debug('Failed to get response from python service: ' + error);
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
  console.log('Trends service : ' + cacheKey, st, end);
  RedisCacheService.getTrendingTopicsFromRedis(cacheKey).then(
    redisResponse => {
      response.setHeader('Content-Type', 'application/json');
      response.status(200).send(redisResponse);
    },
    redisGetFailure => {
      console.log('Failed from to get from redis: ' + redisGetFailure);
      getTrendingTopics(st, end).then(
        serviceResponse => {
          const jsonObj = JSON.parse(serviceResponse.body);
          console.log('Got a response from python service: ');
          response.status(200).send(jsonObj);
          RedisCacheService.cacheTrendsInRedis(
            cacheKey,
            JSON.stringify(jsonObj)
          ).then(
            redisResponse => {
              console.log('Cached successfully in redis. Response');
            },
            redisPutFailure => {
              console.log('Failed to put in redis.:' + redisPutFailure);
              // No need to send anything to client. just log it.
            }
          );
        },
        serviceFailure => {
          console.log('Sending failure to client.');
          response.status(500).send();
        }
      );
    }
  );
};

module.exports.getTrends = getTrends;
