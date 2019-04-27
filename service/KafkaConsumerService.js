import { insertAllTrendsLocationWise } from './RedisCacheService';
import kafka from 'kafka-node';
import { logger } from './LoggerService';
import serverConfig from '../config/ServerConfig';
import wsserver from '../server';
import WebSocket from 'ws';

let options = {
  fromOffset: serverConfig.kafkaFromOffset
};
const kafkaHost = serverConfig.kafkaHostname + ':' + serverConfig.kafkaPort;
const consumerClient = new kafka.KafkaClient({ kafkaHost: kafkaHost });
const consumerClient2 = new kafka.KafkaClient({ kafkaHost: kafkaHost });
const kafkaTopic = 'trendSentiment';
const countryTweetsTopic = 'country_trends_tweets';

const trendSentimentConsumer = new kafka.Consumer(
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
  trendSentimentConsumer.on('message', message => {
    const trends = JSON.parse(message.value);
    logger.info('Successfully received trends from Kafka topic');
    if (trends) {
      insertAllTrendsLocationWise(trends);
    } else {
      logger.error('There was a problem while inserting Trends into Redis');
    }
  });
  trendSentimentConsumer.on('error', err => {
    logger.error('Error occured with Kafka consumer:', err);
  });
};

const trendTweetsConsumer = new kafka.Consumer(
  consumerClient2,
  [{ topic: countryTweetsTopic, partition: 0, fromOffset: -1 }],
  [
    {
      autoCommit: false
    },
    (options = {
      fromOffset: 'latest'
    })
  ]
);

const consumeTrendsTweetsFromKafka = () => {
  trendTweetsConsumer.on('message', message => {
    const trends = JSON.parse(message.value);
    logger.info('[Country] Received trending tweets from Kafka topic');
    if (trends) {
      logger.info('[Country] Broadcasting to all connected clients.');
      try {
        trends.forEach(trend => {
          broadcast(wsserver, trend);
        });
      } catch (error) {
        logger.error(
          'Some error happened in broadcasing over the websocket:' + error
        );
      }
    } else {
      logger.info('[Country]- Something wrong.');
    }
  });
  trendTweetsConsumer.on('error', function(err) {
    logger.error('[Country]- Error consuming: ', err);
  });
};

const broadcast = (wss, data) => {
  if (wss.wsserver.clients) {
    wss.wsserver.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  } else {
    logger.info('No connected clients.');
  }
};

module.exports = { consumeTrendsFromKafka, consumeTrendsTweetsFromKafka };
