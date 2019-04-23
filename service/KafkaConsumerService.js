import { insertAllTrendsLocationWise } from './RedisCacheService';
import kafka from 'kafka-node';
import { logger } from './LoggerService';
import serverConfig from '../config/ServerConfig';

let options = {
  fromOffset: serverConfig.kafkaFromOffset
};
const kafkaHost = serverConfig.kafkaHostname + ':' + serverConfig.kafkaPort
const consumerClient = new kafka.KafkaClient({kafkaHost : kafkaHost});
const kafkaTopic = 'trendSentiment'

const consumer = new kafka.Consumer(
  consumerClient,
  [{ topic: kafkaTopic, partition: 0, fromOffset: -1 }],
  [
    {
      autoCommit: false
    },
    options = {
      fromOffset: 'latest'
    }
  ]
);

const consumeTrendsFromKafka = () => {
  consumer.on('message', message => {
    const trends = JSON.parse(message.value);
    logger.info('Received trends from Kafka topic');
    if(trends){
      insertAllTrendsLocationWise(trends);
    }else{
      logger.info('Something wrong.');
    }
  });
  consumer.on("error", function(err) {
    logger.error("Error consuming: ", err);
});
};
module.exports = { consumeTrendsFromKafka };
