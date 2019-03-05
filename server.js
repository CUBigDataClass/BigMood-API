import app from './app';
<<<<<<< HEAD
=======
import config from './config';
import job from './cronGetTrends';
>>>>>>> master

const port = process.env.PORT || 3000;

const server = app.listen(port, function() {
  console.log('Express server started on port ' + port);
});

job.start();
