const Class = require('../models/Class');
const Student = require('../models/Student'); // Assurez-vous d'importer le modèle Student
const Teacher = require('../models/Teacher'); // Assurez-vous d'importer le modèle Teacher


// const createClass = async (req, res) => {
//   try {
//     const { name, level, maxStudents, series } = req.body; // Ajout du champ 'series'
//     const { user } = req;

//     console.log('Données reçues:', req.body); // Vérifie si `series` est bien reçu dans le backend


//     // Vérification de l'utilisateur et de son établissement
//     if (!user || !user.schoolId) {
//       return res.status(400).json({ msg: "Utilisateur non autorisé ou établissement non spécifié" });
//     }

//     // Validation des champs
//     if (!name.trim() || !level.trim() || maxStudents <= 0) {
//       return res.status(400).json({ 
//         msg: "Données invalides. Assurez-vous que tous les champs sont correctement remplis et que le nombre maximal d'étudiants est positif." 
//       });
//     }

//     // Si le niveau est 'lycée', la série doit être fournie
//     if (level.toLowerCase() === 'lycee' && !series) {
//       return res.status(400).json({ msg: "La série est requise pour les classes de lycée." });
//     }

//     // Vérifier l'existence d'une classe similaire
//     const query = { name, level, establishment: user.schoolId };
//     if (level.toLowerCase() === 'lycee') {
//       query.series = series; // Ajouter la série dans la requête
//     }

//     const existingClass = await Class.findOne(query);
//     if (existingClass) {
//       return res.status(400).json({ msg: "Une classe avec le même nom, niveau, et série existe déjà dans cet établissement." });
//     }

   
//     const newClass = new Class({
//       name,
//       level,
//       maxStudents,
//       series, // Insère directement le champ `series`
//       establishment: user.schoolId,
//     });
    

//     await newClass.save();

//     console.log('Classe créée avec succès :', newClass); // Vérifie le contenu après la sauvegarde
//     res.status(201).json(newClass);
//   } catch (err) {
//     console.error('Erreur lors de la création de la classe:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la création de la classe' });
//   }
// };

const createClass = async (req, res) => {
  try {
    const { name, level, maxStudents, series } = req.body;
    const { user } = req;

    // Vérification de l'utilisateur et de son établissement
    if (!user || !user.schoolId) {
      return res.status(400).json({ msg: "Utilisateur non autorisé ou établissement non spécifié" });
    }

    // Validation des champs
    if (!name.trim() || !level.trim() || maxStudents <= 0) {
      return res.status(400).json({ 
        msg: "Données invalides. Assurez-vous que tous les champs sont correctement remplis et que le nombre maximal d'étudiants est positif." 
      });
    }

    // Si le niveau est 'Lycée', la série doit être fournie
    if (level.toLowerCase() === 'lycee' && !series) {
      return res.status(400).json({ msg: "La série est requise pour les classes de lycée." });
    }

    // Vérifier l'existence d'une classe similaire (en tenant compte de la série)
    const query = { name, level, establishment: user.schoolId };
    if (level.toLowerCase() === 'lycee') {
      query.series = series; // Ajouter la série dans la requête
    }

    const existingClass = await Class.findOne(query);
    if (existingClass) {
      return res.status(400).json({ msg: "Une classe avec le même nom, niveau, et série existe déjà dans cet établissement." });
    }

    const newClass = new Class({
      name,
      level,
      maxStudents,
      series, 
      establishment: user.schoolId,
    });
    
    await newClass.save();

    res.status(201).json(newClass);
  } catch (err) {
    console.error('Erreur lors de la création de la classe:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la création de la classe' });
  }
};


// const updateClass = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, level, maxStudents } = req.body;
//     const { user } = req;

//     // Assurez-vous que l'utilisateur est bien identifié et a un établissement
//     if (!user || !user.schoolId) {
//       return res.status(400).json({ msg: "Utilisateur non autorisé ou établissement non spécifié" });
//     }

//     // Validation supplémentaire
//     if (!name || !level || maxStudents <= 0) {
//       return res.status(400).json({ msg: "Données invalides. Assurez-vous que tous les champs sont correctement remplis." });
//     }

//     // Vérifier si la classe est associée à un ou plusieurs élèves
//     const isAssigned = await Student.findOne({ class: id });
//     if (isAssigned) {
//       return res.status(400).json({ msg: "Impossible de modifier cette classe car elle est associée à un ou plusieurs élèves." });
//     }

//     // Vérifier si une autre classe avec le même nom et niveau existe déjà dans l'établissement
//     const existingClass = await Class.findOne({
//       name,
//       level,
//       establishment: user.schoolId,
//       _id: { $ne: id }, // Exclure la classe actuelle de la vérification
//     });

