
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const TeacherSubject = require('../models/TeacherSubject'); // Importer le modèle d'association entre enseignants et matières
const AcademicYear = require('../models/AcademicYear');

exports.createSubject = async (req, res) => {
  try {
    const { name, level, teachers, isActive } = req.body;
    const { user } = req;

    console.log("Données reçues pour la création de la matière :", req.body); // Log des données reçues

    // Récupérer l'année académique active
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear) {
      console.log('Aucune année académique active trouvée.');
      return res.status(400).json({ msg: 'Aucune année académique active trouvée.' });
    }
    console.log('Année académique active trouvée:', activeYear.year);

    // Vérification du rôle et des permissions
    if (user.role !== 'Etablissement') {
      console.log("Accès refusé : rôle non autorisé.");
      return res.status(403).json({ msg: 'Accès refusé : seuls les établissements peuvent créer des matières.' });
    }



    if (!user.permissions.create) {
      console.log("Accès refusé : permission non accordée.");
      return res.status(403).json({ msg: 'Accès refusé : vous n\'avez pas la permission de créer une matière.' });
    }

    // Validation des champs requis
    if (!name || !level) {
      console.log("Les champs requis sont manquants : nom ou niveau.");
      return res.status(400).json({ msg: 'Les champs nom et niveau sont requis.' });
    }



    if (!user.schoolId) {
      console.log("Utilisateur non autorisé : établissement non spécifié.");
      return res.status(400).json({ msg: 'Utilisateur non autorisé : établissement non spécifié.' });
    }
    

    // Validation de l'utilisateur et de l'établissement
    if (!user || !user.schoolId) {
      console.log("Utilisateur non autorisé ou établissement non spécifié.");
      return res.status(400).json({ msg: 'Utilisateur non autorisé ou établissement non spécifié.' });
    }

    // Validation des enseignants (s'il y en a)
    if (teachers && teachers.length > 0) {
      const uniqueTeachers = [...new Set(teachers)]; // Suppression des doublons
      console.log('Enseignants uniques identifiés:', uniqueTeachers);

      const foundTeachers = await Teacher.find({ _id: { $in: uniqueTeachers } });

      if (foundTeachers.length !== uniqueTeachers.length) {
        console.log("Un ou plusieurs enseignants introuvables.");
        return res.status(400).json({ msg: 'Un ou plusieurs enseignants sont introuvables.' });
      }

      console.log('Enseignants validés:', foundTeachers);
    } else {
      console.log('Aucun enseignant assigné à la matière.');
    }

    // Création de la nouvelle matière avec la possibilité d'activer ou non
    const newSubject = new Subject({
      name,
      level,
      teachers,
      establishment: user.schoolId,
      academicYear: activeYear._id,  // Associer l'année académique active par son ID
      isActive: isActive || false,   // Par défaut inactif, sauf si activé via la case à cocher
    });

    // Sauvegarder la matière
    await newSubject.save();
    console.log("Matière créée avec succès :", newSubject);

    // Peupler l'année académique en texte pour la réponse
    await newSubject.populate('academicYear', 'year');

    return res.status(201).json({
      msg: 'Matière créée avec succès.',
      subject: newSubject,
    });
  } catch (err) {
    console.error('Erreur lors de la création de la matière:', err.message);
    return res.status(500).json({
      msg: 'Erreur du serveur lors de la création de la matière. Veuillez réessayer plus tard.',
      error: err.message,
    });
  }
};


exports.getSubjects = async (req, res) => {
  try {
    const { educationLevel, search = '', page = 1, limit = 10 } = req.query;
    const { user } = req;

    // Récupérer l'année académique active
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear) {
      return res.status(400).json({ msg: 'Aucune année académique active trouvée.' });
    }

    if (!user || !user.schoolId) {
      return res.status(400).json({ msg: 'Utilisateur non autorisé ou établissement non spécifié' });
    }

    const query = {
      establishment: user.schoolId,
      name: { $regex: search, $options: 'i' },
      academicYear: activeYear._id // Filtrer par l'année académique active
    };

    if (educationLevel) {
      query.level = educationLevel;  // Filtrer par niveau d'enseignement
    }


  const subjects = await Subject.find(query)
  .populate('academicYear', 'startYear endYear')  // Peupler l'année académique avec startYear et endYear
  .skip((page - 1) * limit)
  .limit(Number(limit));


const totalCount = await Subject.countDocuments(query);
const subjectsCount = subjects.length; // Compter le nombre de matières retournées sur la page actuelle

res.json({
  subjects,
  totalCount,
  subjectsCount, // Nouveau champ
  page: Number(page),
  totalPages: Math.ceil(totalCount / limit)
});

  } catch (err) {
    console.error('Erreur lors de la récupération des matières:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des matières. Veuillez réessayer plus tard.' });
  }
};


