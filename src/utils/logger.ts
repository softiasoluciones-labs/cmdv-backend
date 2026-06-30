import winston from "winston";
import path from "path";
import LokiTransport from "winston-loki";

const levels = { 
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => { 
    const evn = process.env.NODE_ENV || "development";  
    const isDevelopment = evn === "development";
    return isDevelopment ? "debug" : "warn";
}

const colors = {    
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports: winston.transport[] = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

if (process.env.LOKI_HOST) {
  transports.push(
    new LokiTransport({
      host: process.env.LOKI_HOST,
      labels: { app: 'cmdv-backend', env: process.env.NODE_ENV || 'development' },
      json: true,
      format: winston.format.json(),
      onConnectionError: (err: Error) => console.error('Loki connection error:', err.message),
    })
  );
}

export const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};



