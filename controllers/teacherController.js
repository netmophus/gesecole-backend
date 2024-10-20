
const Teacher = require('../models/Teacher');
const TeacherSubject = require('../models/TeacherSubject');
const mongoose = require('mongoose'); // Assurez-vous que cette ligne est présente
// Créer un nouvel enseignant
const Subject = require('../models/Subject');

const fs = require('fs');
const path = require('path');




// Fonction pour créer un enseignant

exports.createTeacher = async (req, res) => {
  try {
    console.log('Données reçues :', req.body);
    console.log('Fichier reçu :', req.file);  // Vérifier le fichier reçu

    const { nom, telephone, email, educationLevel } = req.body;

    // Assurer que le champ téléphone est bien rempli
    if (!telephone || telephone.trim() === '') {
      return res.status(400).json({ msg: 'Le champ téléphone est requis.' });
    }

    // Vérifier s'il existe déjà un enseignant avec ce numéro de téléphone dans cet établissement
    const existingTeacher = await Teacher.findOne({ telephone, establishmentId: req.user.schoolId });
    if (existingTeacher) {
      return res.status(400).json({ msg: 'Ce numéro de téléphone est déjà utilisé pour cet établissement.' });
    }

    // Gestion de la photo
    let photo = null;
    if (req.file) {
      photo = req.file.path;  // Récupère le chemin de la photo uploadée
    }

    const newTeacher = new Teacher({
      nom,
      telephone,
      email,
      educationLevel,
      establishmentId: req.user.schoolId,
      photo  // Enregistre la photo dans la base de données
    });

    await newTeacher.save();
    res.status(201).json({
      msg: 'Enseignant créé avec succès',
      teacher: newTeacher
    });
  } catch (err) {
    console.error('Erreur lors de la création de l\'enseignant:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la création de l\'enseignant.', error: err.message });
  }
};








