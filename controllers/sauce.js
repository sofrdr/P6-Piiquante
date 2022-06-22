const Sauce = require('../models/Sauce');
const fs = require('fs');

// Fonction pour créer une nouvelle sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: req.protocol + '://' + req.get('host') + '/images/' + req.file.filename
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée' }))
        .catch(error => res.status(400).json({ error }));
}

// Fonction pour afficher les sauces 
exports.getSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// Fonction pour afficher une sauce ciblée
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Fonction pour modifier les données d'une sauce
exports.modifySauce = (req, res, next) => {
    let sauceObject;
    // Si la requête comporte une image
    if (req.file) {
        sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: req.protocol + '://' + req.get('host') + '/images/' + req.file.filename
        };
    } else {
        sauceObject = { ...req.body };
    }
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + filename, () => {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce modifiée" }))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(404).json({ error }));

};


// Fonction pour supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + filename, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce supprimée" }))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(404).json({ error }));
}

// Fonction pour gérer les likes et les dislikes
exports.likeSauce = function (req, res, next) {
    const userId = req.body.userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            switch (req.body.like) {
               /*   Si req.body.like = 1 (l'utilisateur veut aimer cette sauce)
                 et que l'id de l'utilisateur n'est pas déjà dans le tableau usersLiked */
                case 1:
                    if (!sauce.usersLiked.includes(userId)) {
                        // On incrémente le nombre de like de 1 et on ajoute le userId au tableau usersLiked
                        Sauce.updateOne(sauce, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
                            .then(() => res.status(200).json({ message: "Like enregistré" }))
                            .catch(error => res.status(400).json({ error }))
                    }
                    break;
                /* Si req.body.like = 0 l'utilisateur veut enlever son like ou son dislike */    
                case 0:
                    // Si l'id de l'utilisateur est dans le tableau usersLiked (il aime cette sauce)
                    if (sauce.usersLiked.includes(userId)) {
                        // alors on décrémente le nombre de like de 1 (-1) et on retire son userId du tableau usersLiked
                        Sauce.updateOne(sauce, { $inc: { likes: -1 }, $pull: { usersLiked: userId } })
                            .then(() => res.status(200).json({ message: "Like supprimé" }))
                            .catch(error => res.status(400).json({ error }))
                    // si l'id de l'utilisateur est dans le tableau usersDisliked (il n'aime pas cette sauce)        
                    } else if (sauce.usersDisliked.includes(userId)) {
                        //alors on décrémente le nombre de dislikes de 1 (-1) et on retire son userId du tableau usersDisliked
                        Sauce.updateOne(sauce, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } })
                            .then(() => res.status(200).json({ message: "dislike supprimé" }))
                            .catch(error => res.status(400).json({ error }))
                    }
                    break;
                /* Si req.body.like = -1 (l'utilisateur veut dislike la sauce) et que l'id de l'utilisateur n'est pas
                déjà dans le tableau usersDisliked  */
                case -1:
                    if (!sauce.usersDisliked.includes(userId)) {
                        // alors on incrémente le nombre de dislikes de 1 et on ajoute l'id de l'utilisateur au tableau usersDisliked
                        Sauce.updateOne(sauce, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
                            .then(() => res.status(200).json({ message: "dislike ajouté" }))
                            .catch(error => res.status(400).json({ error }))
                    }
                    

            }
            res.status(201).json({ message: "Like modifié" })
        })
        .catch(error => res.status(400).json({ error }));





}

/* exports.likeSauce = function (req, res, next) {
    const userId = req.body.userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {

            if (!sauce.usersLiked.includes(userId) && req.body.like == 1) {
                Sauce.updateOne(sauce, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
                    .then(() => res.status(200).json({ message: "Like enregistré" }))
                    .catch(error => res.status(400).json({ error }))
            }else if (sauce.usersLiked.includes(userId) && req.body.like == 0) {
                Sauce.updateOne(sauce, { $inc: { likes: -1 }, $pull: { usersLiked: userId } })
                    .then(() => res.status(200).json({ message: "Like supprimé" }))
                    .catch(error => res.status(400).json({ error }))
            } else if (sauce.usersDisliked.includes(userId) && req.body.like == 0) {
                Sauce.updateOne(sauce, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } })
                    .then(() => res.status(200).json({ message: "dislike supprimé" }))
                    .catch(error => res.status(400).json({ error }))
            } else if (!sauce.usersDisliked.includes(userId) && req.body.like == -1) {
                Sauce.updateOne(sauce, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
                    .then(() => res.status(200).json({ message: "dislike supprimé" }))
                    .catch(error => res.status(400).json({ error }))
            }
            res.status(201).json({ message: "Like modifié" })

        }

        )
        .catch(error => res.status(400).json({ error }));





} */