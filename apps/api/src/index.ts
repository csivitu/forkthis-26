import app from "./app";
import { env } from "./config/env.config";
import logger from "./utils/logger.util";

const PORT = env.PORT;



app.listen(PORT, () => {
  logger.info({port:PORT},"Server Listeninig")
});