exports.getTeachers = async (req, res) => {
  console.log('Requête reçue pour getTeachers:', req.query);

  const { search, establishmentId, educationLevel } = req.query;
  const page = parseInt(req.query.page) || 1;  // Définir à 1 si non fourni ou non valide
  const limit = parseInt(req.query.limit) || 10;  // Définir à 10 si non fourni ou non valide
  const skip = (page - 1) * limit;

  console.log('Establishment ID reçu:', establishmentId);
  console.log('Education Level reçu:', educationLevel);

  if (!establishmentId) {
    console.error("L'identifiant de l'établissement est manquant.");
    return res.status(400).json({ msg: "L'identifiant de l'établissement est requis." });
  }

  try {
    console.log('Début de la récupération des enseignants pour l\'établissement:', establishmentId);

    // Convertir establishmentId en ObjectId
    const establishmentObjectId = new mongoose.Types.ObjectId(establishmentId);

    // Ajouter un filtre pour le niveau d'enseignement et la recherche
    const filter = { establishmentId: establishmentObjectId };
    
    if (educationLevel) {
      filter.educationLevel = educationLevel;
    }

    if (search) {
      // Utilisez une expression régulière pour rechercher dans les champs pertinents (nom, téléphone, email)
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { téléphone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Récupérer le nombre total d'enseignants correspondant aux filtres
    const totalTeachers = await Teacher.countDocuments(filter);

    // Récupérer les enseignants en fonction des filtres et de la pagination
    const teachers = await Teacher.find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    // Récupérer les matières associées à chaque enseignant via la collection TeacherSubject
    const teacherIds = teachers.map(teacher => teacher._id);
    const subjects = await TeacherSubject.find({ teacher: { $in: teacherIds } })
      .populate('subject')
      .exec();

    // Associer les matières aux enseignants
    const teachersWithSubjects = teachers.map(teacher => {
      const teacherSubjects = subjects.filter(subject => subject.teacher.toString() === teacher._id.toString());
      return { ...teacher.toObject(), matières: teacherSubjects.map(subject => subject.subject) };
    });

    console.log(`Nombre d'enseignants récupérés: ${teachersWithSubjects.length}`);

    res.status(200).json({ teachers: teachersWithSubjects, totalCount: totalTeachers });
  } catch (err) {
    console.error('Erreur lors de la récupération des enseignants:', err);
    res.status(500).json({ msg: `Erreur lors de la récupération des enseignants: ${err.message}` });
  }
};



exports.getTeacherSubjects = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const subjects = await TeacherSubject.find({ teacher: teacherId })
      .populate('subject')  // Peupler les informations de la matière
      .exec();

    if (!subjects) {
      return res.status(404).json({ msg: 'Aucune matière trouvée pour cet enseignant.' });
    }

    res.status(200).json(subjects.map((ts) => ts.subject)); // Renvoyer uniquement les matières
  } catch (err) {
    console.error('Erreur lors de la récupération des matières:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};







// exports.updateTeacher = async (req, res) => {
//   try {
//     // Vérification des permissions
//     if (!req.user.permissions.update) {
//       return res.status(403).json({ msg: "Accès refusé : vous n'avez pas la permission de modifier un enseignant." });
//     }

//     const { id } = req.params;
//     const { nom, telephone, email, matières, establishmentId, educationLevel } = req.body;

//     // Vérification des champs requis
//     if (!nom || !telephone || !establishmentId || !educationLevel) {
//       return res.status(400).json({ msg: 'Les champs requis sont manquants.' });
//     }

//     // Rechercher l'enseignant actuel par son ID
//     const teacher = await Teacher.findById(id);
//     if (!teacher) {
//       return res.status(404).json({ msg: 'Enseignant non trouvé.' });
//     }

//     // Vérifier uniquement si le numéro de téléphone a changé
//     if (telephone !== teacher.telephone) {
//       const existingTeacher = await Teacher.findOne({ telephone, establishmentId });
      
//       // Si un autre enseignant a ce numéro de téléphone, renvoie une erreur
//       if (existingTeacher && existingTeacher._id.toString() !== id) {
//         return res.status(400).json({ msg: 'Ce numéro de téléphone est déjà utilisé pour cet établissement.' });
//       }
//     }

//     // Mise à jour des champs standards
//     teacher.nom = nom;
//     teacher.telephone = telephone;  // Mettre à jour seulement si le téléphone est modifié
//     teacher.email = email;
//     teacher.establishmentId = establishmentId;
//     teacher.educationLevel = educationLevel;

//     // Mise à jour de la photo si une nouvelle photo a été uploadée
//     if (req.file) {
//       teacher.photo = req.file.path;  // Mettre à jour la photo uniquement si une nouvelle photo est uploadée
//     }

//     await teacher.save();

//     // Mise à jour des matières
//     if (matières && matières.length > 0) {
//       await TeacherSubject.deleteMany({ teacher: id });
//       const teacherSubjects = matières.map(subjectId => ({ teacher: id, subject: subjectId, establishmentId }));
//       await TeacherSubject.insertMany(teacherSubjects);
//     }

//     res.status(200).json({ msg: 'Enseignant mis à jour avec succès', teacher });
//   } catch (err) {
//     res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de l\'enseignant. Veuillez réessayer plus tard.' });
//   }
// };



exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, telephone, email, educationLevel } = req.body;

    // Vérification minimale des champs à mettre à jour
    if (!nom || !educationLevel) {
      return res.status(400).json({ msg: 'Les champs requis sont manquants.' });
    }

    // Recherche de l'enseignant par son ID
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ msg: 'Enseignant non trouvé.' });
    }

    // Mise à jour des champs
    teacher.nom = nom;
    teacher.educationLevel = educationLevel;

    // Mise à jour de l'email si modifié
    if (email) {
      teacher.email = email;
    }

    // Mise à jour du téléphone si modifié
    if (telephone && telephone !== teacher.telephone) {
      const existingTeacher = await Teacher.findOne({ telephone, establishmentId: teacher.establishmentId });
      if (existingTeacher && existingTeacher._id.toString() !== id) {
        return res.status(400).json({ msg: 'Ce numéro de téléphone est déjà utilisé.' });
      }
      teacher.telephone = telephone;
    }

    // Mise à jour de la photo si une nouvelle est uploadée
    if (req.file) {
      teacher.photo = req.file.path;
    }

    await teacher.save();
    res.status(200).json({ msg: 'Enseignant mis à jour avec succès', teacher });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de l\'enseignant.' });
  }
};






