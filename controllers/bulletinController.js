const Bulletin = require('../models/Bulletin');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Class = require('../models/Class');  // Ajoutez cette ligne pour importer le modèle Class 
const mongoose = require('mongoose');


exports.createBulletin = async (req, res) => {
  console.log('Données reçues:', req.body);

  try {
    const { studentId, classId, year, period, subjects, conductGrade, disciplineGrade, absences, behavior } = req.body;
    const establishmentId = req.user.schoolId; // Récupérer l'établissement de l'utilisateur connecté

    // Vérification des champs requis
    if (!studentId || !classId || !year || !period || !Array.isArray(subjects) || subjects.length === 0) {
      console.error('Champ manquant ou incorrect:', { studentId, classId, year, period, subjects });
      return res.status(400).json({ msg: 'Veuillez fournir tous les champs requis et valides' });
    }

    console.log('Vérification des données reçues pour l\'établissement:', establishmentId);

    // Vérifier que l'étudiant appartient à l'établissement de l'utilisateur
    const student = await Student.findOne({ _id: studentId, establishmentId }).select('firstName lastName photo');
    if (!student) {
      console.error(`Étudiant non trouvé ou ne fait pas partie de cet établissement: ${studentId}, établissement: ${establishmentId}`);
      return res.status(400).json({ msg: 'Étudiant non trouvé ou ne fait pas partie de cet établissement' });
    }

    console.log(`Étudiant trouvé: ${student.firstName} ${student.lastName}, vérification de la classe maintenant.`);

    // Vérifier que la classe appartient à l'établissement de l'utilisateur
    const classInfo = await Class.findOne({ _id: classId, establishment: establishmentId });
    if (!classInfo) {
      console.error(`Classe non trouvée ou ne fait pas partie de cet établissement: ${classId}, établissement: ${establishmentId}`);
      return res.status(400).json({ msg: 'Classe non trouvée ou ne fait pas partie de cet établissement' });
    }

    console.log(`Classe trouvée: ${classInfo.name}, établissement: ${establishmentId}. Continuer avec la création du bulletin.`);

    // Calcul des notes et coefficients
    const parsedConductGrade = parseFloat(conductGrade) || 0;
    const parsedDisciplineGrade = parseFloat(disciplineGrade) || 0;

    const totalNotes = subjects.reduce((acc, subject) => acc + (parseFloat(subject.grade) || 0) * (parseFloat(subject.coefficient) || 0), 0);
    const totalCoefficients = subjects.reduce((acc, subject) => acc + (parseFloat(subject.coefficient) || 0), 0);

    if (totalCoefficients === 0) {
      console.error('Le total des coefficients est zéro.');
      return res.status(400).json({ msg: 'Le total des coefficients ne peut pas être zéro' });
    }

    const definitiveTotal = totalNotes + parsedConductGrade - parsedDisciplineGrade;
    const semesterAverage = (definitiveTotal / (totalCoefficients + 1)).toFixed(2); // Inclus la conduite dans le calcul

    if (isNaN(definitiveTotal) || isNaN(semesterAverage)) {
      console.error('Erreur dans les calculs:', { definitiveTotal, semesterAverage });
      return res.status(400).json({ msg: 'Erreur dans le calcul des notes. Vérifiez les données envoyées.' });
    }

    // Préparer la structure des semestres
    const semestres = {
      'Semestre 1': {},
      'Semestre 2': {},
    };

    // Ajouter les informations pour le semestre en cours
    semestres[period] = {
      totalNotes,
      totalCoefficients,
      noteConduite: parsedConductGrade,
      noteDiscipline: parsedDisciplineGrade,
      totalDefinitif: definitiveTotal,
      moyenneSemestrielle: parseFloat(semesterAverage),
      absences: absences || {},
      behavior: behavior || [],
      semesterRank: 0, // Rang initial, sera mis à jour plus tard
    };

    // Créer et sauvegarder le bulletin
    const bulletin = new Bulletin({
      student: studentId,
      studentPhoto: student.photo,  // Ajoute la photo ici
      classId,
      establishmentId,
      year,
      period,
      subjects,
      conductGrade: parsedConductGrade,
      disciplineGrade: parsedDisciplineGrade,
      totalNotes,
      totalCoefficients,
      definitiveTotal: parseFloat(definitiveTotal),
      semesterAverage: parseFloat(semesterAverage),
      semestres, // Stockage des informations pour les semestres
    });

    await bulletin.save();
    console.log(`Bulletin créé avec succès pour l'élève: ${student.firstName} ${student.lastName} dans la classe: ${classInfo.name}.`);

    // Mettre à jour le classement pour le semestre en cours
    await updateSemesterRank(bulletin, period, classId, year);

    res.status(201).json(bulletin);
  } catch (err) {
    console.error('Erreur lors de la création du bulletin:', err);
    res.status(500).json({ msg: 'Erreur lors de la création du bulletin' });
  }
};



