const express = require('express');
const session = require('express-session');
const nocache = require('nocache');
const app = express();
require('dotenv').config();

// Configuration
const port = process.env.PORT || 3000;
const user = process.env.USER || 'sharon';
const pass = process.env.PASS || '1234';

// Set view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Session config
app.use(session({
  secret: 'sharon@123',
  resave: false,
  saveUninitialized: false
}));

// Nocache and strict cache control
app.use(nocache());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '-1');
  next();
});

// GET /
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login');
});

// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === user && password === pass) {
    req.session.regenerate((err) => {
      if (err) return res.redirect('/');
      req.session.user = username;
      res.redirect('/dashboard');
    });
  } else {
    res.redirect('/');
  }
});

// GET /dashboard (protected)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.render('dashboard', { name: req.session.user });
});

// POST /logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.redirect('/dashboard');
    res.clearCookie('connect.sid'); // Clear session cookie
    res.redirect('/');
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
