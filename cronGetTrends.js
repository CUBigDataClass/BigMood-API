import cron from 'cron';
import twitterClient from './clients/twitterClient';
import util from 'util';
import request from 'request';
import serverConfig from './config/ServerConfig';

const CronJob = cron.CronJob;
const locationType = {
  1: 'Country',
  2: 'City'
};

// Run this Cron Job every 2 hours
const job = new CronJob('* 0/5 * * * *', () => {
  getCountryWoeids.then(result => {
    result = result.slice(1, 70)
    console.log('Getting trending hashtags country and city wise');
    let i,
      j,
      temparray,
      jobs = [],
      chunk = 15,
      time = 0,
      cronString = '';
    for (i = 0, j = result.length; i < j; i += chunk) {
      temparray = result.slice(i, i + chunk);
      // Run this every 15 minutes
      time += 1
      if (time <= 60) {
        cronString = '* ' + String(time) + ' * * * *';
      } else {
        cronString = '* ' + String(time % 60) + ' ' + String(time / 60) + '* * *';
      }
      jobs.push(
        new CronJob(cronString, () => {
          // getTrendsByCountry(temparray);
          console.log('Printing time in minutes: ' + String(time))
          console.log(temparray);
        })
      );
    }
    // console.log(jobs)
    jobs.forEach(job => {
      job.start();
    });
    // getTrendsByCountry(result);
  });
});

// Returns object with this format [{ country: 'United States', woeid: 23424977, countryCode: 'US' }]
const getCountryWoeids = new Promise((resolve, reject) => {
  twitterClient.get('trends/available', (error, availableWoeids, response) => {
    if (error) {
      console.log('Error: ' + error);
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
    const uniqueWoeids = {};
    const distinctCountries = [];
    availableCountries.forEach(element => {
      if (!uniqueWoeids[element.woeid]) {
        distinctCountries.push(element);
        uniqueWoeids[element.woeid] = true;
      }
    });
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
    places = availableCities.concat(distinctCountries);
    resolve(places);
  });
});

const getTrendsByCountry = countryWoeids => {
  Promise.all(
    countryWoeids.map(item =>
      twitterClient
        .get('trends/place.json', { id: item.woeid })
        .then(result => getTrendingHashTag(result[0].trends, 1, item))
        .catch(error => console.log(error))
    )
  ).then(data => {
    // POST the data to sentiment analyser
    const options = {
      uri: 'http://' + serverConfig.hostname + serverConfig.endpoint,
      json: { trends: data },
      method: 'POST'
    };
    request(options, (err, res, body) => {
      if (err) {
        console.log(err);
      }
    });
    console.log(util.inspect(data, false, null, true /* enable colors */));
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
      rank: null
    };
    return newObj;
  });
  filteredTrends.forEach((item, index) => (item['rank'] = index + 1));
  const mergedObj = { ...countryWoeid, twitterTrendInfo: filteredTrends };
  return mergedObj;
};
module.exports = job;
