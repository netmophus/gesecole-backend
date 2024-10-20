
const mongoose = require('mongoose');

const EstablishmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  type: {
    type: String,
    enum: ['Public', 'Prive', 'Professionnel'],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  promoterName: {
    type: String,
    required: false,
  },
  yearOfCreation: {
    type: Number,
    required: false,
  },
  authorization: {
    type: String,
    required: false,
  },
  codeRegion: {
    type: String,
    required: function () {
      return this.isConfigured;  
    },
    minlength: 3,
    maxlength: 3,
  },
  codeEtablissement: {
    type: String,
    required: function () {
      return this.isConfigured;
    },
    minlength: 3,
    maxlength: 3,
    unique: true,
  },
  code: {
    type: String,
    unique: true,
    required: function () {
      return this.isConfigured;
    },
  },
  region: {
    type: String,
    required: function () {
      return this.isConfigured;
    },
  },
  maxStudents: {
    type: Number,
    required: false,
  },
  contactEmail: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  isConfigured: {
    type: Boolean,
    default: false,  
  },
  // Ajout d'un tableau pour gérer plusieurs années académiques
  academicYears: [{
    yearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',  // Référence à l'année académique
      required: true
    },
    isActive: {
      type: Boolean,  // Indique si c'est l'année académique en cours
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

EstablishmentSchema.pre('save', function (next) {
  if (this.isConfigured && !this.code) {
    this.code = `${this.codeRegion}-${this.codeEtablissement}`;
  }
  next();
});

const Establishment = mongoose.model('Establishment', EstablishmentSchema);

module.exports = Establishment;
