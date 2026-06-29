import { app, bootstrap } from "./app.js";
import { config } from "./src/config.js";

await bootstrap();

app.listen(config.port, () => {
  console.log(`Flashcard local API running at http://localhost:${config.port}`);
  console.log(`Data store: ${config.dataStore}`);
  console.log("Sample accounts in local mode: student/password123 and teacher/password123");
  console.log(`Study app: http://localhost:${config.port}/study`);
});
