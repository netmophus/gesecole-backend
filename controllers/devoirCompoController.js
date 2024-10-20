const DevoirCompo = require('../models/DevoirCompo');
const Student = require('../models/Student');


    
const AcademicYear = require('../models/AcademicYear'); // Assurez-vous d'importer le modèle AcademicYear



// Controller pour récupérer les notes d'un élève
// exports.getStudentNotes = async (req, res) => {
//   try {
//     const { id } = req.params; // ID de l'élève

//     // Récupérer les notes de l'élève avec les matières et enseignants associés
//     const notes = await DevoirCompo.find({ student: id })
//       .populate('subject', 'name') // Peupler avec le nom de la matière
//       .populate('teacher', 'firstName lastName') // Peupler avec le nom de l'enseignant
//       .populate('classId', 'name level'); // Peupler avec la classe

//     if (!notes.length) {
//       return res.status(404).json({ msg: 'Aucune note trouvée pour cet élève.' });
//     }

//     res.status(200).json({ notes });
//   } catch (err) {
//     console.error('Erreur lors de la récupération des notes:', err);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des notes.' });
//   }
// };



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
//     const { studentId, classId, subject, type, note, coefficient, semester } = req.body;

//     // Afficher les données reçues dans le log pour le débogage
//     console.log('Données reçues par le backend:', req.body);

//     // Récupérer l'année académique active
//     const activeAcademicYear = await AcademicYear.findOne({ isActive: true });
//     if (!activeAcademicYear) {
//       return res.status(400).json({ msg: 'Aucune année académique active trouvée' });
//     }

//     const academicYear = `${activeAcademicYear.startYear}-${activeAcademicYear.endYear}`;  // Ex: "2023-2024"

//     // Validation des champs requis
//     if (!studentId || !classId || !subject || !type || !note || !semester) {
//       console.log('Erreur: Champs manquants', { studentId, classId, subject, type, note, semester });
//       return res.status(400).json({ msg: 'Tous les champs sont requis' });
//     }

//     // Vérification si l'étudiant appartient bien à la classe donnée
//     const student = await Student.findById(studentId);
//     if (!student || student.classId.toString() !== classId) {
//       console.log(`Erreur: Cet étudiant ne fait pas partie de cette classe. StudentId: ${studentId}, ClassId: ${classId}`);
//       return res.status(400).json({ msg: 'Cet étudiant ne fait pas partie de cette classe' });
//     }

//     // Vérifier l'existence d'un devoir ou d'une composition pour cet étudiant dans cette matière, type et semestre
//     const existingDevoir = await DevoirCompo.findOne({
//       student: studentId,
//       subject,
//       type,
//       semester,
//       academicYear,  // Année académique récupérée
//     });

//     if (existingDevoir) {
//       console.log('Erreur: Ce devoir/composition existe déjà pour cet élève, matière, type et semestre.');
//       return res.status(400).json({ msg: 'Ce devoir/composition existe déjà pour cet élève, cette matière et ce semestre.' });
//     }

//     // Création du Devoir ou Composition
//     const devoirCompo = new DevoirCompo({
//       student: studentId,
//       classId,
//       subject,
//       teacher: req.user._id,  // Utilisateur connecté (enseignant)
//       type,  // 'Devoir 1', 'Devoir 2', ou 'Composition'
//       note,
//       coefficient: coefficient || 1,  // Par défaut, coefficient = 1
//       semester,
//       academicYear,  // Ajouter l'année académique active ici
//     });

//     // Sauvegarder le devoir/composition
//     await devoirCompo.save();

//     console.log('Devoir/Composition créé avec succès:', devoirCompo);
//     return res.status(201).json({ msg: 'Devoir ou Composition créé avec succès', devoirCompo });

//   } catch (err) {
//     // Gestion des erreurs d'unicité (duplicate key)
//     if (err.code === 11000) {
//       console.error('Erreur d\'unicité détectée: Un devoir/composition existe déjà pour cet élève, matière, type et semestre.');
//       return res.status(400).json({ msg: 'Une note pour ce type de devoir/composition existe déjà pour cet élève dans cette matière et ce semestre.' });
//     }

//     // Autres erreurs
//     console.error('Erreur lors de la création du Devoir/Composition:', err);
//     return res.status(500).json({ msg: 'Erreur lors de la création du Devoir/Composition' });
//   }
// };

// Récupérer tous les Devoirs et Compositions
// exports.getDevoirCompos = async (req, res) => {
//   try {
//     const { classId, studentId, subjectId, semester , academicYear } = req.query;
//     let filter = {};

//     // Filtrage par classe, étudiant, matière ou semestre si présent
//     if (classId) filter.classId = classId;
//     if (studentId) filter.student = studentId;
//     if (subjectId) filter.subject = subjectId;
//     if (semester) filter.semester = semester;
//     if (academicYear) filter.academicYear = academicYear;  // Filtre par année scolaire

    

