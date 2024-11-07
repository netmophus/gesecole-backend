const mongoose = require('mongoose');

const AcademicYearSchema = new mongoose.Schema({
  startYear: {
    type: Number,  // Année de début, par exemple: 2023
    required: true
  },
  endYear: {
    type: Number,  // Année de fin, par exemple: 2024
    required: true
  },
  isActive: {
    type: Boolean,  // Pour indiquer quelle année académique est active
    default: false
  }
});


AcademicYearSchema.index({ startYear: 1, endYear: 1 }, { unique: true });

AcademicYearSchema.pre('save', async function (next) {
  if (this.isActive) {
    await AcademicYear.updateMany({ _id: { $ne: this._id } }, { isActive: false });
  }
  next();
});

const AcademicYear = mongoose.model('AcademicYear', AcademicYearSchema);

module.exports = AcademicYear;

