import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env.config";
import pinoHttp from "pino-http";
import logger from "./utils/logger.util";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.config";
import { eq } from "drizzle-orm";
import { participantsDb } from "../../../packages/db/sqlite/client";
import { participants } from "../../../packages/db/sqlite/schema";
import { normalizeParticipantEmail } from "../../../packages/db/sqlite/participant-email";
import { buildCorsOptions } from "./config/cors.config";


const app = express();

const corsOptions = buildCorsOptions(env.WEB_URL, env.ADMIN_URL);

app.use(
  pinoHttp({
    logger,
    genReqId: (req) => crypto.randomUUID(),
    redact: ['req.headers.authorization','req.headers.cookie'],
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers:{
      req: (req) => ({method: req.method, url: req.url, remoteAddress: req.remoteAddress}),
      res: (res) => ({statusCode: res.satusCode}),
    },
    customSuccessMessage: (req,res) => `${req.method}${req.url} - ${res.statusCode}`,
    customErrorMessage:(req,res,err) => `${req.method}${req.url}-${res.statusCode}-${err.message}`,
  })
)

app.use(cors(corsOptions));

app.all("/api/auth/*splat", toNodeHandler(auth))

app.get("/api/debug/participant-status", async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ authenticated: false });
    }

    const email = normalizeParticipantEmail(session.user.email);
    const participant = await participantsDb
      .select({ email: participants.email })
      .from(participants)
      .where(eq(participants.email, email))
      .get();
    return res.json({
      authenticated: true,
      email,
      participantFound: Boolean(participant),
    });
  } catch (error) {
    return next(error);
  }
});

app.use(express.json());


app.get("/", (req, res) => {
  res.send("API root running. Use /api/health or /api/analyze");
});



app.use("/api", routes);
app.use(errorHandler);

export default app;
