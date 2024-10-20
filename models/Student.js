

const mongoose = require('mongoose');

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
  type: String, // Stocke le chemin de l'image de l'élève
},


// Champs ajoutés pour les informations des parents
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
});




// Middleware pour générer automatiquement l'identifiant de l'élève
StudentSchema.pre('save', async function (next) {
  if (!this.matricule) {
    try {
      const currentYear = new Date().getFullYear().toString().slice(-2); // Deux derniers chiffres de l'année

      // Récupérer les informations de l'établissement
      const establishment = await mongoose.model('Establishment').findById(this.establishmentId);
      if (!establishment) {
        throw new Error('Établissement introuvable');
      }

      // Récupérer les informations de la classe
      const classInfo = await mongoose.model('Class').findById(this.classId).exec();
      if (!classInfo) {
        throw new Error('Classe introuvable');
      }

      // Codes pour la région, l'établissement, et le niveau d'enseignement
      const regionCode = establishment.codeRegion || 'XXX';  // Code de la région
      const establishmentCode = establishment.codeEtablissement || 'YYY';  // Code de l'établissement
      const levelCode = classInfo.level[0].toUpperCase(); // Premier caractère du niveau d'enseignement (P, C, L)

      // Compter les élèves dans cet établissement pour générer un numéro séquentiel
      const studentCount = await mongoose
        .model('Student')
        .countDocuments({ establishmentId: this.establishmentId });

      const newStudentNumber = (studentCount + 1).toString().padStart(6, '0'); // Générer un numéro séquentiel sur 6 chiffres

      // Générer le matricule final
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
