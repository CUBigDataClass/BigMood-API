import { app } from './app';
import { getTrendingLocationsJob, getTrendsJob } from './cronGetTrends';
import { logger } from './service/LoggerService';

const port = process.env.PORT || 3000;

const server = app.listen(port, '0.0.0.0', function() {
  logger.info('Server running on port: ' + port);
});

try {
  getTrendingLocationsJob.start();
  getTrendsJob.start();
} catch (error) {
  logger.error('Failed to start cron job. Error: ' + error);
}