exports.deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;

    // Récupérer l'enseignant avant de le supprimer
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ msg: "Enseignant non trouvé." });
    }

    // Supprimer la photo associée si elle existe
    if (teacher.photo) {
      const photoPath = path.join(__dirname, '..', teacher.photo); // Construire le chemin complet du fichier
      fs.unlink(photoPath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de la photo:', err.message);
        } else {
          console.log('Photo supprimée:', teacher.photo);
        }
      });
    }

    // Supprimer l'enseignant de la base de données
    await Teacher.findByIdAndDelete(teacherId);

    res.status(200).json({ msg: "Enseignant supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'enseignant:", error.message);
    res.status(500).json({ msg: "Erreur du serveur lors de la suppression de l'enseignant." });
  }
};





exports.assignSubjectsToTeacher = async (req, res) => {
  try {
    const { teacherId, subjectIds, establishmentId } = req.body;

    if (!teacherId || !subjectIds || !establishmentId) {
      return res.status(400).json({ msg: 'Les champs teacherId, subjectIds, et establishmentId sont requis.' });
    }

    // Vérification de l'existence de l'enseignant
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ msg: 'Enseignant non trouvé.' });
    }

    // Récupérer les matières déjà assignées
    const assignedSubjects = await TeacherSubject.find({ teacher: teacherId });

    // Extraire les IDs des matières déjà assignées
    const alreadyAssignedSubjectIds = assignedSubjects.map((subject) => subject.subject.toString());

    // Vérifier si certaines des nouvelles matières sont déjà assignées
    const duplicateSubjects = subjectIds.filter((subjectId) => alreadyAssignedSubjectIds.includes(subjectId));

    if (duplicateSubjects.length > 0) {
      return res.status(400).json({ msg: 'Certaines matières sont déjà assignées : ' + duplicateSubjects.join(', ') });
    }

    // Filtrer uniquement les nouvelles matières qui ne sont pas encore assignées
    const newSubjectIds = subjectIds.filter((subjectId) => !alreadyAssignedSubjectIds.includes(subjectId));

    // Vérifier que toutes les matières à ajouter sont actives
    const activeSubjects = await Subject.find({ 
      _id: { $in: newSubjectIds },
      isActive: true 
    });

    if (activeSubjects.length !== newSubjectIds.length) {
      return res.status(400).json({ msg: 'Une ou plusieurs matières sélectionnées ne sont pas activées.' });
    }

    // Créer de nouvelles associations matière-enseignant
    const teacherSubjects = activeSubjects.map(subject => ({
      teacher: teacherId,
      subject: subject._id,
      establishmentId,
    }));

    // Ajouter uniquement les nouvelles matières
    await TeacherSubject.insertMany(teacherSubjects);

    res.status(200).json({ msg: 'Nouvelles matières assignées avec succès.' });
  } catch (err) {
    console.error('Erreur lors de l\'assignation des matières à l\'enseignant:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de l\'assignation des matières.' });
  }
};



// Supprimer une matière associée à un enseignant
exports.removeSubjectFromTeacher = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.params;

    // Vérifiez si l'enseignant existe
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ msg: 'Enseignant non trouvé' });
    }

    // Supprimer l'association entre l'enseignant et la matière
    await TeacherSubject.deleteOne({ teacher: teacherId, subject: subjectId });

    res.status(200).json({ msg: 'Matière supprimée avec succès de l\'enseignant' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la matière associée:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la suppression de la matière associée. Veuillez réessayer plus tard.' });
  }
};
