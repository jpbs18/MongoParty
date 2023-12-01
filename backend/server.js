const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const partyRouter = require('./routes/partyRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use('/api/users', authMiddleware);
app.use('/api/party', authMiddleware);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/party', partyRouter);

mongoose.connect(
  `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.jzgawnz.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.listen(3000, () => {
  console.log(`Server listening on port 3000...`);
});
