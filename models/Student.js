

// const mongoose = require('mongoose');
// const Class = require('./Class'); // Assurez-vous d'importer le modèle Class


// // Schéma de l'élève
// const StudentSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//     required: true,
//   },
//   dateOfBirth: {
//     type: Date,
//     required: true,
//   },
//   matricule: {
//     type: String,
//     unique: true,
//   },
//   gender: {
//     type: String,
//     enum: ['Masculin', 'Feminin'],
//     required: true,
//   },
//   classId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Class',
//     required: true,
//   },
//   establishmentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Establishment',
//     required: true,
//   },
//   photo: {
//     type: String,
//   },
//   motherName: {
//     type: String,
//     default: '',
//   },
//   fatherPhone: {
//     type: String,
//     default: '',
//   },
//   motherPhone: {
//     type: String,
//     default: '',
//   },
//   parentsAddress: {
//     type: String,
//     default: '',
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Middleware pour retirer l'étudiant de la classe avant sa suppression
// StudentSchema.pre('remove', async function (next) {
//   try {
//     // Trouver la classe à laquelle l'étudiant est associé
//     const studentClass = await Class.findById(this.classId);
//     if (studentClass) {
//       // Retirer l'ID de l'étudiant du tableau 'students'
//       studentClass.students.pull(this._id);
//       await studentClass.save();
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Middleware pour générer automatiquement l'identifiant de l'élève
// StudentSchema.pre('save', async function (next) {
//   if (!this.matricule) {
//     try {
//       const currentYear = new Date().getFullYear().toString().slice(-2);

//       const establishment = await mongoose.model('Establishment').findById(this.establishmentId);
//       if (!establishment) {
//         throw new Error('Établissement introuvable');
//       }

//       const classInfo = await mongoose.model('Class').findById(this.classId).exec();
//       if (!classInfo) {
//         throw new Error('Classe introuvable');
//       }

//       const regionCode = establishment.codeRegion || 'XXX';
//       const establishmentCode = establishment.codeEtablissement || 'YYY';
//       const levelCode = classInfo.level[0].toUpperCase();

//       const studentCount = await mongoose
//         .model('Student')
//         .countDocuments({ establishmentId: this.establishmentId });

//       const newStudentNumber = (studentCount + 1).toString().padStart(6, '0');

//       this.matricule = `${regionCode}-${establishmentCode}-${levelCode}-${currentYear}-${newStudentNumber}`;
//       console.log('Matricule généré:', this.matricule);

//     } catch (error) {
//       return next(error);
//     }
//   }
//   next();
// });

// const Student = mongoose.model('Student', StudentSchema);
// module.exports = Student;







const mongoose = require('mongoose');
const Class = require('./Class'); // Assurez-vous d'importer le modèle Class


// Schéma pour chaque enregistrement de paiement
const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ['Espèces', 'Carte', 'Virement'],
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    required: true,
  },
  receiptGenerated: {
    type: Boolean,
    default: false,
  }
});






// Schéma de l'élève
const StudentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  matricule: {
    type: String,
    unique: true,
  },
  gender: {
    type: String,
    enum: ['Masculin', 'Feminin'],
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  establishmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true,
  },
  photo: {
    type: String,
  },
  motherName: {
    type: String,
    default: '',
  },
  fatherPhone: {
    type: String,
    default: '',
  },
  motherPhone: {
    type: String,
    default: '',
  },
  parentsAddress: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  payments: [PaymentSchema], // Ajout du champ "payments" pour l'historique des paiements
});

// Middleware pour retirer l'étudiant de la classe avant sa suppression
StudentSchema.pre('remove', async function (next) {
  try {
    // Trouver la classe à laquelle l'étudiant est associé
    const studentClass = await Class.findById(this.classId);
    if (studentClass) {
      // Retirer l'ID de l'étudiant du tableau 'students'
      studentClass.students.pull(this._id);
      await studentClass.save();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pour générer automatiquement l'identifiant de l'élève
StudentSchema.pre('save', async function (next) {
  if (!this.matricule) {
    try {
      const currentYear = new Date().getFullYear().toString().slice(-2);

      const establishment = await mongoose.model('Establishment').findById(this.establishmentId);
      if (!establishment) {
        throw new Error('Établissement introuvable');
      }

      const classInfo = await mongoose.model('Class').findById(this.classId).exec();
      if (!classInfo) {
        throw new Error('Classe introuvable');
      }

      const regionCode = establishment.codeRegion || 'XXX';
      const establishmentCode = establishment.codeEtablissement || 'YYY';
      const levelCode = classInfo.level[0].toUpperCase();

      const studentCount = await mongoose
        .model('Student')
        .countDocuments({ establishmentId: this.establishmentId });

      const newStudentNumber = (studentCount + 1).toString().padStart(6, '0');

      this.matricule = `${regionCode}-${establishmentCode}-${levelCode}-${currentYear}-${newStudentNumber}`;
      console.log('Matricule généré:', this.matricule);

    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;
