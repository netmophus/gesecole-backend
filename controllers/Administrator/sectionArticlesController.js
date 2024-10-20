const SectionArticle = require('../../models/Administrator/SectionArticleModel');
const fs = require('fs');
const path = require('path');

// Obtenir tous les articles d'une section
exports.getAllSectionArticles = async (req, res) => {
  const { section } = req.query;
  
  // Ajoutez un log pour vérifier si la requête arrive bien avec le bon paramètre
  console.log('Requête reçue pour obtenir les articles de la section:', section);

  try {
    const sectionArticles = await SectionArticle.find({ sectionCard: section });
    
    // Log pour vérifier si des articles ont été trouvés
    console.log('Articles trouvés:', sectionArticles);

    if (sectionArticles.length === 0) {
      console.log('Aucun article trouvé pour cette section.');
    }

    res.json(sectionArticles);
  } catch (err) {
    console.error('Erreur du serveur:', err.message);
    res.status(500).json({ message: 'Erreur du serveur: ' + err.message });
  }
};






// Créer un nouvel article pour une section

exports.createSectionArticle = async (req, res) => {
  console.log('===== Requête reçue =====');
  console.log('Corps de la requête:', req.body);
  console.log('Fichiers reçus par Multer:', req.files);  // Logs pour les fichiers reçus par multer


const { sectionCard, titleArticle, bodyArticle, imgDescription, videoDescriptions, pdfDescriptions } = req.body;
let imgArticle = {}, videoArticles = [], pdfArticles = [];

// Gestion de l'image téléversée
if (req.files && req.files['imgArticle']) {
  imgArticle.url = req.files['imgArticle'][0].path;
  imgArticle.description = imgDescription || '';
}

// Gestion des vidéos envoyées comme URLs
if (req.body.videoArticles) {
  req.body.videoArticles.forEach((video, index) => {
    videoArticles.push({
      url: video.url,
      description: videoDescriptions ? videoDescriptions[index] : ''
    });
  });
}

// Gestion des PDFs téléversés
if (req.files && req.files['pdfArticles']) {
  req.files['pdfArticles'].forEach((file, index) => {
    pdfArticles.push({
      url: file.path,
      description: pdfDescriptions ? pdfDescriptions[index] : ''
    });
  });
}

try {
  const newSectionArticle = new SectionArticle({
    sectionCard,
    titleArticle,
    bodyArticle,
    imgArticle,
    videoArticles,  // Ajouter les vidéos en tant qu'URLs
    pdfArticles
  });

  const savedArticle = await newSectionArticle.save();
  res.status(201).json(savedArticle);
} catch (err) {
  console.error("Erreur lors de la création de l'article:", err.message);
  res.status(500).json({ message: 'Erreur lors de la création: ' + err.message });
}
}




// Mettre à jour un article de section



exports.updateSectionArticle = async (req, res) => {
  const { titleArticle, bodyArticle, videoDescriptions, imgDescription, pdfDescription } = req.body;

  console.log('Requête de mise à jour reçue :', req.body);
  console.log('Fichiers téléversés (si disponibles) :', req.files);

  let imgArticle, videoArticles = [], pdfArticles = [];

  // Gestion de l'image téléversée ou fournie
  if (req.files && req.files['imgArticle']) {
    imgArticle = {
      url: req.files['imgArticle'][0].path,
      description: imgDescription || ''
    };
  } else if (req.body.imgArticle) {
    imgArticle = {
      url: req.body.imgArticle,
      description: imgDescription || ''
    };
  }

  // Gestion des vidéos
  if (req.files && req.files['videoArticles']) {
    videoArticles = req.files['videoArticles'].map((file, index) => ({
      url: file.path,
      description: videoDescriptions && videoDescriptions[index] ? videoDescriptions[index] : ''
    }));
  } else if (req.body.videoArticles) {
    videoArticles = req.body.videoArticles.map((video, index) => ({
      url: video.url,
      description: video.description || ''
    }));
  }

  // Gestion des PDF téléversés ou fournis
  if (req.files && req.files['pdfArticles']) {
    pdfArticles = req.files['pdfArticles'].map((file, index) => ({
      url: file.path,
      description: pdfDescription && pdfDescription[index] ? pdfDescription[index] : '' // Checking if pdfDescription exists
    }));
  } else if (req.body.pdfArticles) {
    pdfArticles = req.body.pdfArticles.map((url, index) => ({
      url: url,
      description: pdfDescription && pdfDescription[index] ? pdfDescription[index] : '' // Same check here
    }));
  }

  try {
    let sectionArticle = await SectionArticle.findById(req.params.id);

    if (!sectionArticle) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    sectionArticle.titleArticle = titleArticle || sectionArticle.titleArticle;
    sectionArticle.bodyArticle = bodyArticle || sectionArticle.bodyArticle;
    sectionArticle.imgArticle = imgArticle || sectionArticle.imgArticle;
    sectionArticle.videoArticles = videoArticles.length > 0 ? videoArticles : sectionArticle.videoArticles;
    sectionArticle.pdfArticles = pdfArticles.length > 0 ? pdfArticles : sectionArticle.pdfArticles;

    const updatedArticle = await sectionArticle.save();
    console.log('Article mis à jour :', updatedArticle);
    res.json(updatedArticle);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour: ' + err.message });
  }
};


// Supprimer un article de section
exports.deleteSectionArticle = async (req, res) => {
  try {
    console.log('ID de l\'article à supprimer :', req.params.id);

    const sectionArticle = await SectionArticle.findById(req.params.id);

    if (!sectionArticle) {
      console.log('Article non trouvé');
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    // Vérification et suppression des fichiers locaux associés
    if (sectionArticle.imgArticle && sectionArticle.imgArticle.url && !sectionArticle.imgArticle.url.startsWith('http')) {
      const imgPath = path.join(__dirname, '..', sectionArticle.imgArticle.url);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    sectionArticle.videoArticles.forEach(video => {
      if (video.url && !video.url.startsWith('http')) {
        const videoPath = path.join(__dirname, '..', video.url);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      }
    });

    if (sectionArticle.pdfArticle && sectionArticle.pdfArticle.url && !sectionArticle.pdfArticle.url.startsWith('http')) {
      const pdfPath = path.join(__dirname, '..', sectionArticle.pdfArticle.url);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Suppression de l'article
    await SectionArticle.deleteOne({ _id: req.params.id });

    console.log('Article supprimé avec succès');
    res.json({ message: 'Article supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'article :', err.message);
    res.status(500).json({ message: 'Erreur du serveur lors de la suppression : ' + err.message });
  }
};




