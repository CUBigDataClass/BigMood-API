import express from 'express';
import bodyParser from 'body-parser';

import TrendsService from '../service/TrendsService';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/trends', (request, response) => {
  try {
    console.log(TrendsService);
    TrendsService.getTrends(request, response);
  } catch (error) {
    console.log('Error calling trends service: ' + error);
    response.status(500).send();
  }
});
module.exports = router;
