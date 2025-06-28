import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { connectDB } from './db/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:5173", "https://2-fa-frontend-u19a.vercel.app"],
  credentials: true,
}));

app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);


app.use('/', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
