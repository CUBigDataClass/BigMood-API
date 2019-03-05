import serverConfig from './config/serverConfig.js'
import Request from 'request';

const redisService = require('./RedisCacheService.js')

const requestHeader = {
    url:serverConfig.endpoint,
    header:{
        'User-Agent': 'request'
    }
};

function getTrendingTopics(){
    return new Promise(function(resolve,reject){
        Request.get(requestHeader, (error, response, body) => {
            if(error) {
                console.debug(error);
                reject(error)
            }else{
                console.debug(response);
                resolve(response)
            }
        });
    })
}

/*
Assuming that redis stores the recent trends as a list 
*/

function getTrends(request, response){

    //look into the cache. If available then returns, 
    //otherwise calls the getTrendingTopics, return result and then cache it.
    redisService.getTrendingTopicsFromRedis().then(
        (redisResponse)=>{
            response.status(200).send(serviceResponse)
        },
        (redisGetFailure) =>{
            console.log("Failed from to get from redis:"+ redisGetFailure );
            getTrendingTopics().then(
                (serviceResponse) =>{
                    response.status(200).send(serviceResponse)
                    redisService.cacheTrendsInRedis(serviceResponse).then(()=>{
                        console.log("Cached successfully in redis")
                    },
                    (redisPutFailure)=>{
                        console.log("Failed to put in redis.:" + redisPutFailure)
                    })
                }
            )
        }
    );

}


module.exports = getTrends

