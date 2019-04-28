import { app } from './app';
import { getTrendingLocationsJob, getTrendsJob, getGlobalTrendsJob } from './cronGetTrends';
import { logger } from './service/LoggerService';
import { consumeTrendsFromKafka } from './service/KafkaConsumerService';

const port = process.env.PORT || 3000;

const server = app.listen(port, '0.0.0.0', function() {
  logger.info('Server running on port: ' + port);
});

try {
  logger.info("Starting kafka consumer")
  consumeTrendsFromKafka();
} catch(error) {
  logger.error('Failed to consume messages from kafka' + error)
}

try {
  getTrendingLocationsJob.start();
  getTrendsJob.start();
  getGlobalTrendsJob.start();
} catch (error) {
  logger.error('Failed to start cron job. Error: ' + error);
}
