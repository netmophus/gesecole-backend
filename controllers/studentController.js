const SchoolCard = require('../models/SchoolCard');
const Student = require('../models/Student');
const { generateUniqueCardNumber } = require('../utils/generateCardNumber'); // Assurez-vous que ceci est correct
const mongoose = require('mongoose');
const User = require('../models/User');  // Modèle User pour l'authentification
const Establishment = require('../models/Establishment');
const Class = require('../models/Class');
const Bulletin = require('../models/Bulletin');
const DevoirCompo = require('../models/DevoirCompo'); // Importez votre modèle de notes
const cloudinary = require('cloudinary').v2;
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
//const Payment = require('./Payment'); // Assurez-vous du bon chemin vers Payment.js

///const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const AcademicYear = require('../models/AcademicYear'); 
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
    console.log('Données reçues :', req.body);
    console.log('Fichier reçu :', req.file);

    const { 
      firstName, 
      lastName, 
      gender, 
      dateOfBirth, 
      classId, 
      motherName, 
      fatherPhone, 
      motherPhone, 
      parentsAddress,
      payments // Réception des informations de paiement sous forme de chaîne JSON
    } = req.body;

    const { user } = req;

    if (!user || !user.schoolId) {
      return res.status(400).json({ msg: "Utilisateur ou établissement non défini." });
    }

    if (!classId) {
      return res.status(400).json({ msg: "ID de classe manquant." });
    }

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob > new Date()) {
      return res.status(400).json({ msg: "Date de naissance invalide." });
    }

    const establishment = await Establishment.findById(user.schoolId);
    const classInfo = await Class.findById(classId);

    if (!establishment || !classInfo) {
      return res.status(400).json({ msg: "Établissement ou classe introuvable." });
    }

    const matricule = await generateUniqueMatricule(establishment, classInfo);

    let photo = null;
    if (req.file) {
      photo = req.file.path || req.file.url;
    }

    const newStudent = new Student({
      firstName,
      lastName,
      gender,
      dateOfBirth: dob,
      classId,
      establishmentId: user.schoolId,
      matricule,
      photo,
      motherName,
      fatherPhone,
      motherPhone,
      parentsAddress,
    });

    // Vérifiez les données de paiement et affichez-les pour déboguer
    console.log('Chaîne de paiement reçue:', payments);

    if (payments) {
      let paymentData;
      try {
        paymentData = JSON.parse(payments);
        console.log('Données de paiement analysées :', paymentData);
      } catch (err) {
        console.error('Erreur de parsing JSON des paiements:', err);
        return res.status(400).json({ msg: "Format des paiements invalide." });
      }

      if (Array.isArray(paymentData) && paymentData.length > 0) {
        // Ajoute chaque paiement avec vérification du montant
        newStudent.payments = paymentData.map(payment => ({
          amount: payment.amount || 0, // Valeur par défaut pour éviter undefined
          method: payment.method || 'Espèces',
          transactionId: payment.transactionId || `TXN-${Date.now()}`
        }));
        console.log('Montant du paiement ajouté :', newStudent.payments);
      } else {
        console.log("Aucun paiement valide n'a été reçu.");
      }
    }

    await newStudent.save();
    classInfo.students.push(newStudent._id);
    await classInfo.save();

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
      msg: 'Élève créé avec succès.',
      student: newStudent,
      matricule: newStudent.matricule,
      password: initialPassword,
    });

  } catch (err) {
    console.error('Erreur lors de la création de l\'élève:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la création de l\'élève.', error: err.message });
  }
};





// exports.getStudents = async (req, res) => {
//   try {
//     const { search, classId, page = 1, limit = 5 } = req.query;
//     const query = {
//       establishmentId: req.user.schoolId,  // Filtrer par l'établissement de l'utilisateur connecté
//     };

//     if (search) {
//       query.$or = [
//         { firstName: { $regex: search, $options: 'i' } },
//         { lastName: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (classId) {
//       query.classId = classId;  // Ajouter le filtre par classe si un classId est fourni
//     }

