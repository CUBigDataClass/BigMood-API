import cron from 'cron';
import twitterClient from './clients/twitterClient';
import util from 'util';
import request from 'request';
import serverConfig from './config/ServerConfig';
import { logger } from './service/LoggerService';
import RedisClient from './clients/RedisClient';

const CronJob = cron.CronJob;
const server_uri =
  'http://' +
  serverConfig.hostname +
  ':' +
  serverConfig.port +
  serverConfig.endpoint;
const locationType = {
  1: 'Country',
  2: 'City'
};

// Initialize queue with trending locations on server start
let queue = [];

// Run this Cron Job every 15 minutes to get trending locations and update trends when the queue is empty
const getTrendingLocationsJob = new CronJob('0 */15 * * * *', () => {
  if (queue.length == 0) {
    getCountryWoeids.then(result => {
      logger.info(
        'Getting trending hashtags country and city wise',
        result.length
      );
      queue = Array.from(result);
    });
  }
});

// Rate limiting : Job to run every 15 minutes making requests to trends api
const getTrendsJob = new CronJob('0 */15 * * * *', () => {
  let trendingLocations = queue.splice(0, 70);
  if (trendingLocations.length) {
    getTrendsByCountry(trendingLocations);
    logger.info(
      'Getting trends for cities and countries. Total number of locations: ' +
        queue.length +
        '. Getting trends for ' +
        trendingLocations.length +
        'locations.'
    );
  }
});

const getGlobalTrendsJob = new CronJob('0 */15 * * * *', () => {
  twitterClient.get(
    'trends/place.json',
    { id: 1 },
    (error, trends, response) => {
      if (error) {
        logger.error('Error while getting global trends: ', error);
      } else {
        const globalTrends = getTrendingHashTag(trends[0].trends, 5, 1);
        const value = JSON.stringify(globalTrends);
        RedisClient.client.set('global-trend', value, (err, res) => {
          if (err) {
            logger.error(
              'Failed to update redis cache with global trends: ' + err
            );
          }
        });
      }
    }
  );
});

// Returns object with this format [{ country: 'United States', woeid: 23424977, countryCode: 'US' }]
const getCountryWoeids = new Promise((resolve, reject) => {
  twitterClient.get('trends/available', (error, availableWoeids, response) => {
    if (error) {
      logger.error('Error in getting available trends: ' + error);
      reject(error);
    }
    const availableCountries = availableWoeids.map(loc => {
      const newObj = {
        country: loc.country,
        woeid: loc.parentid,
        countryCode: loc.countryCode,
        locationType: locationType[1] // Country
      };
      return newObj;
    });
    // Remove first element as that is global trends
    availableCountries.splice(0, 1);
    const uniqueWoeids = {};
    const distinctCountries = [];
    availableCountries.forEach(element => {
      if (!uniqueWoeids[element.woeid]) {
        distinctCountries.push(element);
        uniqueWoeids[element.woeid] = true;
      }
    });
    availableWoeids = availableWoeids.filter(
      item => item.placeType.name == 'Town'
    );
    const availableCities = availableWoeids.map(loc => {
      const newObj = {
        country: loc.country,
        woeid: loc.woeid,
        city: loc.name,
        countryCode: loc.countryCode,
        locationType: locationType[2] // City
      };
      return newObj;
    });
    let places = [];
    places = distinctCountries.concat(availableCities);
    resolve(places);
  });
});

const getTrendsByCountry = countryWoeids => {
  Promise.all(
    countryWoeids.map(item =>
      twitterClient
        .get('trends/place.json', { id: item.woeid })
        .then(result => getTrendingHashTag(result[0].trends, 5, item))
        .catch(error =>
          logger.error('Error in getting trending hashtag from Twitter' + error)
        )
    )
  ).then(result => {
    // POST the data to sentiment analyser
    const options = {
      uri: server_uri,
      json: { trends: result },
      method: 'POST'
    };
    request(options, (err, res, body) => {
      if (err) {
        logger.error('Error in posting data to Sentiment Analyser: ' + err);
      }
      logger.info('Successfully posted data to Sentiment Analyser');
    });
  });
};

const getTrendingHashTag = (trends, numOfTrends, countryWoeid) => {
  let filteredTrends = trends.filter(trend => trend.tweet_volume != null);
  filteredTrends.sort((a, b) => b.tweet_volume - a.tweet_volume);
  filteredTrends = filteredTrends.slice(0, numOfTrends);
  filteredTrends = filteredTrends.map(item => {
    const newObj = {
      name: item.name,
      tweetVolume: item.tweet_volume,
      rank: null,
      url: item.url
    };
    return newObj;
  });
  filteredTrends.forEach((item, index) => (item['rank'] = index + 1));
  const mergedObj = { ...countryWoeid, twitterTrendInfo: filteredTrends };
  return mergedObj;
};

module.exports = { getTrendsJob, getTrendingLocationsJob, getGlobalTrendsJob };
