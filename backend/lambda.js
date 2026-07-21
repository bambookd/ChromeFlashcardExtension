import serverless from "serverless-http";
import { app, bootstrap } from "./app.js";

let bootstrapped = false;

async function ensureBootstrap() {
  if (!bootstrapped) {
    await bootstrap();
    bootstrapped = true;
  }
}

const serverlessHandler = serverless(app);

export async function handler(event, context) {
  await ensureBootstrap();
  return serverlessHandler(event, context);
}
