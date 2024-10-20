
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Configuration du logger avec rotation quotidienne
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new DailyRotateFile({
            filename: 'logs/%DATE%.log', // Spécifie le format du nom de fichier
            datePattern: 'YYYY-MM-DD', // Format de la date
            zippedArchive: true, // Archive le fichier pour économiser de l'espace
            maxSize: '20m', // Taille maximale du fichier log avant rotation
            maxFiles: '14d', // Conserver les logs pendant 14 jours
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
        new winston.transports.Console(), // Afficher les logs dans la console
    ],
});

// Exporter le logger
module.exports = logger;
