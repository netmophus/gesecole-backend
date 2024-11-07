const DevoirCompo = require('../models/DevoirCompo');
const Student = require('../models/Student');
   
const AcademicYear = require('../models/AcademicYear'); // Assurez-vous d'importer le modèle AcademicYear



exports.getStudentNotes = async (req, res) => {
  try {
    const { id } = req.params; // ID de l'élève

    // Récupérer les notes avec matières, enseignants, classe et établissement
    const notes = await DevoirCompo.find({ student: id })
      .populate('subject', 'name') // Matière
      .populate('teacher', 'firstName lastName') // Enseignant
      .populate('classId', 'name level') // Classe
      .populate({
        path: 'student',
        populate: {
          path: 'establishmentId',
          populate: { path: 'academicYears.yearId', select: 'startYear endYear' }
        }
      });

    if (!notes.length) {
      return res.status(404).json({ msg: 'Aucune note trouvée pour cet élève.' });
    }

    res.status(200).json({ notes });
  } catch (err) {
    console.error('Erreur lors de la récupération des notes:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des notes.' });
  }
};


// exports.createDevoirCompo = async (req, res) => {
//   try {
//     const devoirsData = req.body; // Le frontend doit envoyer un tableau de devoirs
//     const createdDevoirs = [];

//     console.log('Données reçues du frontend:', devoirsData);

//     // Vérifier si des données sont envoyées sous forme de tableau
//     if (!Array.isArray(devoirsData) || devoirsData.length === 0) {
//       console.error('Erreur: Les données doivent être un tableau de devoirs/compositions.');
//       return res.status(400).json({ msg: 'Les données doivent être un tableau de devoirs/compositions.' });
//     }


//     const establishmentId = Student.establishmentId;  // Intégration de l'établissement
// if (!establishmentId) {
//   console.error('Erreur: Aucun établissement trouvé pour cet étudiant.');
//   return res.status(400).json({ msg: 'Aucun établissement trouvé pour cet étudiant' });
// }

//     // Récupérer l'année académique active
//     const activeAcademicYear = await AcademicYear.findOne({ isActive: true });
//     if (!activeAcademicYear) {
//       console.error('Erreur: Aucune année académique active trouvée.');
//       return res.status(400).json({ msg: 'Aucune année académique active trouvée' });
//     }

//     const academicYear = `${activeAcademicYear.startYear}-${activeAcademicYear.endYear}`; // Ex: "2023-2024"
//     console.log('Année académique active:', academicYear);

//     // Traiter chaque note dans le tableau
//     for (let devoirData of devoirsData) {
//       console.log('Traitement du devoir:', devoirData);

//       const { studentId, classId, subject, type, note, coefficient, semester } = devoirData;

//       // Validation des champs requis
//       if (!studentId || !classId || !subject || !type || !note || !semester) {
//         console.error('Erreur: Champs manquants', { studentId, classId, subject, type, note, semester });
//         return res.status(400).json({ msg: 'Tous les champs sont requis' });
//       }

//       // Vérification si l'étudiant appartient bien à la classe donnée
//       const student = await Student.findById(studentId);
//       if (!student || student.classId.toString() !== classId) {
//         console.error(`Erreur: Cet étudiant ne fait pas partie de cette classe. StudentId: ${studentId}, ClassId: ${classId}`);
//         return res.status(400).json({ msg: 'Cet étudiant ne fait pas partie de cette classe' });
//       }

//       // Récupérer l'établissement de l'étudiant
//       const establishmentId = student.establishmentId;

//       // Vérifier l'existence d'un devoir ou d'une composition pour cet étudiant dans cette matière, type et semestre
//       const existingDevoir = await DevoirCompo.findOne({
//         student: studentId,
//         subject,
//         type,
//         semester,
//         academicYear,
//         establishmentId,
//       });

//       if (existingDevoir) {
//         console.error('Erreur: Ce devoir/composition existe déjà pour cet élève, matière, type et semestre.');
//         return res.status(400).json({ msg: 'Ce devoir/composition existe déjà pour cet élève, cette matière et ce semestre.' });
//       }

