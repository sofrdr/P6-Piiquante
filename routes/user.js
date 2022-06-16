const express = require('express');
const userCtrl = require('../controllers/user');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    standardHeaders: true, 
    legacyHeaders: false,
})

router.post('/signup', limiter, userCtrl.signup);
router.post('/login', limiter, userCtrl.login);

module.exports = router;