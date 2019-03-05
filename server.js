import app from './app';
import job from './cronGetTrends';

const port = process.env.PORT || 3000;

const server = app.listen(port, function() {
  console.log('Express server started on port ' + port);
});

job.start();
