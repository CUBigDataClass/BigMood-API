import Twitter from 'twitter';
import config from './config';

const twitterClient = new Twitter({
  consumer_key: config.consumerKey,
  consumer_secret: config.consumerSecret,
  access_token_key: config.accessTokenKey,
  access_token_secret: config.accessTokenSecret
});

module.exports = twitterClient;