//====================================




// Fonction pour récupérer les élèves par classe

exports.getStudentsByClass = async (req, res) => {
  const { classId } = req.params;

  try {
    // Rechercher tous les élèves qui appartiennent à la classe donnée
    const students = await Student.find({ classId });

    // Vérifier si des élèves ont été trouvés
    if (students.length === 0) {
      return res.status(404).json({ msg: "Aucun élève trouvé pour cette classe." });
    }

    // Renvoyer les élèves trouvés
    res.status(200).json(students);
  } catch (err) {
    console.error('Erreur lors de la récupération des élèves:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des élèves.' });
  }
};




const updateSemesterRank = async (newBulletin, period, classId, year) => {
  try {
    // Récupérer tous les bulletins pour la même classe, année et semestre (période)
    const bulletins = await Bulletin.find({ classId, year, period });

    // Trier les bulletins par moyenne semestrielle décroissante
    bulletins.sort((a, b) => {
      const avgA = a.semestres[period]?.moyenneSemestrielle || 0; // Correspond à Semestre 1 ou Semestre 2
      const avgB = b.semestres[period]?.moyenneSemestrielle || 0; // Correspond à Semestre 1 ou Semestre 2
      return avgB - avgA; // Trier en ordre décroissant (moyenne la plus haute en premier)
    });

    // Mettre à jour le rang de chaque bulletin pour le semestre
    for (let i = 0; i < bulletins.length; i++) {
      bulletins[i].semestres[period].semesterRank = i + 1; // Mettre à jour le classement semestriel
      await bulletins[i].save(); // Sauvegarder chaque bulletin mis à jour
    }

    console.log(`Classement semestriel mis à jour pour la classe ${classId}, semestre ${period}, année ${year}`);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du classement semestriel:', err);
  }
};






//=========================

