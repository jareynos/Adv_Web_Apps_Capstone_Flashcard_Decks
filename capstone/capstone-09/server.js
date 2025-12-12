const express = require('express');
const path = require('path');
const session = require('express-session');

const flashcardsRoutes = require('./src/api/flashcards-routes');
const authRoutes = require('./src/api/auth-routes');
const logger = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/error-handler');

const app = express();
const PORT = process.env.PORT || 3000;

// built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session middleware (memory store - fine for demo / school project)
app.use(session({
  name: 'flash.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// logger
app.use(logger);

// serve static thin client
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes (register/login/logout/me)
app.use('/api/auth', authRoutes);

// Protected API (flashcards) - routes themselves check session; mounting under /api
app.use('/api', flashcardsRoutes);

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Flashcard Decks App (auth) running on http://localhost:${PORT}`);
});
