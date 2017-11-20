import express from 'express';

import TimeRoute from './routes/TimeRoute';

const app = express();

app.use(`/time`, TimeRoute);

app.listen(process.env.PORT || 3000, () => console.log('dotdotdot started'));
