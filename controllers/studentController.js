const SchoolCard = require('../models/SchoolCard');
const Student = require('../models/Student');
const { generateUniqueCardNumber } = require('../utils/generateCardNumber'); // Assurez-vous que ceci est correct
const mongoose = require('mongoose');
const User = require('../models/User');  // Modèle User pour l'authentification
const Establishment = require('../models/Establishment');
const Class = require('../models/Class');
const fs = require('fs');
const path = require('path');
const DevoirCompo = require('../models/DevoirCompo'); // Importez votre modèle de notes

const QRCode = require('qrcode');


// Contrôleur pour supprimer toutes les cartes scolaires
exports.deleteAllSchoolCards = async (req, res) => {
  try {
    await SchoolCard.deleteMany({});  // Supprime toutes les cartes scolaires
    res.status(200).json({ msg: 'Toutes les cartes scolaires ont été supprimées avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression des cartes scolaires:', err);
    res.status(500).json({ msg: 'Erreur lors de la suppression des cartes scolaires.' });
  }
};


// Fonction pour générer un matricule unique
const generateUniqueMatricule = async (establishment, classInfo) => {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  let studentCount = await Student.countDocuments({ establishmentId: establishment._id });

  let isUnique = false;
  let matricule;

  while (!isUnique) {
    matricule = `${establishment.codeRegion}-${establishment.codeEtablissement}-${classInfo.level[0].toUpperCase()}-${currentYear}-${(studentCount + 1).toString().padStart(6, '0')}`;

    // Vérifier si un élève avec ce matricule existe déjà
    const existingUser = await User.findOne({ matricule });
    if (!existingUser) {
      isUnique = true; // Si aucun élève n'a ce matricule, il est unique
    } else {
      studentCount += 1; // Incrémenter le count et générer un nouveau matricule
    }
  }

  return matricule;
};

exports.createStudent = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      gender, 
      dateOfBirth, 
      classId, 
      motherName,   // Nom de la mère
      fatherPhone,   // Téléphone du père
      motherPhone,   // Téléphone de la mère
      parentsAddress // Adresse des parents
    } = req.body;

    const { user } = req;  // L'utilisateur connecté qui crée l'élève

    console.log('Données reçues :', req.body);  // Log des données reçues dans la requête
    console.log('Fichier reçu :', req.file);    // Log des fichiers reçus (photo)

    // Vérification de l'utilisateur et de l'établissement
    if (!user || !user.schoolId) {
      return res.status(400).json({ msg: "Utilisateur ou établissement non défini." });
    }

    if (!classId) {
      return res.status(400).json({ msg: "ID de classe manquant." });
    }

    // Validation de la date de naissance
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob > new Date()) {
      return res.status(400).json({ msg: "Date de naissance invalide." });
    }

    const establishment = await Establishment.findById(user.schoolId);
    const classInfo = await Class.findById(classId);

    if (!establishment || !classInfo) {
      return res.status(400).json({ msg: "Établissement ou classe introuvable." });
    }

    // Appel à la fonction pour générer un matricule unique
    const matricule = await generateUniqueMatricule(establishment, classInfo);

    // Gestion de la photo avec vérification du type de fichier
    let photo = null;
    if (req.file) {
      const validExtensions = ['.jpg', '.jpeg', '.png'];
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        return res.status(400).json({ msg: 'Format de fichier non pris en charge. Seules les images (jpg, jpeg, png) sont autorisées.' });
      }
      photo = req.file.path;  // Si tout est correct, on enregistre le chemin de la photo
      console.log('Chemin de la photo :', photo);  // Log du chemin de la photo
    }

    // Création de l'élève dans la collection Student
    const newStudent = new Student({
      firstName,
      lastName,
      gender,
      dateOfBirth: dob,
      classId,
      establishmentId: user.schoolId,
      matricule,
      photo,
      motherName,    // Ajout du nom de la mère
      fatherPhone,   // Ajout du téléphone du père
      motherPhone,   // Ajout du téléphone de la mère
      parentsAddress // Ajout de l'adresse des parents
    });

    await newStudent.save();

    // Création d'un nouvel utilisateur pour l'élève
    const initialPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = new User({
      name: `${firstName} ${lastName}`,
      password: initialPassword,
      matricule: newStudent.matricule,
      role: 'Eleve',
      studentId: newStudent._id,
      schoolId: user.schoolId,
    });

    await newUser.save();

    res.status(201).json({
      student: newStudent,
      matricule: newStudent.matricule,
      password: initialPassword,
    });
  } catch (err) {
    // Gestion des erreurs avec plus de détails
    console.error('Erreur lors de la création de l\'élève:', err.message, 'Stack trace:', err.stack);
    res.status(500).json({ msg: 'Erreur du serveur lors de la création de l\'élève' });
  }
};





