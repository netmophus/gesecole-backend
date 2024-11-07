const Moyenne = require('../models/Moyenne');
const Student = require('../models/Student');
const Class = require('../models/Class');

// Créer une moyenne
exports.createMoyenne = async (req, res) => {
  try {
    const { student, classId, semester, average, academicYear } = req.body;

    // Vérifier si l'élève existe
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Élève introuvable' });
    }

    // Créer la moyenne
    const moyenne = await Moyenne.create({
      student,
      classId,
      semester,
      average,
      academicYear,
    });

    res.status(201).json(moyenne);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir toutes les moyennes (optionnel : filtrage par classe et semestre)
exports.getMoyennes = async (req, res) => {
  try {
    const { classId, semester } = req.query;
    const filter = {};

    if (classId) filter.classId = classId;
    if (semester) filter.semester = semester;

    const moyennes = await Moyenne.find(filter).populate('student', 'firstName lastName');
    res.status(200).json(moyennes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les moyennes d'un élève spécifique
exports.getMoyenneByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const moyennes = await Moyenne.find({ student: studentId }).populate('classId', 'name');

    if (!moyennes) {
      return res.status(404).json({ message: 'Moyennes introuvables pour cet élève' });
    }

    res.status(200).json(moyennes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une moyenne spécifique
exports.updateMoyenne = async (req, res) => {
  try {
    const { id } = req.params;
    const { average } = req.body;

    // Trouver et mettre à jour la moyenne
    const updatedMoyenne = await Moyenne.findByIdAndUpdate(
      id,
      { average },
      { new: true, runValidators: true }
    );

    if (!updatedMoyenne) {
      return res.status(404).json({ message: 'Moyenne introuvable' });
    }

    res.status(200).json(updatedMoyenne);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une moyenne spécifique
exports.deleteMoyenne = async (req, res) => {
  try {
    const { id } = req.params;

    const moyenne = await Moyenne.findByIdAndDelete(id);

    if (!moyenne) {
      return res.status(404).json({ message: 'Moyenne introuvable' });
    }

    res.status(200).json({ message: 'Moyenne supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les moyennes par classe et semestre
exports.getMoyennesByClassAndSemester = async (req, res) => {
  try {
    const { classId, semester } = req.params;

    const moyennes = await Moyenne.find({ classId, semester }).populate('student', 'firstName lastName');

    if (!moyennes || moyennes.length === 0) {
      return res.status(404).json({ message: 'Aucune moyenne trouvée pour cette classe et ce semestre' });
    }

    res.status(200).json(moyennes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
