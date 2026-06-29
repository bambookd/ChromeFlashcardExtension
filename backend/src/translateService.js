import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import { httpError } from "./errors.js";
import { normalizeOptionalString, normalizeRequiredString } from "./validation.js";

export function createTranslateService(config) {
  const client = new TranslateClient({ region: config.awsRegion });

  return {
    async translate(payload) {
      const text = normalizeRequiredString(payload?.text || payload?.word, "text");

      if (text.length > config.translateMaxLength) {
        throw httpError(400, `Text must be ${config.translateMaxLength} characters or fewer`);
      }

      if (!config.useAmazonTranslate) {
        const mock = createMockTranslation(text);
        return {
          ok: true,
          word: text,
          meaning: mock.meaning,
          wordform: mock.wordform,
          provider: "local-mock-translate"
        };
      }

      const sourceLanguageCode = normalizeOptionalString(payload?.sourceLanguageCode) || "auto";
      const targetLanguageCode = normalizeOptionalString(payload?.targetLanguageCode) || "vi";
      const response = await client.send(new TranslateTextCommand({
        Text: text,
        SourceLanguageCode: sourceLanguageCode,
        TargetLanguageCode: targetLanguageCode
      }));

      return {
        ok: true,
        word: text,
        meaning: response.TranslatedText || "",
        wordform: "unknown",
        provider: "amazon-translate"
      };
    }
  };
}

function createMockTranslation(word) {
  const dictionary = new Map([
    ["resilient", { meaning: "Able to recover quickly from difficulty.", wordform: "adjective" }],
    ["meticulous", { meaning: "Very careful and attentive to detail.", wordform: "adjective" }],
    ["innovate", { meaning: "To introduce a new idea, method, or product.", wordform: "verb" }],
    ["clarity", { meaning: "The quality of being clear and easy to understand.", wordform: "noun" }]
  ]);

  const key = word.toLowerCase();

  if (dictionary.has(key)) {
    return dictionary.get(key);
  }

  return {
    meaning: `Simulated translation for "${word}". Replace this with Amazon Translate in production.`,
    wordform: "unknown"
  };
}
