import app from './app';

const port = process.env.PORT || 3000;

const server = app.listen(port, function() {
  console.log('Express server started on port ' + port);
});
