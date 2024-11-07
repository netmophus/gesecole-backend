const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Définition du stockage sur Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cfepd_inscriptions', // Dossier Cloudinary spécifique pour CFEPD
    format: async (req, file) => 'jpg', // forcer le format en .jpg (modifiable selon besoin)
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`, // Nom du fichier
  },
});

const upload = multer({ storage: storage }).fields([
  { name: 'certificatNaissance', maxCount: 1 },
  { name: 'certificatResidence', maxCount: 1 },
  { name: 'certificatScolarite', maxCount: 1 },
  { name: 'photoIdentite', maxCount: 1 },
  { name: 'pieceIdentiteParent', maxCount: 1 },
  { name: 'autresDocuments', maxCount: 1 },
]);

const uploadFilesJointCFEPD = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de l\'upload des fichiers', details: err.message });
    }
    
    // Récupération des URLs Cloudinary et ajout à req.body.documents
    req.body.documents = {};
    if (req.files) {
      for (const key in req.files) {
        if (req.files[key] && req.files[key][0]) {
          req.body.documents[key] = req.files[key][0].path; // URL Cloudinary
        }
      }
    }

    next();
  });
};

module.exports = uploadFilesJointCFEPD;
