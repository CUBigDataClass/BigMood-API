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
    'User-Agent': 'request'
  }
};

const getTrendingTopics = () => {
  return new Promise(function(resolve, reject) {
    Request.get(requestHeader, (error, response, body) => {
      if (error) {
        console.debug('Failed to get response from python service: ' + error);
        reject(error);
      } else {
        console.debug(response);
        resolve(response);
      }
    });
  });
}

/*
Assuming that redis stores the recent trends as a list 
*/

const getTrends = (request, response) => {
  //look into the cache. If available then returns,
  //otherwise calls the getTrendingTopics, return result and then cache it.
  console.log('Inside trends service');
  RedisCacheService.getTrendingTopicsFromRedis().then(
    redisResponse => {
      response.setHeader("Content-Type", "application/json")
      response.status(200).send(redisResponse);
    },
    redisGetFailure => {
      console.log('Failed from to get from redis: ' + redisGetFailure);
      getTrendingTopics().then(
        serviceResponse => {
          const jsonObj = JSON.parse(serviceResponse.body);
          console.log('Got a response from python service: ' );
          response.status(200).send(jsonObj);
          RedisCacheService.cacheTrendsInRedis(JSON.stringify(jsonObj)).then(
            redisResponse => {
              console.log('Cached successfully in redis. Response');
            },
            redisPutFailure => {
              console.log('Failed to put in redis.:' + redisPutFailure);
              // No need to send anything to client. just log it.
              //response.status(500).send()
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
}

module.exports.getTrends = getTrends;
