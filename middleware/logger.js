// logger.js
import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] : ${stack || message}`;
});

const logger = winston.createLogger({
  level: 'info', // default log level
  format: combine(
    colorize(), // add colors in console
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // include stack trace for errors
    logFormat
  ),
  transports: [
    new winston.transports.Console(), // show logs in console
    new winston.transports.File({ filename: 'logs/errors.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log'}),
  ],
});


export default logger;
