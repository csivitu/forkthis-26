import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env.config";
import pinoHttp from "pino-http";
import logger from "./utils/logger.util";

const app = express();

const corsOptions = {
  origin: [env.WEB_URL],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-request-id'] ?? crypto.randomUUID(),
    serializers: {
      req: (req) => ({ method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
      err: (err) => ({
        type: err.type,
        message: err.message
      })
    },
    redact: ['req.headers.authorization'],
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
)

app.use(cors(corsOptions));
app.use(express.json());


app.get("/", (req, res) => {
  res.send("API root running. Use /api/health or /api/analyze");
});



app.use("/api", routes);
app.use(errorHandler);

export default app;