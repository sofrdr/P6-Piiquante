const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const mongoose = require('mongoose');

// Variables environnement
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;

//Routes
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauce');

// Connexion à la base de données
mongoose.connect('mongodb+srv://' + USER + ':' + PASSWORD + '@cluster0.kevmczz.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();

 app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );  

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});




app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);

module.exports = app; 