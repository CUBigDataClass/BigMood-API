import app from './app';
import {getTrendingLocationsJob, getTrendsJob} from './cronGetTrends';

const port = process.env.PORT || 3000;

const server = app.expressApp.listen(port, '0.0.0.0', function() {
  console.log('Express server started on port ');
  app.logger.send('Express server started on port ' + port);
});

try{
  getTrendingLocationsJob.start();
  getTrendsJob.start()  
}catch(error){
  console.log("failed to start cron job Error: " + error)
}
