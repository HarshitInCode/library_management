require("dotenv").config();
require("express-async-errors");
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const express = require('express');
const path = require('path');

const app = express();
const authenticateUser = require('./middleware/authentication');

//routers
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/book');
const borrowRouter = require('./routes/borrow');

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// error handlers
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(xss());

//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/books', authenticateUser, booksRouter);
app.use('/api/v1/borrow', authenticateUser, borrowRouter);

// middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;