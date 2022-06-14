const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');

const SALTROUNDS = process.env.SALTROUNDS;
const MIN = process.env.MIN;
const MAX = process.env.MAX;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

const bcrypt = require('bcrypt');
const emailValidator = require('email-validator');


const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(MIN)
    .is().max(MAX)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces();




exports.signup = (req, res, next) => {
    if (passwordSchema.validate(req.body.password) == false) {
        return res.status(401).json(passwordSchema.validate(req.body.password, { details: true }))

    } else if (emailValidator.validate(req.body.email) == false) {
        return res.status(401).json({ error: "Email non valide" });
    }
    bcrypt.hash(req.body.password, 11)
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
    User.findOne({email: req.body.email})
    .then(user => {
        if(!user){
            return res.status(401).json({error : "Utilisateur non trouvé"});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if(!valid){
                return res.status(401).json({error : "Mot de passe incorrect"});
            }
            return res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    {userId: user._id},
                    SECRET_TOKEN,
                    {expiresIn: '24h'}
                )
            });
        })
        .catch(error => res.status(500).json({error}))
    })
    .catch(error => res.status(500).json({error}))
};