//     // Optimisation avec lean() et limitation des champs
//     const students = await Student.find(query)
//       // .select('firstName lastName dateOfBirth gender classId establishmentId photo') // Inclure le champ 'photo'
//       .select('firstName lastName dateOfBirth gender classId establishmentId photo motherName fatherPhone motherPhone parentsAddress')

//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .populate('classId', 'name level')  // Peupler les informations nécessaires uniquement
//       .populate('establishmentId', 'name')  // Peupler les informations de l'établissement
//       .lean();

//     const total = await Student.countDocuments(query);

//     res.status(200).json({
//       students,
//       total
//     });
//   } catch (err) {
//     console.error('Erreur lors de la récupération des élèves:', err.message);
//     res.status(500).json({ msg: 'Erreur lors de la récupération des élèves' });
//   }
// };






// exports.getStudentById = async (req, res) => {
//   try {
//     const studentId = req.params.id;

//     // Récupérer l'élève avec tous les champs nécessaires
//     const student = await Student.findById(studentId)
//       .populate('classId', 'name level')
//       .populate('establishmentId', 'name');

//     if (!student) {
//       return res.status(404).json({ msg: "Élève non trouvé" });
//     }

//     // Ajout du log pour afficher ce qui est envoyé au frontend
//     console.log('Données envoyées au frontend pour l\'édition:', student);

//     // Envoyer les données de l'élève au frontend
//     res.status(200).json(student);
//   } catch (err) {
//     console.error('Erreur lors de la récupération de l\'élève:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la récupération de l\'élève' });
//   }
// };

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

    // Requête pour récupérer les élèves avec leurs informations de paiement
    const students = await Student.find(query)
      .select('firstName lastName dateOfBirth gender classId establishmentId photo motherName fatherPhone motherPhone parentsAddress payments matricule') // Inclure les paiements
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('classId', 'name level')  // Peupler les informations nécessaires de la classe
      .populate('establishmentId', 'name')  // Peupler les informations de l'établissement
      .lean();

    // Vérifiez si "payments" est défini et est un tableau avant d'utiliser "map"
    students.forEach(student => {
      student.payments = Array.isArray(student.payments) 
        ? student.payments.map(payment => ({
            amount: payment.amount,
            date: payment.date,
            method: payment.method,
            transactionId: payment.transactionId
          })) 
        : []; // Si "payments" est indéfini ou non un tableau, remplacez-le par un tableau vide
    });

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
      .populate('establishmentId', 'name address type phoneNumber contactEmail promoterName region yearOfCreation authorization code');

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




// exports.updateStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { 
//       firstName, 
//       lastName, 
//       dateOfBirth, 
//       gender, 
//       classId, 
//       motherName,       // Ajout du nom de la mère
//       fatherPhone,       // Ajout du téléphone du père
//       motherPhone,       // Ajout du téléphone de la mère
//       parentsAddress     // Ajout de l'adresse des parents
//     } = req.body;

//     // Trouver l'élève par son ID
//     const student = await Student.findById(id);
//     if (!student) {
//       return res.status(404).json({ msg: "Élève non trouvé" });
//     }

//     // Validation de la date de naissance
//     const dob = new Date(dateOfBirth);
//     if (isNaN(dob.getTime()) || dob > new Date()) {
//       return res.status(400).json({ msg: "Date de naissance invalide." });
//     }

//     // Mise à jour des informations de l'élève
//     student.firstName = firstName || student.firstName;
//     student.lastName = lastName || student.lastName;
//     student.dateOfBirth = dob || student.dateOfBirth;
//     student.gender = gender || student.gender;
//     student.classId = classId || student.classId;

//     // Mise à jour des nouveaux champs ajoutés
//     student.motherName = motherName || student.motherName;
//     student.fatherPhone = fatherPhone || student.fatherPhone;
//     student.motherPhone = motherPhone || student.motherPhone;
//     student.parentsAddress = parentsAddress || student.parentsAddress;

