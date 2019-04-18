import { app, logger } from './app';

import { getTrendingLocationsJob, getTrendsJob } from './cronGetTrends';

const port = process.env.PORT || 3000;

const server = app.listen(port, '0.0.0.0', function() {
  console.log('Express server started on port ');
  logger.send('Hi from express server at port: ' + port);
});

try {
  getTrendingLocationsJob.start();
  getTrendsJob.start();
} catch (error) {
  console.log('failed to start cron job Error: ' + error);
}
