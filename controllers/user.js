const User = require('../models/User');
const bcrypt = require('bcrypt');


exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })
            user.save()
                .then(() => {
                    res.status(201);
                    res.json({ message: "Utilisateur créé" })
                })
                .catch(error => {
                    res.status(400);
                    res.json({ error })
                })
        })
        .catch(error => {
            res.status(500);
            res.json({ error });
        });

};

exports.login = (req, res, next) => {

};
