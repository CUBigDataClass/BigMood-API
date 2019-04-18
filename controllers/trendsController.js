import express from 'express';
import bodyParser from 'body-parser';
import TrendsService from '../service/TrendsService';
import { logger } from '../service/LoggerService';
import moment from 'moment';

const fmt = 'YYYY-MM-DD HH:MM:ss';
const redis_fmt = 'YYYY-MM-DD-HH';

const TRENDS_TOPIC_KEY = 'trendingtopics';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/trends', (request, response) => {
  try {
    logger.info('Trends controller');
    const start = request.query.startDate;
    const end = request.query.endDate;
    if (start === undefined && end === undefined) {
      let start = moment()
        .utc()
        .subtract(1, 'days')
        .format(fmt);
      let end = moment()
        .utc()
        .format(fmt);
      logger.info('Start time not defined. Set to : ' + start);
      logger.info('End time not defined. Set to : ' + end);
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
      logger.info('Redis cache key is set to : ' + REDIS_KEY);
      TrendsService.getTrends(request, response, REDIS_KEY, start, end);
    } else {
      if (start === undefined || end === undefined) {
        response
          .status(400)
          .send('Invalid request, must provide a start and endtime');
      } else {
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
        logger.info('Redis cache key is set to : ' + REDIS_KEY);
        TrendsService.getTrends(request, response, REDIS_KEY, start, end);
      }
    }
  } catch (error) {
    logger.error('Error calling trends service: ' + error);
    response.status(500).send();
  }
});

module.exports = router;
