import { insertAllTrendsLocationWise } from './RedisCacheService';
import kafka from 'kafka-node';
import { builtinModules } from 'module';
import { logger } from './LoggerService';
import util from 'util';

let options = {
  fromOffset: 'latest'
};
const consumerClient = new kafka.KafkaClient('localhost:2181');
const kafkaTopic = 'trendSentiment'

const consumer = new kafka.Consumer(
  consumerClient,
  [{ topic: kafkaTopic, partition: 0, fromOffset: -1 }],
  [
    {
      autoCommit: false
    },
    (options = {
      fromOffset: 'latest'
    })
  ]
);

const consumeTrendsFromKafka = () => {
  consumer.on('message', message => {
    const trends = JSON.parse(message.value);
    logger.info('Received trends from Kafka topic');
    insertAllTrendsLocationWise(trends);
  });
};
module.exports = { consumeTrendsFromKafka };
