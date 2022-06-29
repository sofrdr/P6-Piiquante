
const dotenv = require('dotenv');
dotenv.config();
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const jwt = require('jsonwebtoken');

// Middleware d'authentification
module.exports = (req, res, next) => {
    try{
        // On récupère le token renvoyé dans les headers de la requête
        const token = req.headers.authorization.split(' ')[1];
        // On décode le token et on récupère le userId associé
        const decodedToken = jwt.verify(token, SECRET_TOKEN);
        const userId = decodedToken.userId;
        req.auth = {userId};

        // Si le userId de la requête ne correspond pas au userId du token on renvoie une erreur
        if(req.body.userId && req.body.userId !== userId){
            throw res.status(403);
        }else{
            next();
        }
    }
    catch(error) {
        res.status(401).json({error : error | "Requête non authentifiée"});
    }
};