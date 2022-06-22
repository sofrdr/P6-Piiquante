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
    const sauceId = req.params.id;
    const like = req.body.like;

    Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
            switch (like) {
                case 1:
                    Sauce.updateOne(
                        { _id: sauceId },
                        {
                            $inc: { likes: +1 },
                            $push: { usersLiked: userId }
                        }
                    )
                        .then(() => res.status(200).json({ message: "Like pris en compte" }))
                        .catch((error) => res.status(400).json({ error }));
                    break;
                case -1:
                    Sauce.updateOne(
                        { _id: sauceId },
                        {
                            $inc: { dislikes: +1 },
                            $push: { usersDisliked: userId }
                        }
                    )
                        .then(() =>
                            res.status(200).json({ message: "Dislike pris en compte" }))
                        .catch((error) => res.status(400).json({ error }));
                    break;
                case 0:
                    if (sauce.usersLiked.includes(userId)) {
                        Sauce.updateOne(
                            { _id: sauceId },
                            {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: userId }
                            })
                            .then(() => res.status(200).json({ message: "Like annulé" }))
                            .catch((error) => res.status(400).json({ error }));
                    }
                    if (sauce.usersDisliked.includes(userId)) {
                        Sauce.updateOne(
                            { _id: sauceId },
                            {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: userId }
                            })
                            .then(() => res.status(200).json({ message: "Dislike annulé" }))
                            .catch((error) => res.status(400).json({ error }));
                    }



            }
        })
        .catch(error => res.status(404).json({ error }));

};