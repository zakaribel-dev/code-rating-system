require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const loginRoute = require('./routes/login');
const submitRoute = require('./routes/submit');
const statusRoute = require('./routes/status');
const mySubmissionsRoute = require('./routes/mySubmissions');
const exercises = require('./routes/exercises');

const app = express();
const PORT = process.env.PORT;


app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/submit', submitRoute);
app.use('/status', statusRoute);
app.use('/login', loginRoute);
app.use('/my-submissions', mySubmissionsRoute);
app.use('/exercises', exercises);


app.get('/test', (req, res) => {
  res.send('Code Rating System API is running');
});



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

