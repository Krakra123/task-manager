require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');

const connectDB = require('./server/config/db');
const createSession = require('./server/config/session');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB().then({});
createSession(app);

app.use(express.static('public'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Define your routes AFTER setting up layouts
app.use('/', require('./server/routes/main'));

app.listen(PORT, () => {
    console.log(`Running on port http://localhost:${PORT}/`);
})