//     // Gestion de l'upload de la photo
//     if (req.file) {
//       try {
//         // Supprimer l'ancienne photo de Cloudinary si elle existe
//         if (student.photo) {
//           const publicIdMatch = student.photo.match(/\/(?:v\d+\/)?([^/]+)\.\w+$/);
//           const publicId = publicIdMatch ? `students/${publicIdMatch[1]}` : null;

//           if (publicId) {
//             await cloudinary.uploader.destroy(publicId);
//           }
//         }

//         // Upload de la nouvelle photo sur Cloudinary
//         const result = await cloudinary.uploader.upload(req.file.path, {
//           folder: 'students',
//           public_id: `${firstName.toLowerCase()}-${Date.now()}`,
//           resource_type: 'image',
//         });

//         // Mise à jour de l'URL de la nouvelle photo
//         student.photo = result.secure_url;
//         console.log('Nouvelle URL de la photo sur Cloudinary :', student.photo);

//       } catch (error) {
//         console.error('Erreur lors de l\'upload de la photo sur Cloudinary :', error);
//         return res.status(500).json({ msg: 'Erreur lors de l\'upload de la photo' });
//       }
//     }

//     // Sauvegarder les modifications
//     await student.save();

//     // Récupérer l'élève mis à jour avec les informations de la classe et de l'établissement
//     const updatedStudent = await Student.findById(id)
//       .populate('classId')
//       .populate('establishmentId');

//     // Répondre avec l'élève mis à jour
//     res.status(200).json(updatedStudent);
//   } catch (err) {
//     console.error('Erreur lors de la mise à jour de l\'élève:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de l\'élève' });
//   }
// };



// exports.deleteStudent = async (req, res) => {
//   try {
//     const studentId = req.params.id;

//     const associatedNotes = await DevoirCompo.find({ student: studentId });
//     if (associatedNotes.length > 0) {
//       return res.status(400).json({
//         msg: 'Cet élève ne peut pas être supprimé car il a des notes associées.'
//       });
//     }

//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).json({ msg: 'Élève non trouvé' });
//     }

//     await User.findOneAndDelete({ studentId: student._id });

//     // Supprimer la photo de Cloudinary
//     if (student.photo) {
//       try {
//         // Extraire l'ID public de l'URL de la photo stockée
//         const publicIdMatch = student.photo.match(/students\/([^/]+)\.(jpg|jpeg|png)$/);
//         if (publicIdMatch) {
//           const publicId = `students/${publicIdMatch[1]}`;
//           await cloudinary.uploader.destroy(publicId);
//           console.log('Photo supprimée avec succès de Cloudinary');
//         } else {
//           console.error('ID public de l\'image introuvable pour la suppression.');
//         }
//       } catch (error) {
//         console.error('Erreur lors de la suppression de la photo de Cloudinary:', error.message);
//       }
//     }

//     await Student.findByIdAndDelete(studentId);

