import { app } from './app';
import { getTrendingLocationsJob, getTrendsJob } from './cronGetTrends';
import { logger } from './service/LoggerService';
import {
  consumeTrendsFromKafka,
  consumeTrendsTweetsFromKafka
} from './service/KafkaConsumerService';
import WebSocket from 'ws';

const port = process.env.PORT || 3000;

const server = app.listen(port, '0.0.0.0', function() {
  logger.info('Server running on port: ' + port);
});

try {
  logger.info('Starting kafka consumer');
  consumeTrendsFromKafka();
} catch (error) {
  logger.error('Failed to start consumeTrendsFromKafka from kafka' + error);
}
try {
  logger.info('Starting TrendsTweetsFromKafka consumer');
  consumeTrendsTweetsFromKafka();
} catch (error) {
  logger.error('Failed to start consumeTrendsTweetsFromKafka from kafka' + error);
}

try {
  getTrendingLocationsJob.start();
  getTrendsJob.start();
} catch (error) {
  logger.error('Failed to start cron job. Error: ' + error);
}

const wss = new WebSocket.Server({ port: 34234 });
wss.on('connection', function(ws) {
  ws.send('Connected to server');
  logger.info('connected to client: ' + JSON.stringify(ws._socket.address()));
});

module.exports.wsserver = wss;