//       // Création du Devoir ou Composition
//       console.log('Création du devoir avec les données:', {
//         studentId,
//         classId,
//         establishmentId,
//         subject,
//         teacher: req.user._id,
//         type,
//         note,
//         coefficient: coefficient || 1,
//         semester,
//         academicYear,
//       });

//       const devoirCompo = new DevoirCompo({
//         student: studentId,
//         classId,
//         establishmentId,
//         subject,
//         teacher: req.user._id,
//         type,
//         note,
//         coefficient: coefficient || 1,
//         semester,
//         academicYear,
//       });

//       // Sauvegarder le devoir/composition
//       const savedDevoir = await devoirCompo.save();
//       console.log('Devoir/Composition sauvegardé:', savedDevoir);
//       createdDevoirs.push(savedDevoir);
//     }

//     console.log('Devoirs/Compositions créés avec succès:', createdDevoirs);
//     return res.status(201).json({ msg: 'Devoirs/Compositions créés avec succès', createdDevoirs });

//   } catch (err) {
//     console.error('Erreur lors de la création des Devoirs/Compositions:', err);
//     return res.status(500).json({ msg: 'Erreur lors de la création des Devoirs/Compositions' });
//   }
// };

exports.createDevoirCompo = async (req, res) => {
  try {
    const devoirsData = req.body;
    const createdDevoirs = [];

    console.log('Données reçues du frontend:', devoirsData);

    // Vérifier si des données sont envoyées sous forme de tableau
    if (!Array.isArray(devoirsData) || devoirsData.length === 0) {
      console.error('Erreur: Les données doivent être un tableau de devoirs/compositions.');
      return res.status(400).json({ msg: 'Les données doivent être un tableau de devoirs/compositions.' });
    }

    // Récupérer l'année académique active
    const activeAcademicYear = await AcademicYear.findOne({ isActive: true });
    if (!activeAcademicYear) {
      console.error('Erreur: Aucune année académique active trouvée.');
      return res.status(400).json({ msg: 'Aucune année académique active trouvée' });
    }

    const academicYear = `${activeAcademicYear.startYear}-${activeAcademicYear.endYear}`;
    console.log('Année académique active:', academicYear);

    for (let devoirData of devoirsData) {
      console.log('Traitement du devoir:', devoirData);

      const { studentId, classId, subject, type, note, coefficient, semester } = devoirData;

      if (!studentId || !classId || !subject || !type || !note || !semester) {
        console.error('Erreur: Champs manquants', { studentId, classId, subject, type, note, semester });
        return res.status(400).json({ msg: 'Tous les champs sont requis' });
      }

      const student = await Student.findById(studentId);
      if (!student) {
        console.error(`Erreur: Étudiant non trouvé. StudentId: ${studentId}`);
        return res.status(400).json({ msg: 'Étudiant non trouvé' });
      }

      if (student.classId.toString() !== classId) {
        console.error(`Erreur: Cet étudiant ne fait pas partie de cette classe. StudentId: ${studentId}, ClassId: ${classId}`);
        return res.status(400).json({ msg: 'Cet étudiant ne fait pas partie de cette classe' });
      }

      // Récupérer l'établissement de l'étudiant
      const establishment = student.establishmentId;
      if (!establishment) {
        console.error('Erreur: Aucun établissement trouvé pour cet étudiant.');
        return res.status(400).json({ msg: 'Aucun établissement trouvé pour cet étudiant' });
      }

      const existingDevoir = await DevoirCompo.findOne({
        student: studentId,
        subject,
        type,
        semester,
        academicYear,
        establishment,
      });

      if (existingDevoir) {
        console.error('Erreur: Ce devoir/composition existe déjà pour cet élève, matière, type et semestre.');
        return res.status(400).json({ msg: 'Ce devoir/composition existe déjà pour cet élève, cette matière et ce semestre.' });
      }

      console.log('Création du devoir avec les données:', {
        studentId,
        classId,
        establishment,  // Utilisation correcte de `establishment`
        subject,
        teacher: req.user._id,
        type,
        note,
        coefficient: coefficient || 1,
        semester,
        academicYear,
      });

      const devoirCompo = new DevoirCompo({
        student: studentId,
        classId,
        establishment,  // Correction ici
        subject,
        teacher: req.user._id,
        type,
        note,
        coefficient: coefficient || 1,
        semester,
        academicYear,
      });

      const savedDevoir = await devoirCompo.save();
      console.log('Devoir/Composition sauvegardé:', savedDevoir);
      createdDevoirs.push(savedDevoir);
    }

    console.log('Devoirs/Compositions créés avec succès:', createdDevoirs);
    return res.status(201).json({ msg: 'Devoirs/Compositions créés avec succès', createdDevoirs });

  } catch (err) {
    console.error('Erreur lors de la création des Devoirs/Compositions:', err);
    return res.status(500).json({ msg: 'Erreur lors de la création des Devoirs/Compositions' });
  }
};





