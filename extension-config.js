// Client-side endpoint mapping for the extension. These are public endpoints
// (the deployed website exposes the same API URL in its own config.js), so they
// are safe to commit. Swap in the localhost lines below for local development.
globalThis.FLASHCARD_CONFIG = {
  // Local development — swap these two lines back in to test against localhost:
  // API_BASE_URL: "http://localhost:3000",
  // STUDY_URL: "http://localhost:3000/study/"

  // AWS deployment (active) — stack chrome-flashcard-axiza, Amplify HTTPS at axiza.net:
  API_BASE_URL: "https://api.axiza.net",
  STUDY_URL: "https://axiza.net/study/"
};
