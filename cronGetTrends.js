import cron from 'cron';
import twitterClient from './clients/twitterClient';

const CronJob = cron.CronJob;
const job = new CronJob('0 */30 * * * *', () => {
  getCountryWoeids.then(result => {
    console.log(result);
  });
});

const getCountryWoeids = new Promise((resolve, reject) => {
  twitterClient.get('trends/available', (error, availableWoeids, response) => {
    if (error) {
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

module.exports = job;