//     if (existingClass) {
//       return res.status(400).json({ msg: "Une autre classe avec le même nom et niveau existe déjà dans cet établissement." });
//     }

//     // Effectuer la mise à jour
//     const updatedClass = await Class.findByIdAndUpdate(
//       id,
//       { name, level, maxStudents },
//       { new: true, runValidators: true } // Pour retourner la nouvelle classe mise à jour
//     );

//     if (!updatedClass) {
//       return res.status(404).json({ msg: "Classe non trouvée." });
//     }

//     res.status(200).json({ msg: "Classe mise à jour avec succès", updatedClass });
//   } catch (err) {
//     console.error('Erreur lors de la mise à jour de la classe:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de la classe' });
//   }
// };


const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, maxStudents, series } = req.body;
    const { user } = req;

    // Vérification de l'utilisateur et de son établissement
    if (!user || !user.schoolId) {
      return res.status(400).json({ msg: "Utilisateur non autorisé ou établissement non spécifié" });
    }

    // Validation des champs
    if (!name.trim() || !level.trim() || maxStudents <= 0) {
      return res.status(400).json({ msg: "Données invalides. Assurez-vous que tous les champs sont correctement remplis et que le nombre maximal d'étudiants est positif." });
    }

    // Vérifier si des élèves sont déjà associés à cette classe
    const isAssigned = await Student.findOne({ classId: id });
    if (isAssigned) {
      return res.status(400).json({ msg: "Impossible de modifier cette classe car elle est associée à un ou plusieurs élèves." });
    }

    // Vérifier la classe actuelle pour s'assurer que le niveau ne change pas de 'Collège' vers 'Lycée' ou vice versa
    const currentClass = await Class.findById(id);
    if (!currentClass) {
      return res.status(404).json({ msg: "Classe non trouvée." });
    }

    // Si le niveau change de "Primaire" vers "Collège" ou "Lycée", ou de "Collège"/"Lycée" vers "Primaire", retourner une erreur
if (
  (currentClass.level === 'Primaire' && (level === 'Collège' || level === 'Lycée')) ||
  (currentClass.level === 'Collège' && (level === 'Primaire' || level === 'Lycée')) ||
  (currentClass.level === 'Lycée' && (level === 'Primaire' || level === 'Collège'))
) {
  return res.status(400).json({ msg: "Modification du niveau de 'Primaire', 'Collège', ou 'Lycée' vers un autre niveau est interdite." });
}


    // Vérifier si une autre classe avec le même nom et niveau existe déjà dans l'établissement
    const existingClass = await Class.findOne({
      name,
      level,
      establishment: user.schoolId,
      _id: { $ne: id }, // Exclure la classe actuelle de la vérification
    });

    if (existingClass) {
      return res.status(400).json({ msg: "Une autre classe avec le même nom et niveau existe déjà dans cet établissement." });
    }

    // Effectuer la mise à jour
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { name, level, maxStudents, series },
      { new: true, runValidators: true } // Pour retourner la nouvelle classe mise à jour
    );

    if (!updatedClass) {
      return res.status(404).json({ msg: "Classe non trouvée." });
    }

    res.status(200).json({ msg: "Classe mise à jour avec succès", updatedClass });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la classe:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de la classe' });
  }
};


const getClasses = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 5, level } = req.query; // Ajout du paramètre level
    const { user } = req;

    if (!user || !user.schoolId) {
      return res.status(400).json({ msg: "Utilisateur non autorisé ou établissement non spécifié" });
    }

    // Ajout du niveau (level) dans le filtre si celui-ci est fourni
    const query = {
      establishment: user.schoolId,
      name: { $regex: search, $options: 'i' },
    };

    if (level) {
      query.level = level; // Filtrer également par niveau si disponible
    }

    const classes = await Class.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Class.countDocuments(query);

    res.status(200).json({
      classes,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10),
      totalCount: count,
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des classes:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des classes' });
  }
};



const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la classe est assignée à un ou plusieurs élèves
    const isAssigned = await Student.findOne({ classId: id });
    if (isAssigned) {
      return res.status(400).json({ msg: 'Impossible de supprimer cette classe car elle est assignée à un ou plusieurs élèves.' });
    }

    // Supprimer la classe si elle n'est pas assignée
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({ msg: "Classe non trouvée" });
    }

    res.status(200).json({ msg: "Classe supprimée avec succès" });
  } catch (err) {
    console.error('Erreur lors de la suppression de la classe:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la suppression de la classe' });
  }
};

const getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const subjects = await Subject.find({ classId }); // Rechercher les matières liées à cette classe
    res.status(200).json({ subjects });
  } catch (err) {
    console.error('Erreur lors de la récupération des matières:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des matières' });
  }
};





module.exports = {
  createClass,
  getClasses,
  updateClass,
  deleteClass,
  getSubjectsByClass
};
