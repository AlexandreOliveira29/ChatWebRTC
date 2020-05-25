import winston, { Logger } from 'winston';

export default function logger(): Logger {
  const winstonOptions = {
    levels: winston.config.syslog.levels,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf((msg) => {
            const message =
              typeof msg.message === 'object'
                ? JSON.stringify(msg.message)
                : msg.message;
            return `${msg.timestamp} / WebRTCServer / ${msg.level}: ${message}`;
          })
        )
      })
    ]
  };

  const logger = winston.createLogger(winstonOptions);
  return logger;
}
