import express from 'express';
import bodyParser from 'body-parser';

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
module.exports = router;
