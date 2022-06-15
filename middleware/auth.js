
const dotenv = require('dotenv');
dotenv.config();
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, SECRET_TOKEN);
        const userId = decodedToken.userId;
        req.auth = {userId};

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