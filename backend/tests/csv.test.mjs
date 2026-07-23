import assert from "node:assert/strict";
import test from "node:test";

// csv.js is a browser script that attaches itself to globalThis, so importing
// it here exercises exactly the file the Study page loads.
await import("../public/study/csv.js");

const csv = globalThis.FlashcardCsv;

test("parses a comma file with a header row", () => {
  const result = csv.parse("word,meaning,wordform,category\nresilient,kiên cường,adjective,IELTS\n");

  assert.equal(result.delimiter, ",");
  assert.equal(result.hasHeader, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.rows, [
    { line: 2, word: "resilient", meaning: "kiên cường", wordform: "adjective", category: "IELTS" }
  ]);
});

test("falls back to column order when there is no header", () => {
  const result = csv.parse("resilient,kiên cường,adjective,IELTS\n");

  assert.equal(result.hasHeader, false);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].word, "resilient");
  assert.equal(result.rows[0].category, "IELTS");
});

test("reads headers in any order and ignores unknown columns", () => {
  const result = csv.parse("category,note,word,meaning\nIELTS,skip me,resilient,kiên cường\n");

  assert.deepEqual(result.rows, [
    { line: 2, word: "resilient", meaning: "kiên cường", wordform: "", category: "IELTS" }
  ]);
});

test("detects a semicolon file exported by Excel", () => {
  const result = csv.parse("word;meaning;wordform;category\nresilient;kiên cường, bền bỉ;adjective;IELTS\n");

  assert.equal(result.delimiter, ";");
  assert.equal(result.rows[0].meaning, "kiên cường, bền bỉ");
});

test("detects a tab separated file", () => {
  const result = csv.parse("word\tmeaning\nresilient\tkiên cường\n");

  assert.equal(result.delimiter, "\t");
  assert.equal(result.rows[0].meaning, "kiên cường");
});

test("keeps delimiters, quotes and newlines that sit inside quoted fields", () => {
  const result = csv.parse([
    "word,meaning,wordform,category",
    "\"give up\",\"to quit, to stop\",phrasal verb,IELTS",
    "\"quote\",\"he said \"\"no\"\"\",noun,General",
    "\"multi\",\"line one\nline two\",noun,General"
  ].join("\n"));

  assert.deepEqual(result.errors, []);
  assert.equal(result.rows[0].meaning, "to quit, to stop");
  assert.equal(result.rows[1].meaning, "he said \"no\"");
  assert.equal(result.rows[2].meaning, "line one\nline two");
});

test("strips a UTF-8 BOM so the first header is still recognised", () => {
  const result = csv.parse("﻿word,meaning\nresilient,kiên cường\n");

  assert.equal(result.hasHeader, true);
  assert.equal(result.rows[0].word, "resilient");
});

test("reports rows without a word and keeps the source line number", () => {
  const result = csv.parse("word,meaning\nresilient,kiên cường\n,orphan meaning\n");

  assert.equal(result.rows.length, 1);
  assert.deepEqual(result.errors, [{ line: 3, message: "Missing word", word: "" }]);
});

test("reports rows without a meaning because the sync endpoint rejects them", () => {
  const result = csv.parse("word,meaning\nresilient,\n");

  assert.equal(result.rows.length, 0);
  assert.equal(result.errors[0].message, "Missing meaning");
  assert.equal(result.errors[0].word, "resilient");
});

test("skips blank lines without shifting later line numbers", () => {
  const result = csv.parse("word,meaning\n\nresilient,kiên cường\n\n\nbrave,dũng cảm\n");

  assert.deepEqual(result.rows.map((row) => row.line), [3, 6]);
});

test("defaults a missing category and truncates a long one", () => {
  const result = csv.parse(`word,meaning,wordform,category\nresilient,kiên cường,,\nbrave,dũng cảm,,${"x".repeat(60)}\n`);

  assert.equal(result.rows[0].category, "Uncategorized");
  assert.equal(result.rows[1].category.length, 40);
});

