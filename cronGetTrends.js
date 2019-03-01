import cron from 'cron';
import twitterClient from './twitterClient';

const CronJob = cron.CronJob;
const job = new CronJob('0 */1 * * * *', () => {
	getCountryWoeids.then(result => {
		console.log(result)
	});
	const d = new Date();
  	console.log('Every one minute:', d);
});

const getCountryWoeids = new Promise((resolve, reject) => {
	twitterClient.get('trends/available', (error, availableWoeids, response) => {
		if (error) throw error;
		const availableCountries = availableWoeids.map(loc => {
		  const newObj = {
			country: loc.country,
			woeid: loc.parentid,
			countryCode: loc.countryCode
		  };
		  return newObj;
		});
		const uniqueWoeids = {}
		const distinctCountries = []
		availableCountries.forEach(element => {
			if (!uniqueWoeids[element.woeid]) {
				distinctCountries.push(element)
				uniqueWoeids[element.woeid] = true
			}		
		});
		resolve(distinctCountries)
		reject(error)
	  });
});

module.exports = job;
