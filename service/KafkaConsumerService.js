import { insertAllTrendsLocationWise } from './RedisCacheService';
import kafka from 'kafka-node';
import { logger } from './LoggerService';
import serverConfig from '../config/ServerConfig';

let options = {
  fromOffset: serverConfig.kafkaFromOffset
};
const kafkaHost = serverConfig.kafkaHostname + ':' + serverConfig.kafkaPort;
const consumerClient = new kafka.KafkaClient({ kafkaHost: kafkaHost });
const kafkaTopic = 'trendSentiment';

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
    logger.info('Successfully received trends from Kafka topic');
    if (trends) {
      insertAllTrendsLocationWise(trends);
    } else {
      logger.error('There was a problem while inserting Trends into Redis');
    }
  });
  consumer.on('error', (err) => {
    logger.error('Error occured with Kafka consumer:', err);
  });
};
module.exports = { consumeTrendsFromKafka };
