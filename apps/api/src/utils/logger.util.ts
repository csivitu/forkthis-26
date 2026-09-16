import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
  level: isDev ? 'debug' : 'info',
  base:null,
  transport: isDev? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore:'pid,hostname,req,res,responseTime,port',
    },
    
  } : undefined,
  
});

export default logger;