//     const devoirsCompos = await DevoirCompo.find(filter)
//   .populate('student', 'firstName lastName')
//   .populate('classId', 'name')  // S'assurer que classId est bien peuplé
//   .populate('subject', 'name')
//   .populate('teacher', 'nom');


//     res.status(200).json(devoirsCompos);
//   } catch (err) {
//     console.error('Erreur lors de la récupération des Devoirs/Compositions:', err);
//     res.status(500).json({ msg: 'Erreur lors de la récupération des Devoirs/Compositions' });
//   }
// };

exports.createDevoirCompo = async (req, res) => {
  try {
    const { studentId, classId, subject, type, note, coefficient, semester } = req.body;

    // Afficher les données reçues dans le log pour le débogage
    console.log('Données reçues par le backend:', req.body);

    // Récupérer l'année académique active
    const activeAcademicYear = await AcademicYear.findOne({ isActive: true });
    if (!activeAcademicYear) {
      return res.status(400).json({ msg: 'Aucune année académique active trouvée' });
    }

    const academicYear = `${activeAcademicYear.startYear}-${activeAcademicYear.endYear}`; // Ex: "2023-2024"

    // Validation des champs requis
    if (!studentId || !classId || !subject || !type || !note || !semester) {
      console.log('Erreur: Champs manquants', { studentId, classId, subject, type, note, semester });
      return res.status(400).json({ msg: 'Tous les champs sont requis' });
    }

    // Vérification si l'étudiant appartient bien à la classe donnée
    const student = await Student.findById(studentId);
    if (!student || student.classId.toString() !== classId) {
      console.log(`Erreur: Cet étudiant ne fait pas partie de cette classe. StudentId: ${studentId}, ClassId: ${classId}`);
      return res.status(400).json({ msg: 'Cet étudiant ne fait pas partie de cette classe' });
    }

    // Récupérer l'établissement de l'étudiant
    const establishmentId = student.establishmentId;

    // Vérifier l'existence d'un devoir ou d'une composition pour cet étudiant dans cette matière, type et semestre
    const existingDevoir = await DevoirCompo.findOne({
      student: studentId,
      subject,
      type,
      semester,
      academicYear,
      establishmentId,
    });

    if (existingDevoir) {
      console.log('Erreur: Ce devoir/composition existe déjà pour cet élève, matière, type et semestre.');
      return res.status(400).json({ msg: 'Ce devoir/composition existe déjà pour cet élève, cette matière et ce semestre.' });
    }

    // Création du Devoir ou Composition
    const devoirCompo = new DevoirCompo({
      student: studentId,
      classId,
      establishmentId, // Associer l'établissement au devoir/composition
      subject,
      teacher: req.user._id, // Utilisateur connecté (enseignant)
      type,
      note,
      coefficient: coefficient || 1,
      semester,
      academicYear,
    });

    // Sauvegarder le devoir/composition
    await devoirCompo.save();

    console.log('Devoir/Composition créé avec succès:', devoirCompo);
    return res.status(201).json({ msg: 'Devoir ou Composition créé avec succès', devoirCompo });

  } catch (err) {
    if (err.code === 11000) {
      console.error('Erreur d\'unicité détectée: Un devoir/composition existe déjà pour cet élève, matière, type et semestre.');
      return res.status(400).json({ msg: 'Une note pour ce type de devoir/composition existe déjà pour cet élève dans cette matière et ce semestre.' });
    }

    console.error('Erreur lors de la création du Devoir/Composition:', err);
    return res.status(500).json({ msg: 'Erreur lors de la création du Devoir/Composition' });
  }
};



exports.getDevoirCompos = async (req, res) => {
  try {
    const { classId, studentId, subjectId, semester, academicYear, establishmentId } = req.query;
    let filter = {};

    // Filtrage par classe, étudiant, matière, semestre, année académique et établissement si présent
    if (classId) filter.classId = classId;
    if (studentId) filter.student = studentId;
    if (subjectId) filter.subject = subjectId;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    if (establishmentId) filter.establishmentId = establishmentId; // Filtre par établissement

    const devoirsCompos = await DevoirCompo.find(filter)
      .populate('student', 'firstName lastName')
      .populate('classId', 'name') // S'assurer que classId est bien peuplé
      .populate('subject', 'name')
      .populate('teacher', 'nom');

    res.status(200).json(devoirsCompos);
  } catch (err) {
    console.error('Erreur lors de la récupération des Devoirs/Compositions:', err);
    res.status(500).json({ msg: 'Erreur lors de la récupération des Devoirs/Compositions' });
  }
};


// Récupérer un Devoir ou Composition par ID


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






