const Class = require('../models/Class');
const Student = require('../models/Student'); // Assurez-vous d'importer le modèle Student

// const createClass = async (req, res) => {
//   try {
//     const { name, level, maxStudents } = req.body;
//     const { user } = req;

//     // Assurez-vous que l'utilisateur est bien identifié et a un établissement
//     if (!user || !user.schoolId) {
//       return res.status(400).json({ msg: "Utilisateur non autorisé ou établissement non spécifié" });
//     }

//     // Validation supplémentaire
//     if (!name.trim() || !level.trim() || maxStudents <= 0) {
//       return res.status(400).json({ msg: "Données invalides. Assurez-vous que tous les champs sont correctement remplis et que le nombre maximal d'étudiants est positif." });
//     }

//     // Vérifier si une classe avec le même nom et niveau existe déjà dans l'établissement
//     const existingClass = await Class.findOne({ name, level, establishment: user.schoolId });

//     if (existingClass) {
//       return res.status(400).json({ msg: "Une classe avec le même nom et niveau existe déjà dans cet établissement" });
//     }

//     const newClass = new Class({
//       name,
//       level,
//       maxStudents,
//       establishment: user.schoolId,
//     });

//     await newClass.save();
//     res.status(201).json(newClass);
//   } catch (err) {
//     console.error('Erreur lors de la création de la classe:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la création de la classe' });
//   }
// };

const createClass = async (req, res) => {
  try {
    const { name, level, maxStudents, series } = req.body; // Ajout du champ 'series'
    const { user } = req;

    console.log('Données reçues:', req.body); // Vérifie si `series` est bien reçu dans le backend


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

    // Si le niveau est 'lycée', la série doit être fournie
    if (level.toLowerCase() === 'lycee' && !series) {
      return res.status(400).json({ msg: "La série est requise pour les classes de lycée." });
    }

    // Vérifier l'existence d'une classe similaire
    const query = { name, level, establishment: user.schoolId };
    if (level.toLowerCase() === 'lycee') {
      query.series = series; // Ajouter la série dans la requête
    }

    const existingClass = await Class.findOne(query);
    if (existingClass) {
      return res.status(400).json({ msg: "Une classe avec le même nom, niveau, et série existe déjà dans cet établissement." });
    }

    // Créer une nouvelle classe
    // const newClass = new Class({
    //   name,
    //   level,
    //   maxStudents,
    //   series: level.toLowerCase() === 'lycee' ? series : undefined, // Ajouter la série uniquement pour le lycée
    //   establishment: user.schoolId,
    // });


    const newClass = new Class({
      name,
      level,
      maxStudents,
      series, // Insère directement le champ `series`
      establishment: user.schoolId,
    });
    

    await newClass.save();

    console.log('Classe créée avec succès :', newClass); // Vérifie le contenu après la sauvegarde
    res.status(201).json(newClass);
  } catch (err) {
    console.error('Erreur lors de la création de la classe:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la création de la classe' });
  }
};


const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, maxStudents } = req.body;
    const { user } = req;

    // Assurez-vous que l'utilisateur est bien identifié et a un établissement
    if (!user || !user.schoolId) {
      return res.status(400).json({ msg: "Utilisateur non autorisé ou établissement non spécifié" });
    }

    // Validation supplémentaire
    if (!name || !level || maxStudents <= 0) {
      return res.status(400).json({ msg: "Données invalides. Assurez-vous que tous les champs sont correctement remplis." });
    }

    // Vérifier si la classe est associée à un ou plusieurs élèves
    const isAssigned = await Student.findOne({ class: id });
    if (isAssigned) {
      return res.status(400).json({ msg: "Impossible de modifier cette classe car elle est associée à un ou plusieurs élèves." });
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
      { name, level, maxStudents },
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
    const { search = '', page = 1, limit = 5 } = req.query;
    const { user } = req;

    // Assurez-vous que l'utilisateur est bien identifié et a un établissement
    if (!user || !user.schoolId) {
      return res.status(400).json({ msg: "Utilisateur non autorisé ou établissement non spécifié" });
    }

    const query = {
      establishment: user.schoolId,
      name: { $regex: search, $options: 'i' }, // Recherche insensible à la casse
    };

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



module.exports = {
  createClass,
  getClasses,
  updateClass,
  deleteClass
};