exports.updateSubject = async (req, res) => {
  try {
    const { name, level, isActive, academicYear } = req.body;

    console.log("Données reçues pour la mise à jour :", req.body);

    // Récupérer la matière existante
    const existingSubject = await Subject.findById(req.params.id);
    
    
    // Vérifier si la matière est assignée à des enseignants
    const isAssigned = await TeacherSubject.findOne({ subject: req.params.id });

    // Si la matière est assignée, empêcher la modification des champs critiques (nom et niveau)
    if (isAssigned) {
      if (name !== existingSubject.name || level !== existingSubject.level) {
        return res.status(400).json({
          msg: "Impossible de modifier le nom ou le niveau d'une matière assignée à des enseignants."
        });
      }
    }
    if (!existingSubject) {
      return res.status(404).json({ msg: "Matière introuvable." });
    }
  

     // Si l'utilisateur tente de désactiver la matière
     if (isActive === false) {
      // Vérifier si la matière est assignée à des enseignants
      const isAssigned = await TeacherSubject.findOne({ subject: req.params.id });

      if (isAssigned) {
        return res.status(400).json({ 
          msg: "Impossible de désactiver cette matière car elle est assignée à un ou plusieurs enseignants." 
        });
      }
    }

    // Mise à jour de la matière
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name,
        level,
        academicYear: academicYear?._id || academicYear,
        isActive,
      },
      { new: true }
    ).populate('academicYear', 'year');

    res.status(200).json({
      msg: "Matière mise à jour avec succès.",
      subject: updatedSubject,
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la matière :", err.message);
    res.status(500).json({ msg: "Erreur du serveur lors de la mise à jour de la matière." });
  }
};


exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la matière est assignée à un enseignant
    const subjectAssigned = await TeacherSubject.findOne({ subject: id });
    if (subjectAssigned) {
      return res.status(400).json({ msg: 'Impossible de supprimer cette matière car elle est assignée à un ou plusieurs enseignants.' });
    }


// Supprimer la matière dans le modèle Teacher et retourner le nombre d'enseignants affectés
const updateResult = await Teacher.updateMany(
  { assignedSubjects: id },
  { $pull: { assignedSubjects: id } }
);
const affectedTeachers = updateResult.modifiedCount; // Nombre d'enseignants affectés par la suppression

// Supprimer la matière
const subject = await Subject.findByIdAndDelete(id);
if (!subject) {
  return res.status(404).json({ msg: 'Matière non trouvée.' });
}

res.status(200).json({ 
  msg: 'Matière supprimée avec succès.',
  affectedTeachers, // Nombre d'enseignants affectés
  subjectDeleted: subject.name // Le nom de la matière supprimée
});
  
  } catch (err) {
    console.error('Erreur lors de la suppression de la matière:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la suppression de la matière.' });
  }
};


// exports.toggleSubjectActivation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const subject = await Subject.findById(id);

//     if (!subject) {
//       return res.status(404).json({ msg: 'Matière non trouvée.' });
//     }

//     // Vérifier si l'état demandé est déjà le même
//     if (subject.isActive && req.body.isActive === true) {
//       return res.status(400).json({ msg: 'La matière est déjà activée.' });
//     }

//     if (!subject.isActive && req.body.isActive === false) {
//       return res.status(400).json({ msg: 'La matière est déjà désactivée.' });
//     }

//     // Inverser l'état actif de la matière si tout est en ordre
//     subject.isActive = !subject.isActive;
//     await subject.save();

//     res.status(200).json({ msg: `Matière ${subject.isActive ? 'activée' : 'désactivée'} avec succès.`, subject });
//   } catch (err) {
//     res.status(500).json({ msg: 'Erreur lors de l\'activation/désactivation de la matière.', error: err.message });
//   }
// };

exports.toggleSubjectActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ msg: 'Matière non trouvée.' });
    }

    // Vérifier si l'état demandé est déjà le même
    if (subject.isActive && req.body.isActive === true) {
      return res.status(400).json({ msg: 'La matière est déjà activée.' });
    }

    if (!subject.isActive && req.body.isActive === false) {
      return res.status(400).json({ msg: 'La matière est déjà désactivée.' });
    }

    // Vérifier si la matière est assignée à un enseignant avant de la désactiver
    if (subject.isActive === true) {
      const isAssigned = await TeacherSubject.findOne({ subject: id });

      if (isAssigned) {
        return res.status(400).json({
          msg: 'Impossible de désactiver cette matière car elle est assignée à un ou plusieurs enseignants.',
        });
      }
    }

    // Inverser l'état actif de la matière si elle n'est pas assignée
    subject.isActive = !subject.isActive;
    await subject.save();

    res.status(200).json({ msg: `Matière ${subject.isActive ? 'activée' : 'désactivée'} avec succès.`, subject });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de l\'activation/désactivation de la matière.', error: err.message });
  }
};


exports.getActiveSubjects = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const { user } = req;

    if (!user || !user.schoolId) {
      return res.status(400).json({ msg: 'Utilisateur non autorisé ou établissement non spécifié' });
    }

    const query = {
      establishment: user.schoolId,
      name: { $regex: search, $options: 'i' },
      isActive: true  // Récupérer uniquement les matières actives
    };

    

    const subjects = await Subject.find(query)
  .skip((page - 1) * limit)
  .limit(Number(limit))
  .populate('teachers')
  .populate('academicYear', 'year');

const totalCount = await Subject.countDocuments(query);
const subjectsCount = subjects.length; // Compter le nombre de matières retournées sur la page actuelle

res.json({
  subjects,
  totalCount,
  subjectsCount, // Nouveau champ
  page: Number(page),
  totalPages: Math.ceil(totalCount / limit)
});

  } catch (err) {
    console.error('Erreur lors de la récupération des matières:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des matières.' });
  }
};


// Récupérer les matières par niveau (Collège ou Lycée)
exports.getSubjectsByLevel = async (req, res) => {
  const { level } = req.query; // Récupérer le niveau depuis les paramètres de requête
  try {
    const subjects = await Subject.find({ level });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};