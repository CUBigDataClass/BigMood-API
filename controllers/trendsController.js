import express from 'express';
import bodyParser from 'body-parser';

import TrendsService from '../service/TrendsService';

import moment from 'moment';

const fmt = 'YYYY-MM-DD HH:MM:SS';

const TRENDS_TOPIC_KEY = 'trendingtopics';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// GET all trends
router.get('/', (req, res) => {
  res.status(200).send([
    {
      hashtag: '#FelizMiercoles',
      tweet_volume: 36103,
      sentiment: 'neutral'
    },
    {
      hashtag: '#wednesdaywisdom',
      tweet_volume: 42916,
      sentiment: 'happy'
    },
    {
      hashtag: 'Tara Palmer-Tomkinson',
      tweet_volume: null,
      sentiment: 'sad'
    }
  ]);
});

router.get('/trends', (request, response) => {
  try {
    console.log('Trends controller');
    const start = request.query.startDate;
    const end = request.query.endDate;
    console.log(start);
    console.log(end);
    if (start === undefined && end === undefined) {
      TrendsService.getTrends(
        request,
        response,
        TRENDS_TOPIC_KEY,
        moment()
          .utc()
          .subtract(1, 'days')
          .format(fmt),
        moment()
          .utc()
          .format(fmt)
      );
    } else {
      if (validateRequest(start, end)) {
        const REDIS_KEY = TRENDS_TOPIC_KEY + start + '-' + end;
        TrendsService.getTrends(request, response, REDIS_KEY, start, end);
      } else {
        response
          .status(400)
          .send('Invalid request, must provide a start and endtime');
      }
    }
  } catch (error) {
    console.log('Error calling trends service: ' + error);
    response.status(500).send();
  }
});

const validateRequest = (start, end) => {
  if (start === undefined || end === undefined) {
    return false;
  }
  return true;
};
module.exports = router;