exports.getDevoirCompos = async (req, res) => {
  try {
    const { classId, studentId, subjectId, semester, academicYear, establishmentId } = req.query;
    let filter = {};

    // Construire l'objet filter en fonction des paramètres de requête
    if (classId) filter.classId = classId;
    if (studentId) filter.student = studentId;
    if (subjectId) filter.subject = subjectId;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    if (establishmentId) filter.establishmentId = establishmentId;

    // Log du filtre construit
    console.log('Filtre utilisé pour la requête:', filter);

    // Récupérer les devoirs/compositions en appliquant le filtre
    const devoirsCompos = await DevoirCompo.find(filter)
      .populate('student', 'firstName lastName') // Peupler les informations de l'étudiant
      .populate('classId', 'name') // Peupler les informations de la classe
      .populate('subject', 'name') // Peupler les informations de la matière
      .populate('teacher', 'nom'); // Peupler les informations de l'enseignant

    // Log des données récupérées
    console.log('Devoirs/Compositions récupérés:', devoirsCompos);

    // Retourner les devoirs trouvés
    res.status(200).json(devoirsCompos);
  } catch (err) {
    console.error('Erreur lors de la récupération des Devoirs/Compositions:', err);
    res.status(500).json({ msg: 'Erreur lors de la récupération des Devoirs/Compositions' });
  }
};





exports.getDevoirCompoById = async (req, res) => {
  try {
    const devoirCompo = await DevoirCompo.findById(req.params.id)
      .populate('student', 'firstName lastName')  // Correction ici
      .populate('classId', 'name')
      .populate('subject', 'name')  // Correction ici
      .populate('teacher', 'nom');  // Correction ici

    if (!devoirCompo) {
      return res.status(404).json({ msg: 'Devoir ou Composition non trouvé' });
    }

    res.status(200).json(devoirCompo);
  } catch (err) {
    console.error('Erreur lors de la récupération du Devoir/Composition:', err);
    res.status(500).json({ msg: 'Erreur lors de la récupération du Devoir/Composition' });
  }
};


// Mettre à jour un Devoir ou une Composition

exports.updateDevoirCompo = async (req, res) => {
  try {
    const { studentId, classId, subjectId, type, note, coefficient, semester , academicYear } = req.body;

    const devoirCompo = await DevoirCompo.findById(req.params.id);

    if (!devoirCompo) {
      return res.status(404).json({ msg: 'Devoir ou Composition non trouvé' });
    }

    // Mettre à jour les informations
    devoirCompo.student = studentId || devoirCompo.student;  // Correction ici
    devoirCompo.classId = classId || devoirCompo.classId;
    devoirCompo.subject = subjectId || devoirCompo.subject;  // Correction ici
    devoirCompo.type = type || devoirCompo.type;
    devoirCompo.note = note || devoirCompo.note;
    devoirCompo.coefficient = coefficient || devoirCompo.coefficient;
    devoirCompo.semester = semester || devoirCompo.semester;
    devoirCompo.academicYear = academicYear || devoirCompo.academicYear;  // Mettre à jour l'année scolaire

    await devoirCompo.save();

    res.status(200).json({ msg: 'Devoir ou Composition mis à jour avec succès', devoirCompo });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du Devoir/Composition:', err);
    res.status(500).json({ msg: 'Erreur lors de la mise à jour du Devoir/Composition' });
  }
};


