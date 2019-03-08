import cron from 'cron';
import twitterClient from './clients/twitterClient';
import util from 'util';

const CronJob = cron.CronJob;
const job = new CronJob('0 * * * * *', () => {
  getCountryWoeids.then(result => {
    getTrendsByCountry(result.slice(1, 10));
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
        countryCode: loc.countryCode
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
    resolve(distinctCountries);
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
     // POST the data
    console.log(util.inspect(data, false, null, true /* enable colors */))
  });
};

const getTrendingHashTag = (trends, numOfTrends, countryWoeid) => {
  let filteredTrends = trends.filter(trend => trend.tweet_volume != null);
  filteredTrends.sort((a, b) => b.tweet_volume - a.tweet_volume);
  filteredTrends = filteredTrends.slice(0, numOfTrends);
  let mergedObj = { ...countryWoeid, trends: filteredTrends };
  return mergedObj;
};
module.exports = job;
