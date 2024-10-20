const Bulletin = require('../models/Bulletin');

exports.calculateClassAverages = async (classId, period, year) => {
    const bulletins = await Bulletin.find({ classId, period, year });
    const totalAverage = bulletins.reduce((acc, bulletin) => acc + (bulletin.average || 0), 0);
    const classAverage = totalAverage / bulletins.length;

    const bestAverage = Math.max(...bulletins.map(b => b.average || 0));
    const lowestAverage = Math.min(...bulletins.map(b => b.average || 0));

    return {
        classAverage,
        bestAverage,
        lowestAverage
    };
};
