import redisClient from './clients/redisClient.js'

const TRENDS_TOPIC_KEY = 'trendingtopics'

function getTrendingTopicsFromRedis(){
    return new Promise((resolve,reject) =>{
        try {
            redisClient.get(TRENDS_TOPIC_KEY, function (error, result) {
                if (error) {
                    console.log(error);
                    reject(error);
                }else{
                    console.debug('Result from redis cache' + result);
                    resolve(result)
                }
            });
        } catch (error) {
            console.debug("some error happened: "+error)
        }
    });
}

function cacheTrendsInRedis(topic){
    return new Promise((resolve, reject) => {
        try {
            redisClient.put(TRENDS_TOPIC_KEY, topic, (error,result)=>{
                if(error){
                    console.debug("Failed to update redis cache: " + error);
                    reject(error);
                }
                resolve(result)
            });
        } catch (error) {
            console.debug("some error happened: "+error);
        }
    });
}

module.exports ={
    cacheTrendsInRedis,
    getTrendingTopicsFromRedis
}