//     res.status(200).json({ msg: 'Élève et utilisateur associé supprimés avec succès' });
//   } catch (err) {
//     console.error('Erreur lors de la suppression de l\'élève:', err.message);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la suppression de l\'élève' });
//   }
// };

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      dateOfBirth, 
      gender, 
      classId, 
      motherName,       
      fatherPhone,       
      motherPhone,       
      parentsAddress,
      payments // Réception des informations de paiement sous forme de chaîne JSON, si fournie
    } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ msg: "Élève non trouvé" });
    }

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob > new Date()) {
      return res.status(400).json({ msg: "Date de naissance invalide." });
    }

    // Mise à jour des informations de base de l'élève
    student.firstName = firstName || student.firstName;
    student.lastName = lastName || student.lastName;
    student.dateOfBirth = dob || student.dateOfBirth;
    student.gender = gender || student.gender;
    student.classId = classId || student.classId;
    student.motherName = motherName || student.motherName;
    student.fatherPhone = fatherPhone || student.fatherPhone;
    student.motherPhone = motherPhone || student.motherPhone;
    student.parentsAddress = parentsAddress || student.parentsAddress;

    // Gestion de l'upload de la photo
    if (req.file) {
      try {
        if (student.photo) {
          const publicIdMatch = student.photo.match(/\/(?:v\d+\/)?([^/]+)\.\w+$/);
          const publicId = publicIdMatch ? `students/${publicIdMatch[1]}` : null;
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'students',
          public_id: `${firstName.toLowerCase()}-${Date.now()}`,
          resource_type: 'image',
        });
        student.photo = result.secure_url;
      } catch (error) {
        console.error('Erreur lors de l\'upload de la photo sur Cloudinary :', error);
        return res.status(500).json({ msg: 'Erreur lors de l\'upload de la photo' });
      }
    }

    // Gestion des paiements
    if (payments) {
      let paymentData;
      try {
        paymentData = JSON.parse(payments);
        console.log('Données de paiement analysées :', paymentData);
      } catch (err) {
        console.error('Erreur de parsing JSON des paiements:', err);
        return res.status(400).json({ msg: "Format des paiements invalide." });
      }

      if (Array.isArray(paymentData) && paymentData.length > 0) {
        paymentData.forEach((payment) => {
          const existingPayment = student.payments.find(p => p.transactionId === payment.transactionId);

          if (existingPayment) {
            // Mise à jour du paiement existant
            existingPayment.amount = payment.amount || existingPayment.amount;
            existingPayment.method = payment.method || existingPayment.method;
          } else {
            // Ajout d'un nouveau paiement
            student.payments.push({
              amount: payment.amount || 0,
              method: payment.method || 'Espèces',
              transactionId: payment.transactionId || `TXN-${Date.now()}`
            });
          }
        });
      }
    }

    await student.save();

    const updatedStudent = await Student.findById(id)
      .populate('classId')
      .populate('establishmentId');

    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'élève:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la mise à jour de l\'élève' });
  }
};


exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Vérifier s'il existe des notes associées
    const associatedNotes = await DevoirCompo.find({ student: studentId });
    if (associatedNotes.length > 0) {
      return res.status(400).json({
        msg: 'Cet élève ne peut pas être supprimé car il a des notes associées.',
      });
    }

    // Vérifier s'il existe une carte scolaire associée
    const associatedSchoolCard = await SchoolCard.findOne({ student: studentId });
    if (associatedSchoolCard) {
      return res.status(400).json({
        msg: 'Cet élève ne peut pas être supprimé car il possède une carte scolaire associée.',
      });
    }

    // Vérifier s'il existe un bulletin associé
    const associatedBulletin = await Bulletin.findOne({ student: studentId });
    if (associatedBulletin) {
      return res.status(400).json({
        msg: 'Cet élève ne peut pas être supprimé car il possède un bulletin associé.',
      });
    }

    // Rechercher l'étudiant à supprimer
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Élève non trouvé' });
    }

    // Supprimer l'utilisateur associé
    await User.findOneAndDelete({ studentId: student._id });

    // Supprimer la photo de Cloudinary si elle existe
    if (student.photo) {
      try {
        const publicIdMatch = student.photo.match(/students\/([^/]+)\.(jpg|jpeg|png)$/);
        if (publicIdMatch) {
          const publicId = `students/${publicIdMatch[1]}`;
          await cloudinary.uploader.destroy(publicId);
          console.log('Photo supprimée avec succès de Cloudinary');
        } else {
          console.error('ID public de l\'image introuvable pour la suppression.');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la photo de Cloudinary:', error.message);
      }
    }

    // Supprimer l'étudiant
    await Student.findByIdAndDelete(studentId);

    res.status(200).json({ msg: 'Élève et utilisateur associé supprimés avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'élève:', err.message);
    res.status(500).json({ msg: 'Erreur du serveur lors de la suppression de l\'élève' });
  }
};




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







// exports.getSchoolCards = async (req, res) => {
//   try {
//     const schoolCards = await SchoolCard.find()
    

//       .populate({
//         path: 'student',
//         select: 'firstName lastName matricule dateOfBirth motherPhone parentsAddress classId photo',  // Ajoutez 'photo' ici
//         populate: { path: 'classId', select: 'name level' }  // Garder la population de la classe comme c'est
//       })
      
     
//      .populate({
//     path: 'establishment',
//     select: 'name address phoneNumber academicYears',
//     populate: {
//       path: 'academicYears.yearId',
//       match: { isActive: true },  // Filtrer pour obtenir uniquement l'année active
//       select: 'startYear endYear',
//     }
//   });
      
      
      

//     if (!schoolCards.length) {
//       return res.status(404).json({ msg: 'Aucune carte scolaire trouvée.' });
//     }

//     res.status(200).json({ cards: schoolCards });
//   } catch (err) {
//     console.error('Erreur lors de la récupération des cartes scolaires:', err);
//     res.status(500).json({ msg: 'Erreur du serveur lors de la récupération des cartes scolaires' });
//   }
// };

exports.getSchoolCards = async (req, res) => {
  try {
    const { establishmentId } = req.query; // Récupérer l'identifiant de l'établissement depuis les paramètres de requête

    // Log de vérification de `establishmentId`
    console.log('Requête reçue pour récupérer les cartes scolaires avec establishmentId:', establishmentId);

    // Vérifier si l'identifiant de l'établissement est fourni
    if (!establishmentId) {
      console.error('Erreur: Aucun identifiant d\'établissement fourni.');
      return res.status(400).json({ msg: 'Veuillez fournir un identifiant d\'établissement.' });
    }

    // Log pour confirmer le filtre par `establishmentId`
    console.log('Recherche de cartes scolaires pour l\'établissement:', establishmentId);

    const schoolCards = await SchoolCard.find({ establishment: establishmentId }) // Filtrer par établissement
      .populate({
        path: 'student',
        select: 'firstName lastName matricule dateOfBirth motherPhone parentsAddress classId photo', 
        populate: { path: 'classId', select: 'name level' }
      })
      .populate({
        path: 'establishment',
        select: 'name address phoneNumber academicYears',
        populate: {
          path: 'academicYears.yearId',
          match: { isActive: true },
          select: 'startYear endYear',
        }
      });

    // Log pour vérifier si des cartes ont été trouvées
    console.log('Cartes scolaires trouvées:', schoolCards.length);

    if (!schoolCards.length) {
      console.warn('Aucune carte scolaire trouvée pour cet établissement.');
      return res.status(404).json({ msg: 'Aucune carte scolaire trouvée pour cet établissement.' });
    }

    // Log des cartes récupérées
    console.log('Données des cartes scolaires:', schoolCards);

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

// Contrôleur pour régénérer le mot de passe d'un étudiantconst bcrypt = require('bcryptjs');

exports.regeneratePassword = async (req, res) => {
  const { matricule } = req.body;

  try {
    // Vérifier si le matricule est fourni
    if (!matricule) {
      return res.status(400).json({ message: 'Matricule est requis' });
    }

    // Rechercher l'utilisateur avec le matricule dans le modèle User
    const user = await User.findOne({ matricule });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable avec ce matricule" });
    }

    // Générer un nouveau mot de passe
    const newPassword = Math.random().toString(36).slice(-8); // Mot de passe aléatoire de 8 caractères
    //const hashedPassword = await bcrypt.hash(newPassword, 10); // Hachage du mot de passe

    // Mettre à jour le mot de passe dans le modèle User
    user.password = newPassword;
    await user.save();

    // Envoyer le nouveau mot de passe en réponse (en clair)
    res.status(200).json({ newPassword });
  } catch (error) {
    console.error('Erreur lors de la régénération du mot de passe:', error);
    res.status(500).json({ message: "Erreur serveur lors de la régénération du mot de passe" });
  }
};

