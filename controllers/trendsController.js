import express from 'express';
import bodyParser from 'body-parser';
import { getAllTrends, getGlobalTrends } from '../service/RedisCacheService';
import { logger } from '../service/LoggerService';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// TO DO: If no data in Redis, call Sentiment Analyser endpoint
router.get('/trends', (request, response) => {
  getAllTrends().then(
    result => {
      response.setHeader('Content-Type', 'application/json');
      response.status(200).send(result);
    },
    err => {
      logger.error('Error in fetching trends from Redis');
      response.status(500).send();
    }
  );
});

router.get('/globaltrends', (request, response) => {
  getGlobalTrends().then(
    result => {
      response.setHeader('Content-Type', 'application/json');
      response.status(200).send(result);
    },
    err => {
      logger.error('Error in fetching global trends from Redis');
      response.status(500).send();
    }
  );
});

module.exports = router;
