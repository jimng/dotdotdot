import express from 'express';
import moment from 'moment-timezone';

const router = express.Router();

const timeZone = 'Asia/Hong_Kong';

router.post('/', (req, res, next) => {
    const currentTime = moment().tz(timeZone).format('MM/DD/YYYY h:mm:ss a');

    req.reply = `The current time is ${currentTime}`;
    res.json({ ok: true });
    next();
});

module.exports = router;
