import { createDynamoRepositories } from "./dynamoRepositories.js";
import { createLocalRepositories } from "./localRepositories.js";

export function createRepositories(config) {
  if (config.dataStore === "dynamodb") {
    return createDynamoRepositories(config);
  }

  return createLocalRepositories(config);
}
