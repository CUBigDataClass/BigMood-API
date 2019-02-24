import redis from 'redis';
import app from './app';
import config from './config';

const port = process.env.PORT || 3000;
const client = redis.createClient({
  port: 16379,
  host: 'ec2-18-220-103-88.us-east-2.compute.amazonaws.com',
  password: config.redisPassword
});

client.on('error', err => {
  console.log('Error: ' + err);
});

const server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