exports.getStudents = async (req, res) => {
  try {
    const { search, classId, page = 1, limit = 5 } = req.query;
    const query = {
      establishmentId: req.user.schoolId,  // Filtrer par l'établissement de l'utilisateur connecté
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (classId) {
      query.classId = classId;  // Ajouter le filtre par classe si un classId est fourni
    }

    // Optimisation avec lean() et limitation des champs
    const students = await Student.find(query)
      // .select('firstName lastName dateOfBirth gender classId establishmentId photo') // Inclure le champ 'photo'
      .select('firstName lastName dateOfBirth gender classId establishmentId photo motherName fatherPhone motherPhone parentsAddress')

      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('classId', 'name level')  // Peupler les informations nécessaires uniquement
      .populate('establishmentId', 'name')  // Peupler les informations de l'établissement
      .lean();

    const total = await Student.countDocuments(query);

    res.status(200).json({
      students,
      total
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des élèves:', err.message);
    res.status(500).json({ msg: 'Erreur lors de la récupération des élèves' });
  }
};






exports.getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Récupérer l'élève avec tous les champs nécessaires
    const student = await Student.findById(studentId)
      .populate('classId', 'name level')
      .populate('establishmentId', 'name');

    if (!student) {
      return res.status(404).json({ msg: "Élève non trouvé" });
    }

    // Ajout du log pour afficher ce qui est envoyé au frontend
    console.log('Données envoyées au frontend pour l\'édition:', student);

    // Envoyer les données de l'élève au frontend
    res.status(200).json(student);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'élève:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération de l\'élève' });
  }
};


exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      dateOfBirth, 
      gender, 
      classId, 
      motherName,       // Ajout du nom de la mère
      fatherPhone,       // Ajout du téléphone du père
      motherPhone,       // Ajout du téléphone de la mère
      parentsAddress     // Ajout de l'adresse des parents
    } = req.body;

    // Trouver l'élève par son ID
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ msg: "Élève non trouvé" });
    }

    // Validation de la date de naissance
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob > new Date()) {
      return res.status(400).json({ msg: "Date de naissance invalide." });
    }

    // Mise à jour des informations de l'élève
    student.firstName = firstName || student.firstName;
    student.lastName = lastName || student.lastName;
    student.dateOfBirth = dob || student.dateOfBirth;
    student.gender = gender || student.gender;
    student.classId = classId || student.classId;

    // Mise à jour des nouveaux champs ajoutés
    student.motherName = motherName || student.motherName;         // Mise à jour du nom de la mère
    student.fatherPhone = fatherPhone || student.fatherPhone;      // Mise à jour du téléphone du père
    student.motherPhone = motherPhone || student.motherPhone;      // Mise à jour du téléphone de la mère
    student.parentsAddress = parentsAddress || student.parentsAddress; // Mise à jour de l'adresse des parents

    // Gestion de l'upload de la photo
    if (req.file) {
      student.photo = req.file.path;  // Si une nouvelle photo est uploadée, on met à jour le chemin de la photo
    }

    // Sauvegarder les modifications
    await student.save();

    // Récupérer l'élève mis à jour avec les informations de la classe et de l'établissement
    const updatedStudent = await Student.findById(id)
      .populate('classId')
      .populate('establishmentId');

    // Répondre avec l'élève mis à jour
    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'élève:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de l\'élève' });
  }
};


exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Vérifier s'il y a des notes associées à cet élève dans la collection DevoirCompo
    const associatedNotes = await DevoirCompo.find({ student: studentId });
    
    if (associatedNotes.length > 0) {
      return res.status(400).json({
        msg: 'Cet élève ne peut pas être supprimé car il a des notes associées.'
      });
    }

    // Trouver l'élève par son ID
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ msg: 'Élève non trouvé' });
    }

    // Supprimer l'utilisateur associé
    const deletedUser = await User.findOneAndDelete({ studentId: student._id });
    if (!deletedUser) {
      console.log(`Aucun utilisateur trouvé avec studentId : ${student._id}`);
    } else {
      console.log(`Utilisateur avec studentId : ${student._id} supprimé avec succès`);
    }

    // Supprimer la photo du serveur si elle existe
    if (student.photo) {
      const photoPath = path.join(__dirname, '..', student.photo);
      fs.unlink(photoPath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de la photo:', err.message);
        } else {
          console.log('Photo supprimée avec succès:', student.photo);
        }
      });
    }

    // Supprimer l'élève
    await Student.findByIdAndDelete(studentId);

    res.status(200).json({ msg: 'Élève et utilisateur associé supprimés avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'élève:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la suppression de l\'élève' });
  }
};





// exports.generateSchoolCards = async (req, res) => {
//   try {
//     const { classId } = req.body;

//     if (!classId) {
//       console.error('ClassId est requis');
//       return res.status(400).json({ msg: 'ClassId est requis' });
//     }

//     console.log('ClassId reçu:', classId);

//     const students = await Student.find({ classId });

//     if (!students.length) {
//       return res.status(404).json({ msg: 'Aucun étudiant trouvé pour cette classe' });
//     }

//     console.log('Nombre d\'étudiants trouvés:', students.length);

//     const cards = [];
//     const alreadyExistsStudents = [];

//     for (const student of students) {
//       if (!student.establishmentId) {
//         console.error(`Erreur: l'étudiant ${student._id} n'a pas d'établissement défini.`);
//         continue;  // Ignorer les étudiants sans établissement
//       }

//       console.log(`Génération de la carte pour l'étudiant ${student._id} dans l'établissement ${student.establishmentId}`);

//       // Vérification si l'étudiant a déjà une carte scolaire
//       const existingCard = await SchoolCard.findOne({ student: student._id });
//       if (existingCard) {
//         console.log(`L'étudiant ${student._id} a déjà une carte scolaire.`);
//         alreadyExistsStudents.push(student._id);
//         continue;  // Ignorer les étudiants qui ont déjà une carte
//       }

//       // Génération d'un numéro de carte unique
//       const cardNumber = await generateUniqueCardNumber();  // Assurez-vous que cette fonction existe

//       const newCard = new SchoolCard({
//         student: student._id,
//         establishment: student.establishmentId,
//         cardNumber,
//         expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),  // Carte valable pour un an
//         photoUrl: 'https://via.placeholder.com/150',  // Placeholder pour la photo
//         status: 'Active',
//       });

//       await newCard.save();
//       console.log(`Carte scolaire créée avec succès pour l'étudiant ${student._id}`);

//       cards.push(newCard);
//     }

//     const responseMessage = {
//       msg: '',
//       cards,
//       alreadyExistsStudents,
//     };

//     if (cards.length === 0 && alreadyExistsStudents.length > 0) {
//       responseMessage.msg = 'Toutes les cartes scolaires existent déjà pour les étudiants concernés.';
//     } else if (cards.length > 0) {
//       responseMessage.msg = 'Cartes scolaires générées avec succès';
//     } else {
//       responseMessage.msg = 'Aucune carte scolaire générée.';
//     }

//     res.status(200).json(responseMessage);

//   } catch (err) {
//     console.error('Erreur lors de la génération des cartes scolaires:', err);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la génération des cartes scolaires' });
//   }
// };


//===================


