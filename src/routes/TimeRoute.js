import express from 'express';
import moment from 'moment-timezone';

const router = express.Router();

const timeZone = 'Asia/Hong_Kong';

router.get('/', (req, res) => {
    const currentTime = moment().tz(timeZone).format('MM/DD/YYYY h:mm:ss a')

    res.send(`The current time is ${currentTime}`);
});

module.exports = router;