exports.getBulletins = async (req, res) => {
  console.log('Start: Fetching bulletins with query:', req.query);
  try {
    const { search, page = 1, limit = 5 } = req.query;
    const establishmentId = req.user.schoolId; // Ajoutez ceci pour récupérer l'ID de l'établissement connecté
    const query = { establishmentId }; // Filtrez par establishmentId

    if (search) {
      query.$or = [
        { 'student.firstName': { $regex: search, $options: 'i' } },
        { 'student.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Database query:', query);

    const bulletins = await Bulletin.find(query)
      .populate('student', 'firstName lastName  dateOfBirth photo')
      .populate('classId', 'name')
      .populate({
        path: 'subjects.subject', // Populate subjects details
        select: 'name level',     // Assurez-vous que cela correspond aux champs nécessaires dans le modèle 'Subject'
      })
      .populate({
        path: 'subjects.teacher', // Populate teacher details
        select: 'nom',
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log('Bulletins retrieved:', bulletins);

    bulletins.forEach((bulletin, index) => {
      console.log(`Bulletin ${index + 1}:`);
      console.log(`  Student: ${bulletin.student ? bulletin.student.firstName + ' ' + bulletin.student.lastName : 'Not populated'}`);
      console.log(`  Class: ${bulletin.classId ? bulletin.classId.name : 'Not populated'}`);
      bulletin.subjects.forEach((subject, subIndex) => {
        console.log(`    Subject ${subIndex + 1}:`);
        console.log(`      Subject Details: ${subject.subject ? subject.subject.name + ', ' + subject.subject.level : 'Not populated'}`);
        console.log(`      Teacher: ${subject.teacher ? subject.teacher.nom : 'Not populated'}`);
      });
    });

    res.status(200).json(bulletins);
  } catch (err) {
    console.error('Error in getBulletins:', err.message);
    res.status(500).json({ msg: 'Erreur lors de la récupération des bulletins' });
  } finally {
    console.log('End: getBulletins');
  }
};



//------------------------


// Nouvelle méthode pour récupérer les enseignants et les matières
exports.getBulletinData = async (req, res) => {
  try {
    const { establishmentId } = req.query;

    if (!establishmentId) {
      return res.status(400).json({ msg: "L'identifiant de l'établissement est requis." });
    }

    // Récupérer les enseignants et les matières pour l'établissement
    const teachers = await Teacher.find({ establishmentId });
    const subjects = await Subject.find({ establishmentId });

    res.status(200).json({ teachers, subjects });
  } catch (err) {
    console.error('Erreur lors de la récupération des données pour le bulletin:', err.message);
    res.status(500).json({ msg: 'Erreur lors de la récupération des données.' });
  }
};


//==============================

exports.updateBulletin = async (req, res) => {
  try {
    const { id } = req.params; // Récupérer l'ID du bulletin à partir des paramètres de l'URL
    const { studentId, classId, year, period, subjects, conductGrade, disciplineGrade, absences, behavior } = req.body;

    // Vérification de la présence des champs requis
    if (!studentId || !classId || !year || !period || !subjects) {
      console.error('Champ manquant:', { studentId, classId, year, period, subjects });
      return res.status(400).json({ msg: 'Veuillez fournir tous les champs requis' });
    }

    // Trouver le bulletin à mettre à jour par son ID
    const bulletin = await Bulletin.findById(id);

    if (!bulletin) {
      return res.status(404).json({ msg: 'Bulletin non trouvé' });
    }

    // Parsing et calculs des grades
    const parsedConductGrade = parseFloat(conductGrade) || 0;
    const parsedDisciplineGrade = parseFloat(disciplineGrade) || 0;

    // Calcul des notes et des coefficients
    const totalNotes = subjects.reduce(
      (acc, subject) => acc + (parseFloat(subject.grade) || 0) * (parseFloat(subject.coefficient) || 0),
      0
    );
    const totalCoefficients = subjects.reduce(
      (acc, subject) => acc + (parseFloat(subject.coefficient) || 0),
      0
    );

    if (totalCoefficients === 0) {
      console.error('Le total des coefficients est zéro.');
      return res.status(400).json({ msg: 'Le total des coefficients ne peut pas être zéro' });
    }

    // Calcul de la moyenne semestrielle (nouveau calcul basé sur le semestre)
    const definitiveTotal = totalNotes + parsedConductGrade - parsedDisciplineGrade;
    const semesterAverage = (definitiveTotal / (totalCoefficients + 1)).toFixed(2); // Modifier ici pour la moyenne semestrielle

    // Mise à jour des champs du bulletin
    bulletin.student = studentId;
    bulletin.classId = classId;
    bulletin.year = year;
    bulletin.period = period;
    bulletin.subjects = subjects;
    bulletin.conductGrade = parsedConductGrade;
    bulletin.disciplineGrade = parsedDisciplineGrade;
    bulletin.totalNotes = totalNotes;
    bulletin.totalCoefficients = totalCoefficients;
    bulletin.definitiveTotal = definitiveTotal;
    bulletin.semesterAverage = semesterAverage;

    // Mise à jour des données spécifiques au semestre
    bulletin.semestres[period] = {
      totalNotes,
      totalCoefficients,
      noteConduite: parsedConductGrade,
      noteDiscipline: parsedDisciplineGrade,
      totalDefinitif: definitiveTotal,
      moyenneSemestrielle: parseFloat(semesterAverage),
      absences: absences || {},
      behavior: behavior || [],
    };

    // Sauvegarde du bulletin mis à jour
    await bulletin.save();

    // Appeler la fonction `updateSemesterRank` pour mettre à jour le classement semestriel
    await updateSemesterRank(bulletin, period, classId, year);

    res.status(200).json({ msg: 'Bulletin mis à jour avec succès', bulletin });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du bulletin:', err);
    res.status(500).json({ msg: 'Erreur lors de la mise à jour du bulletin' });
  }
};




//===============================

exports.deleteBulletin = async (req, res) => {
  try {
    console.log('Tentative de suppression du bulletin avec ID:', req.params.id);

    // Utilisez `findByIdAndDelete` pour supprimer le bulletin
    const bulletin = await Bulletin.findByIdAndDelete(req.params.id);

    if (!bulletin) {
      console.log('Bulletin non trouvé avec ID:', req.params.id);
      return res.status(404).json({ msg: 'Bulletin non trouvé' });
    }

    console.log('Bulletin supprimé avec succès:', bulletin);
    res.status(200).json({ msg: 'Bulletin supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du bulletin:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};


//=====================================================

// exports.getBulletinById = async (req, res) => {
//   console.log('Received request to get bulletin with ID:', req.params.id);
//   try {

//     const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
// if (!isValidObjectId) {
//   return res.status(400).json({ msg: 'ID invalide' });
// }

//     const bulletin = await Bulletin.findById(req.params.id)
//       .populate({
//         path: 'subjects.subject',
//         select: 'name level'
//       })
//       .populate({
//         path: 'subjects.teacher',
//         select: 'nom'
//       })
//       .populate('student', 'firstName lastName photo')
//       .populate('classId', 'name level')
//       .populate('establishmentId', 'name address');  // Ajoutez cette ligne pour peupler les informations de l'établissement

//     if (!bulletin) {
//       console.log('Bulletin not found for ID:', req.params.id);
//       return res.status(404).json({ msg: 'Bulletin non trouvé' });
//     }

   
//     // Initialiser les champs par défaut si absents
//     bulletin.conductGrade = bulletin.conductGrade || 0;
//     bulletin.disciplineGrade = bulletin.disciplineGrade || 0;
//     bulletin.semestres = bulletin.semestres || {}; // Remplacer trimestres par semestres

//     // Calculer les champs : totalNotes, totalCoefficients, totalDefinitif, et moyenneSemestrielle
//     const totalNotes = bulletin.subjects.reduce((sum, subject) => sum + (subject.grade || 0) * (subject.coefficient || 0), 0);
//     const totalCoefficients = bulletin.subjects.reduce((sum, subject) => sum + (subject.coefficient || 0), 0);
//     const totalDefinitive = totalNotes + bulletin.conductGrade - bulletin.disciplineGrade;
//     const moyenneSemestrielle = totalCoefficients > 0 ? (totalDefinitive / totalCoefficients).toFixed(2) : 0; // Changer ici moyenneTrimestrielle en moyenneSemestrielle

//     // Créer un objet de réponse sans muter directement l'objet Mongoose
//     const responseBulletin = {
//       ...bulletin.toObject(),  // Convertir le document Mongoose en objet JavaScript
//       studentPhoto: bulletin.student.photo || 'Aucune photo disponible', // Récupérer la photo
//       totalNotes,
//       totalCoefficients,
//       totalDefinitive,
//       moyenneSemestrielle: parseFloat(moyenneSemestrielle), // S'assurer qu'il s'agit bien d'un nombre et non d'une chaîne
      
//     };

//     // Calculer le classement de l'élève pour le semestre
//     if (bulletin.semestres[bulletin.period]) {
//       responseBulletin.semestres[bulletin.period].semesterRank = bulletin.semestres[bulletin.period].semesterRank || 0;
//     } else {
//       responseBulletin.semestres[bulletin.period] = { semesterRank: 0 }; // Initialiser si absent
//     }

//     console.log('Successfully retrieved bulletin:', responseBulletin);
//     res.status(200).json(responseBulletin);
//   } catch (err) {
//     console.error('Erreur lors de la récupération du bulletin:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur' });
//   }
// };




exports.getBulletinById = async (req, res) => {
  console.log('Received request to get bulletin with ID:', req.params.id);

  try {  

    // Récupérer le bulletin depuis la base de données
    const bulletin = await Bulletin.findById(req.params.id)
      .populate({
        path: 'subjects.subject',
        select: 'name level',
      })
      .populate({
        path: 'subjects.teacher',
        select: 'nom',
      })
      .populate('student', 'firstName lastName  dateOfBirth photo')
      .populate('classId', 'name level')
      .populate('establishmentId', 'name address'); // Ajouter les infos d'établissement

    console.log('Bulletin trouvé:', bulletin); // Log après la récupération

    if (!bulletin) {
      console.warn('Bulletin non trouvé pour l\'ID:', req.params.id);
      return res.status(404).json({ msg: 'Bulletin non trouvé' });
    }

    // Initialiser les champs manquants avec des valeurs par défaut
    bulletin.conductGrade = bulletin.conductGrade || 0;
    bulletin.disciplineGrade = bulletin.disciplineGrade || 0;
    bulletin.semestres = bulletin.semestres || {};

    console.log('Bulletin après initialisation des valeurs par défaut:', bulletin);

    // Calcul des totaux et moyenne
    const totalNotes = bulletin.subjects.reduce(
      (sum, subject) => sum + (subject.grade || 0) * (subject.coefficient || 0),
      0
    );
    const totalCoefficients = bulletin.subjects.reduce(
      (sum, subject) => sum + (subject.coefficient || 0),
      0
    );
    const totalDefinitive = totalNotes + bulletin.conductGrade - bulletin.disciplineGrade;
    const moyenneSemestrielle = totalCoefficients > 0 
      ? (totalDefinitive / totalCoefficients).toFixed(2) 
      : 0;

    console.log('Total des notes:', totalNotes);
    console.log('Total des coefficients:', totalCoefficients);
    console.log('Total définitif:', totalDefinitive);
    console.log('Moyenne semestrielle:', moyenneSemestrielle);

    // Créer l'objet de réponse sans muter l'objet Mongoose
    const responseBulletin = {
      ...bulletin.toObject(),
      studentPhoto: bulletin.student.photo || 'Aucune photo disponible',
      totalNotes,
      totalCoefficients,
      totalDefinitive,
      moyenneSemestrielle: parseFloat(moyenneSemestrielle),
    };

    // Calcul du classement
    if (bulletin.semestres[bulletin.period]) {
      responseBulletin.semestres[bulletin.period].semesterRank = 
        bulletin.semestres[bulletin.period].semesterRank || 0;
    } else {
      responseBulletin.semestres[bulletin.period] = { semesterRank: 0 };
    }

    console.log('Bulletin final à envoyer:', responseBulletin);

    // Envoi de la réponse
    res.status(200).json(responseBulletin);
  } catch (err) {
    console.error('Erreur lors de la récupération du bulletin:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};





//========================

exports.calculateClassStatistics = async (req, res) => {
  const { classId, year, period } = req.query;  // La période correspond maintenant à un semestre
  console.log('Calcul des statistiques de la classe pour:', { classId, year, period });

  try {
    const bulletins = await Bulletin.find({ classId, year, period });

    if (bulletins.length === 0) {
      console.log('Aucun bulletin trouvé pour ces critères.');
      return res.status(404).json({ msg: "Aucun bulletin trouvé pour la classe, l'année et le semestre spécifiés." });
    }

    console.log('Nombre de bulletins trouvés:', bulletins.length);

    // Calcul des moyennes semestrielles pour chaque bulletin
    const averages = bulletins.map(bulletin => bulletin.semestres[period]?.moyenneSemestrielle || 0);
    console.log('Moyennes semestrielles trouvées:', averages);

    const lowestAverage = Math.min(...averages);  // Moyenne la plus basse
    const highestAverage = Math.max(...averages);  // Moyenne la plus haute
    const classAverage = (averages.reduce((sum, avg) => sum + avg, 0) / averages.length).toFixed(2);  // Moyenne de la classe

    console.log('Statistiques calculées:', { lowestAverage, highestAverage, classAverage });

    // Trier les bulletins par moyenne semestrielle pour calculer le rang
    const sortedBulletins = bulletins.sort((a, b) => (b.semestres[period]?.moyenneSemestrielle || 0) - (a.semestres[period]?.moyenneSemestrielle || 0));

    for (let i = 0; i < sortedBulletins.length; i++) {
      const bulletin = sortedBulletins[i];
      bulletin.semestres[period].semesterRank = i + 1;  // Mettre à jour le rang semestriel
      console.log(`Rang attribué pour l'étudiant ${bulletin.student}: ${i + 1}`);
      await bulletin.save();  // Sauvegarder les modifications
    }

    // Réponse avec les statistiques calculées
    res.status(200).json({
      lowestAverage,
      highestAverage,
      classAverage,
      bulletins: sortedBulletins.map(b => ({
        student: b.student,
        moyenneSemestrielle: b.semestres[period]?.moyenneSemestrielle || 0,  // Moyenne semestrielle pour l'élève
        semesterRank: b.semestres[period]?.semesterRank || 0,  // Classement semestriel
      }))
    });
  } catch (err) {
    console.error('Erreur lors du calcul des statistiques de la classe:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors du calcul des statistiques de la classe' });
  }
};


//================================
exports.getClassStatistics = async (req, res) => {
  try {
    const { classId, year, period } = req.query;

    if (!classId || !year || !period) {
      return res.status(400).json({ msg: 'Veuillez fournir tous les paramètres requis (classId, year, period).' });
    }

    const bulletins = await Bulletin.find({ 
      classId, 
      year, 
      period 
    });

    if (bulletins.length === 0) {
      return res.status(404).json({ msg: 'Aucun bulletin trouvé pour ces critères.' });
    }

    // Calculer les statistiques basées sur les moyennes semestrielles
    const classAverage = bulletins.reduce((acc, bulletin) => acc + (bulletin.semestres[period].moyenneSemestrielle || 0), 0) / bulletins.length;
    const highestAverage = Math.max(...bulletins.map(bulletin => bulletin.semestres[period].moyenneSemestrielle || 0));
    const lowestAverage = Math.min(...bulletins.map(bulletin => bulletin.semestres[period].moyenneSemestrielle || 0));

    res.status(200).json({
      classAverage: classAverage.toFixed(2),  // Renvoie la moyenne de classe avec deux décimales
      highestAverage,
      lowestAverage
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques de la classe:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des statistiques de la classe.' });
  }
};



//==================
exports.getStudentRank = async (req, res) => {
  try {
    const { classId, year, period } = req.query;

    // Récupérer tous les bulletins pour la classe, l'année et le semestre donnés
    const bulletins = await Bulletin.find({ classId, year, period });

    if (!bulletins || bulletins.length === 0) {
      return res.status(404).json({ msg: 'Aucun bulletin trouvé pour cette classe, année et semestre.' });
    }

    // Calculer les moyennes pour chaque élève
    const studentAverages = bulletins.map((bulletin) => ({
      studentId: bulletin.student,
      average: bulletin.semestres[period]?.moyenneSemestrielle || 0, // Assurez-vous que les moyennes semestrielles existent
    }));

    // Trier les moyennes par ordre décroissant pour déterminer le rang
    studentAverages.sort((a, b) => b.average - a.average);

    // Trouver le rang de l'élève actuel
    const studentRank = studentAverages.findIndex(student => student.studentId.toString() === req.params.studentId) + 1;

    if (studentRank === 0) {
      return res.status(404).json({ msg: "Élève non trouvé dans les bulletins de la classe." });
    }

    res.status(200).json({ rank: studentRank });
  } catch (err) {
    console.error('Erreur lors du calcul du rang de l\'élève:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};



// Controller pour récupérer l'année académique active
exports.getActiveAcademicYear = async (req, res) => {
  try {
    console.log('Tentative de récupération de l\'année académique active depuis le backend...');
    
    const activeYear = await AcademicYear.findOne({ isActive: true });  // Recherche de l'année académique active

    if (!activeYear) {
      console.log('Aucune année académique active trouvée.');
      return res.status(404).json({ msg: 'Aucune année académique active trouvée.' });
    }

    console.log('Année académique active trouvée:', activeYear);
    res.status(200).json(activeYear);  // Renvoi de l'année académique active

  } catch (err) {
    console.error('Erreur lors de la récupération de l\'année académique active:', err);
    res.status(500).json({ msg: 'Erreur lors de la récupération de l\'année académique active.' });
  }
};




exports.getBulletinByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Récupérer le bulletin en fonction de l'ID de l'étudiant
    const bulletin = await Bulletin.findOne({ student: studentId })
      .populate({
        path: 'student',
        select: 'firstName lastName matricule photo  dateOfBirth fatherPhone motherPhone parentsAddress gender dateOfBirth', // Sélection des champs
        populate: {
          path: 'establishmentId',
          select: 'name address', // Informations de l'établissement
        },
      })
      .populate('classId', 'name level') // Classe et niveau
      .populate('subjects.subject', 'name') // Nom de la matière
      .populate('subjects.teacher', 'nom'); // Nom de l'enseignant

    if (!bulletin) {
      return res.status(404).json({ msg: 'Aucun bulletin trouvé pour cet étudiant' });
    }

    res.status(200).json(bulletin);
  } catch (err) {
    console.error('Erreur lors de la récupération du bulletin:', err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};



// exports.getBulletinByParentPhone = async (req, res) => {
//   try {
//     const { phone } = req.params;

//     // Rechercher l'étudiant par numéro de téléphone du père ou de la mère
//     const student = await Student.findOne({
//       $or: [{ fatherPhone: phone }, { motherPhone: phone }],
//     });

//     if (!student) {
//       return res.status(404).json({ msg: 'Aucun étudiant trouvé avec ce numéro' });
//     }

//     // Récupérer le bulletin de l'étudiant trouvé
//     const bulletin = await Bulletin.findOne({ student: student._id })
//       .populate({
//         path: 'student',
//         select: 'firstName lastName matricule photo fatherPhone motherPhone parentsAddress gender dateOfBirth',
//         populate: { 
//           path: 'establishmentId', 
//           select: 'name address' 
//         }
//       })
//       .populate('classId', 'name level')
//       .populate('subjects.subject', 'name')
//       .populate('subjects.teacher', 'nom');

//     if (!bulletin) {
//       return res.status(404).json({ msg: 'Aucun bulletin trouvé pour cet étudiant' });
//     }

//     res.status(200).json(bulletin);
//   } catch (err) {
//     console.error('Erreur lors de la récupération du bulletin:', err);
//     res.status(500).json({ msg: 'Erreur serveur' });
//   }
// };



// exports.getBulletinByParentPhone = async (req, res) => {
//   try {
//     const { phone } = req.params;
   

//     // Rechercher un élève correspondant à ce numéro de téléphone
//     const student = await Student.findOne({
//       $or: [{ fatherPhone: phone }, { motherPhone: phone }],
//     });

//     if (!student) {
//       return res.status(404).json({ msg: 'Aucun élève trouvé pour ce numéro' });
//     }

//     // Récupérer le bulletin de l'élève trouvé
//     const bulletin = await Bulletin.findOne({ student: student._id })
//       .populate({
//         path: 'student',
//         select: 'firstName lastName matricule photo dateOfBirth establishmentId',
//         populate: { path: 'establishmentId', select: 'name address' },
//       })
//       .populate('classId', 'name level')
//       .populate('subjects.subject', 'name')
//       .populate('subjects.teacher', 'nom');

//     if (!bulletin) {
//       return res.status(404).json({ msg: 'Aucun bulletin trouvé pour cet élève' });
//     }

//     res.status(200).json(bulletin);
//   } catch (err) {
//     console.error('Erreur lors de la récupération du bulletin:', err);
//     res.status(500).json({ msg: 'Erreur serveur' });
//   }
// };

exports.getBulletinByParentPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const { period } = req.query; // Capture the selected period

    // Find the student by phone number
    const student = await Student.findOne({
      $or: [{ fatherPhone: phone }, { motherPhone: phone }],
    });

    if (!student) {
      return res.status(404).json({ msg: 'Aucun élève trouvé pour ce numéro' });
    }

    // Find the bulletin for the specific student and period
    const bulletin = await Bulletin.findOne({
      student: student._id,
      period: period, // Filter by the selected period
    })
      .populate({
        path: 'student',
        select: 'firstName lastName matricule photo dateOfBirth establishmentId',
        populate: { path: 'establishmentId', select: 'name address' },
      })
      .populate('classId', 'name level')
      .populate('subjects.subject', 'name')
      .populate('subjects.teacher', 'nom');

    if (!bulletin) {
      return res.status(404).json({ msg: 'Aucun bulletin trouvé pour cet élève et ce semestre' });
    }

    res.status(200).json(bulletin);
  } catch (err) {
    console.error('Erreur lors de la récupération du bulletin:', err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};