exports.generateSchoolCards = async (req, res) => {
  try {
    const { classId } = req.body;

    if (!classId) {
      console.error('ClassId est requis');
      return res.status(400).json({ msg: 'ClassId est requis' });
    }

    const students = await Student.find({ classId });

    if (!students.length) {
      return res.status(404).json({ msg: 'Aucun étudiant trouvé pour cette classe' });
    }

    const cards = [];
    const alreadyExistsStudents = [];

    for (const student of students) {
      if (!student.establishmentId) {
        continue;  // Ignore students without an establishment
      }

      const existingCard = await SchoolCard.findOne({ student: student._id });
      if (existingCard) {
        alreadyExistsStudents.push(student._id);
        continue;  // Skip students with existing cards
      }

   

        // **Add login URL to QR code data using the matricule number**:
        const loginUrl = `https://yoursite.com/login?matricule=${student.matricule}`;

      // **QR code data including the login URL**:
      const qrData = {
        matricule: student.matricule,  // Matricule number for login
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth,
        class: student.classId.name,
        loginUrl,  // Add login URL to the QR code data
      };

      // **Generate the QR code with student info and login URL**:
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Generate a unique card number
      const cardNumber = await generateUniqueCardNumber();

      const newCard = new SchoolCard({
        student: student._id,
        establishment: student.establishmentId,
        cardNumber,
        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        photoUrl: student.photoUrl || 'https://via.placeholder.com/150',  // Default placeholder for the photo
        qrCodeUrl,  // Store the QR code URL
        status: 'Active',
      });

      await newCard.save();
      cards.push(newCard);
    }

    const responseMessage = {
      msg: '',
      cards,
      alreadyExistsStudents,
    };

    if (cards.length === 0 && alreadyExistsStudents.length > 0) {
      responseMessage.msg = 'Toutes les cartes scolaires existent déjà pour les étudiants concernés.';
    } else if (cards.length > 0) {
      responseMessage.msg = 'Cartes scolaires générées avec succès';
    } else {
      responseMessage.msg = 'Aucune carte scolaire générée.';
    }

    res.status(200).json(responseMessage);

  } catch (err) {
    console.error('Erreur lors de la génération des cartes scolaires:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la génération des cartes scolaires' });
  }
};







exports.getSchoolCards = async (req, res) => {
  try {
    const schoolCards = await SchoolCard.find()
      // .populate({
      //   path: 'student',
      //   select: 'firstName lastName matricule dateOfBirth motherPhone parentsAddress classId',
      //   populate: { path: 'classId', select: 'name level' }
      // })

      .populate({
        path: 'student',
        select: 'firstName lastName matricule dateOfBirth motherPhone parentsAddress classId photo',  // Ajoutez 'photo' ici
        populate: { path: 'classId', select: 'name level' }  // Garder la population de la classe comme c'est
      })
      
     
     .populate({
    path: 'establishment',
    select: 'name address phoneNumber academicYears',
    populate: {
      path: 'academicYears.yearId',
      match: { isActive: true },  // Filtrer pour obtenir uniquement l'année active
      select: 'startYear endYear',
    }
  });
      
      
      

    if (!schoolCards.length) {
      return res.status(404).json({ msg: 'Aucune carte scolaire trouvée.' });
    }

    res.status(200).json({ cards: schoolCards });
  } catch (err) {
    console.error('Erreur lors de la récupération des cartes scolaires:', err);
    res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des cartes scolaires' });
  }
};


exports.getStudentsByClass = async (req, res) => {
  console.log('Contrôleur getStudentsByClass appelé');
  try {
    const { classId } = req.params;
    const { page = 1, limit = 10, sortBy = 'lastName', order = 'asc' } = req.query;  // Paramètres de pagination et de tri

    // Vérifier que l'ID de la classe est valide
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ msg: "ID de classe invalide." });
    }

    // Options de tri
    const sortOrder = order === 'desc' ? -1 : 1;  // Déterminer l'ordre du tri
    const sortOptions = { [sortBy]: sortOrder };

    // Requête pour récupérer les étudiants avec pagination et tri
    const students = await Student.find({ classId })
      .select('firstName lastName dateOfBirth gender matricule motherName fatherPhone motherPhone parentsAddress')  // Inclure les nouveaux champs
      .populate('classId', 'name level')
      .populate('establishmentId', 'name')
      .sort(sortOptions)
      .skip((page - 1) * limit)  // Pagination : ignorer les précédents résultats
      .limit(parseInt(limit));   // Limiter le nombre d'étudiants renvoyés

    // Log des étudiants récupérés (désactivé en production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Données des étudiants récupérés:', students.map(s => ({
        firstName: s.firstName,
        lastName: s.lastName,
        matricule: s.matricule,
        className: s.classId.name,
        establishmentName: s.establishmentId.name,
        motherName: s.motherName,
        fatherPhone: s.fatherPhone,
        motherPhone: s.motherPhone,
        parentsAddress: s.parentsAddress,
      })));
    }

    if (!students || students.length === 0) {
      return res.status(404).json({ msg: "Aucun élève trouvé pour cette classe." });
    }

    // Calculer le nombre total d'élèves pour cette classe
    const totalStudents = await Student.countDocuments({ classId });

    res.status(200).json({
      students,
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: parseInt(page, 10)
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des élèves de la classe:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};
