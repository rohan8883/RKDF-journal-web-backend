import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectionString from './config/connection.js';
import rootRouter from './routes/index.js';
import cron from 'node-cron';
// import { updateExpiredSubscriptionStatus } from './controller/SubscriptionController.js';
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

// body parser
app.use(bodyParser.json());

const { PORT, DATABASE_URL } = process.env;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// db connection
connectionString(DATABASE_URL);
// db connection end

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.static(path.join(__dirname, '/uploads/profile/')));
app.use(express.static(path.join(__dirname, '/uploads/transaction/')));
// routes
app.use('/api', rootRouter);
// routes end
app.use('/checker', (req, res) => {
  res.status(200).send('Server is running');
});

// nightly cron job to update expired subscription status 1 hours
// cron.schedule('0 0 * * *', async () => {
//   await updateExpiredSubscriptionStatus();
// });

// 1 hours
// cron.schedule('0 */1 * * *', async () => {
//   await updateExpiredSubscriptionStatus();
// });

// 1 minutes
// cron.schedule('*/1 * * * *', async () => {
//   await updateExpiredSubscriptionStatus();
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
