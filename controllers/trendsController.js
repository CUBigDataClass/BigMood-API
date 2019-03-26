import express from 'express';
import bodyParser from 'body-parser';

import TrendsService from '../service/TrendsService';

import moment from 'moment';

const fmt = 'YYYY-MM-DD HH:MM:SS';

const TRENDS_TOPIC_KEY = 'trendingtopics';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/trends', (request, response) => {
  try {
    console.log('Trends controller');
    const start = request.query.startDate;
    const end = request.query.endDate;
    if (start === undefined && end === undefined) {
      TrendsService.getTrends(
        request,
        response,
        TRENDS_TOPIC_KEY,
        moment()
          .utc()
          .subtract(1, 'days')
          .seconds(0)
          .format(fmt),
        moment()
          .utc()
          .seconds(0)
          .format(fmt)
      );
    } else {
      if (start === undefined || end === undefined) {
        response
          .status(400)
          .send('Invalid request, must provide a start and endtime');
      } else {
        //TODO : Check cache logic here
        const REDIS_KEY = TRENDS_TOPIC_KEY + start + '-' + end;
        TrendsService.getTrends(request, response, REDIS_KEY, start, end);
      }
    }
  } catch (error) {
    console.log('Error calling trends service: ' + error);
    response.status(500).send();
  }
});

module.exports = router;
