import express from 'express';
import bodyParser from 'body-parser';
import TrendsService from '../service/TrendsService';
import { logger } from '../app';

import moment from 'moment';

const fmt = 'YYYY-MM-DD HH:MM:ss';
const redis_fmt = 'YYYY-MM-DD-HH';

const TRENDS_TOPIC_KEY = 'trendingtopics';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/trends', (request, response) => {
  try {
    console.log('Trends controller -restarted');
    console.log(logger);
    logger.send('Trends controller');
    const start = request.query.startDate;
    const end = request.query.endDate;
    if (start === undefined && end === undefined) {
      var start = moment()
        .utc()
        .subtract(1, 'days')
        .format(fmt);
      var end = moment()
        .utc()
        .format(fmt);
      console.debug('Start time not defined. Set to : ' + start);
      console.debug('End time not defined. Set to : ' + end);
      logger.send('Start time not defined. Set to : ' + start);
      logger.send('End time not defined. Set to : ' + end);
      const REDIS_KEY =
        TRENDS_TOPIC_KEY +
        moment()
          .utc()
          .subtract(1, 'days')
          .format(redis_fmt) +
        '-' +
        moment()
          .utc()
          .format(redis_fmt);
      console.log('Redis cache key is set to : ' + REDIS_KEY);
      TrendsService.getTrends(request, response, REDIS_KEY, start, end);
    } else {
      if (start === undefined || end === undefined) {
        response
          .status(400)
          .send('Invalid request, must provide a start and endtime');
      } else {
        //TODO : Check cache logic here
        const REDIS_KEY =
          TRENDS_TOPIC_KEY +
          moment()
            .utc()
            .subtract(1, 'days')
            .format(redis_fmt) +
          '-' +
          moment()
            .utc()
            .format(redis_fmt);
        console.log('Redis cache key is set to : ' + REDIS_KEY);
        TrendsService.getTrends(request, response, REDIS_KEY, start, end);
      }
    }
  } catch (error) {
    console.log('Error calling trends service: ' + error);
    response.status(500).send();
  }
});

module.exports = router;
