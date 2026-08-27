import app from "./app";
import config from "./config/env.config";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});