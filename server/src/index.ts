import http from "node:http";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";
import { startQueueEventBridge } from "./services/queueEventService.js";
import { initSocket } from "./services/socketService.js";

async function bootstrap() {
  await connectDatabase();
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  startQueueEventBridge();

  server.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error(error);
  process.exit(1);
});