// Supprimer un Devoir ou une Composition
exports.deleteDevoirCompo = async (req, res) => {
  try {
    console.log('ID du devoir/composition à supprimer:', req.params.id);  // Log pour l'ID

    const devoirCompo = await DevoirCompo.findByIdAndDelete(req.params.id);

    if (!devoirCompo) {
      return res.status(404).json({ msg: 'Devoir ou Composition non trouvé' });
    }

    res.status(200).json({ msg: 'Devoir ou Composition supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du Devoir/Composition:', err);
    res.status(500).json({ msg: 'Erreur lors de la suppression du Devoir/Composition' });
  }
};



exports.getActiveAcademicYear = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true }); // Rechercher l'année académique active
    if (!activeYear) {
      return res.status(404).json({ msg: "Aucune année académique active trouvée." });
    }
    res.status(200).json(activeYear);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'année académique active:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération de l\'année académique active.' });
  }
};



exports.getStudentNotes = async (req, res) => {
  try {
    const { id } = req.params; // ID de l'élève
    const notes = await DevoirCompo.find({ student: id })
      .populate('subject', 'name') 
      .populate('teacher', 'firstName lastName')
      .populate('classId', 'name level');

    if (!notes.length) {
      return res.status(404).json({ msg: 'Aucune note trouvée pour cet élève.' });
    }

    res.status(200).json({ notes });
  } catch (err) {
    console.error('Erreur lors de la récupération des notes:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des notes.' });
  }
};





// Fonction pour calculer la moyenne d'un élève pour une matière et un semestre spécifique
exports.calculateAverageForSubject = async (req, res) => {
    try {
        const { studentId, subjectId, semester } = req.params; // ID de l'élève, matière et semestre à partir des paramètres d'URL

        // Récupérer les devoirs/compositions de l'élève pour la matière et le semestre donnés
        const notes = await DevoirCompo.find({
            student: studentId,
            subject: subjectId,
            semester: semester
        });

        // Vérifier si des notes existent
        if (!notes.length) {
            return res.status(404).json({ msg: 'Aucune note trouvée pour cet élève dans cette matière et ce semestre.' });
        }

        // Calculer la somme pondérée des notes et le total des coefficients
        let sumOfWeightedNotes = 0;
        let totalCoefficient = 0;

        notes.forEach(note => {
            sumOfWeightedNotes += note.note * note.coefficient;
            totalCoefficient += note.coefficient;
        });

        // Calculer la moyenne
        const average = sumOfWeightedNotes / totalCoefficient;

        // Retourner la moyenne calculée
        res.status(200).json({ average });
    } catch (err) {
        console.error('Erreur lors du calcul de la moyenne:', err);
        res.status(500).json({ msg: 'Erreur du serveur lors du calcul de la moyenne.' });
    }
};





// Ajouter cette méthode dans devoirCompoController.js
exports.getAverageBySubjectAndSemester = async (req, res) => {
  try {
    const { studentId, subjectId, semester } = req.params;

    // Récupérer tous les devoirs/compositions d'un élève pour une matière et un semestre
    const devoirs = await DevoirCompo.find({
      student: studentId,
      subject: subjectId,
      semester: semester
    });

    if (!devoirs.length) {
      return res.status(404).json({ msg: 'Aucune note trouvée pour cet élève dans cette matière et ce semestre.' });
    }

    // Calculer la moyenne pondérée
    let total = 0;
    let coefficientSum = 0;

    devoirs.forEach(devoir => {
      total += devoir.note * (devoir.coefficient || 1);
      coefficientSum += (devoir.coefficient || 1);
    });

    const average = (total / coefficientSum).toFixed(2);

    res.status(200).json({ average });
  } catch (err) {
    console.error('Erreur lors du calcul de la moyenne:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors du calcul de la moyenne.' });
  }
};




