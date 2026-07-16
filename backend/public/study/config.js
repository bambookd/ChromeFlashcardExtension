window.FLASHCARD_CONFIG = {
  // Empty means same-origin local Express API. For S3 hosting, set this to API Gateway.
  API_BASE_URL: "",
  GAME_URL: "/game/"

  // AWS deployment example:
  // API_BASE_URL: "https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com",
  // GAME_URL: "http://YOUR_GAME_BUCKET.s3-website-ap-southeast-1.amazonaws.com"
};
