const express = require('express');
const userCtrl = require('../controllers/user');
const router = express.Router();

// Importation du package rate-limit
const rateLimit = require('express-rate-limit'); 
// On définit une limite de 3 tentatives par 5 minutes
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    standardHeaders: true, 
    legacyHeaders: false,
})

router.post('/signup', limiter, userCtrl.signup);
router.post('/login', limiter, userCtrl.login);

module.exports = router;