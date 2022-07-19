const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');


// Variables d'environnement
const MIN = process.env.MIN;
const MAX = process.env.MAX;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

const bcrypt = require('bcrypt');

// Importation du module email-validator : vérifie la validité d'un adresse email
const emailValidator = require('email-validator');


// Importation du package password-validator et création d'un schéma de mot de passe fort
const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(MIN)
    .is().max(MAX)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces();




// Fonction pour enregistrer un nouvel utilisateur
exports.signup = (req, res, next) => {
    // Si le mot de passe ne respecte pas le schéma défini
    const {password} = req.body;
    if (passwordSchema.validate(password) == false) {
        return res.status(401).send(passwordSchema.validate(password, { details: true }))
    
    // Si l'adresse mail n'est pas valide
    } else if (emailValidator.validate(req.body.email) == false) {
        return res.status(401).json({ error: "Email non valide" });
    }

    // Si tout est bon, bcrypt hash le mot de passe et un nouvel utilisateur est créé
    bcrypt.hash(req.body.password, 11)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })
            // Le nouvel utilisateur est enregistré dans la base de données
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


// Fonction pour se connecter avec un compte existant
exports.login = (req, res, next) => {
    // On cherche l'utilisateur dans la base de données avec son adresse email
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: "Utilisateur non trouvé" });
            }
            // si l'adresse mail est trouvée alors on compare le mot de passe saisi avec le mot de passe associé à l'email
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: "Mot de passe incorrect" });
                    }
                    // si le mot de passe est valide alors on crée un userId et un token pour la session
                    return res.status(200).json({
                        userId: user._id,
                        // infos enregistrées dans le payload du token
                        token: jwt.sign(
                            { userId: user._id },
                            SECRET_TOKEN,
                            { expiresIn: '1h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};


