import { app, bootstrap } from "./app.js";
import { config } from "./src/config.js";
import { attachRealtimeServer } from "./src/realtimeServer.js";
import { repositories } from "./app.js";

await bootstrap();

const server = app.listen(config.port, () => {
  console.log(`Flashcard local API running at http://localhost:${config.port}`);
  console.log(`Data store: ${config.dataStore}`);
  console.log("Sample accounts in local mode: student/password123 and teacher/password123");
  console.log(`Study app: http://localhost:${config.port}/study`);
  console.log(`Game app: http://localhost:${config.port}/game`);
});

attachRealtimeServer(server, config, repositories);
