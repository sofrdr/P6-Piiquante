const express = require('express');

const mongoose = require('mongoose'); 

mongoose.connect('mongodb+srv://admin:YOoGqHQOt178jgUf@cluster0.bm69yrb.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(express.json());

module.exports = app;