test("normalises known wordforms and passes unknown ones through", () => {
  const result = csv.parse("word,meaning,wordform\na,x,Adjective\nb,y,Phrasal Verb\nc,z,classifier\n");

  assert.deepEqual(result.rows.map((row) => row.wordform), ["adjective", "phrasal verb", "classifier"]);
});

test("stops and reports once the row cap is passed", () => {
  const lines = ["word,meaning"];

  for (let index = 0; index < csv.MAX_ROWS + 10; index += 1) {
    lines.push(`word${index},meaning${index}`);
  }

  const result = csv.parse(lines.join("\n"));

  assert.equal(result.rows.length, csv.MAX_ROWS);
  assert.match(result.errors.at(-1).message, /more than 1000 rows/);
});

test("parses empty input without throwing", () => {
  assert.deepEqual(csv.parse("").rows, []);
  assert.deepEqual(csv.parse("   \n\n").rows, []);
});

test("planImport skips words that already exist in the library", () => {
  const rows = csv.parse("word,meaning\nresilient,a\nbrave,b\n").rows;
  const plan = csv.planImport(rows, [{ word: "Resilient" }]);

  assert.deepEqual(plan.additions.map((row) => row.word), ["brave"]);
  assert.equal(plan.duplicates.length, 1);
  assert.equal(plan.duplicates[0].reason, "library");
});

test("planImport keeps only the first of repeated words inside one file", () => {
  const rows = csv.parse("word,meaning\nresilient,first\nRESILIENT ,second\n").rows;
  const plan = csv.planImport(rows, []);

  assert.deepEqual(plan.additions.map((row) => row.meaning), ["first"]);
  assert.equal(plan.duplicates[0].reason, "file");
});

test("serialize writes a BOM, CRLF endings and the fixed column order", () => {
  const text = csv.serialize([
    { word: "resilient", meaning: "kiên cường", wordform: "adjective", category: "IELTS" }
  ]);

  assert.equal(text.charCodeAt(0), 0xfeff);
  assert.equal(text.slice(1), "word,meaning,wordform,category\r\nresilient,kiên cường,adjective,IELTS\r\n");
});

test("serialize quotes fields holding a delimiter, quote or newline", () => {
  const text = csv.serialize([
    { word: "give up", meaning: "to quit, to stop", wordform: "phrasal verb", category: "" },
    { word: "quote", meaning: "he said \"no\"", wordform: "noun", category: "General" },
    { word: "multi", meaning: "line one\nline two", wordform: "noun", category: "General" }
  ]).slice(1);

  assert.match(text, /"to quit, to stop"/);
  assert.match(text, /"he said ""no"""/);
  assert.match(text, /"line one\nline two"/);
  assert.match(text, /give up,"to quit, to stop",phrasal verb,Uncategorized/);
});

test("export then import returns the same cards", () => {
  const cards = [
    { word: "resilient", meaning: "kiên cường, bền bỉ", wordform: "adjective", category: "IELTS" },
    { word: "give up", meaning: "he said \"stop\"", wordform: "phrasal verb", category: "Uncategorized" },
    { word: "multi", meaning: "line one\nline two", wordform: "noun", category: "General" }
  ];

  const parsed = csv.parse(csv.serialize(cards));

  assert.deepEqual(result(parsed), cards);

  function result(value) {
    return value.rows.map((row) => ({
      word: row.word,
      meaning: row.meaning,
      wordform: row.wordform,
      category: row.category
    }));
  }
});

test("buildFileName is filesystem safe", () => {
  const name = csv.buildFileName("Demo User", "IELTS / Unit 1", new Date("2026-07-23T10:00:00Z"));

  assert.equal(name, "flashcards-demo-user-ielts-unit-1-2026-07-23.csv");
  assert.equal(csv.buildFileName("", "", new Date("2026-07-23T10:00:00Z")), "flashcards-user-all-2026-07-23.csv");
});

test("the bundled template parses back into two valid rows", () => {
  const parsed = csv.parse(csv.template());

  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.rows.length, 2);
});
