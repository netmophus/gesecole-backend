// controllers/Admin/dernierActuController.js

const DernierActu = require('../../models/Admin/DernierActu');

// Obtenir tous les articles d'actualité
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await DernierActu.find();
    res.json(articles);
  } catch (err) {
    console.error('Erreur lors de la récupération des articles:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};



// Créer un nouvel article d'actualité pour DernierActu
exports.createDernierActuArticle = async (req, res) => {
  const {
    titleCard,
    bodyCard,
    boutonCard,
    titreArticles,
    bodyArticle,
    imageArticle,
    videoArticle,
  } = req.body;

  try {
    const newArticle = new DernierActu({
      titleCard,
      bodyCard,
      boutonCard,
      titreArticles,
      bodyArticle,
      imageArticle,
      videoArticle,
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Erreur lors de la création de l'article pour DernierActu:", err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};



// Obtenir un article d'actualité par ID
exports.getArticleById = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await DernierActu.findById(id);

    if (!article) {
      return res.status(404).json({ msg: 'Article non trouvé' });
    }

    res.json(article);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'article:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Mettre à jour un article d'actualité
exports.updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, body, imageUrl, videoUrl } = req.body;

  try {
    const article = await DernierActu.findById(id);

    if (!article) {
      return res.status(404).json({ msg: 'Article non trouvé' });
    }

    // Mettre à jour les champs de l'article
    article.title = title || article.title;
    article.body = body || article.body;
    article.imageUrl = imageUrl || article.imageUrl;
    article.videoUrl = videoUrl || article.videoUrl;

    await article.save();

    res.json({ msg: 'Article mis à jour avec succès', article });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'article:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Supprimer un article d'actualité
exports.deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await DernierActu.findById(id);

    if (!article) {
      return res.status(404).json({ msg: 'Article non trouvé' });
    }

    await article.deleteOne();  // Utilisation de deleteOne au lieu de remove

    res.json({ msg: 'Article supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'article:', err);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};
