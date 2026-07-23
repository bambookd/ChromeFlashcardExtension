/**
 * CSV import/export logic for the Study web library.
 *
 * Pure functions only: no DOM, no fetch, no globals beyond the export below.
 * The browser loads this as a plain script before app.js; scripts/test-csv.mjs
 * loads the same file in Node to test it.
 */
(function attach(root) {
  const BOM = "﻿";
  const COLUMNS = ["word", "meaning", "wordform", "category"];
  const DELIMITERS = [",", ";", "\t"];
  const MAX_ROWS = 1000;
  const MAX_CATEGORY_LENGTH = 40;
  const DEFAULT_CATEGORY = "Uncategorized";

  const HEADER_ALIASES = {
    word: "word",
    meaning: "meaning",
    wordform: "wordform",
    "word form": "wordform",
    word_form: "wordform",
    category: "category"
  };

  const WORDFORMS = [
    "noun",
    "verb",
    "adjective",
    "adverb",
    "pronoun",
    "preposition",
    "conjunction",
    "interjection",
    "phrase",
    "phrasal verb",
    "idiom",
    "unknown"
  ];

  /**
   * Parses CSV text into flashcard rows.
   *
   * Returns { delimiter, hasHeader, rows, errors }. `rows` holds rows that the
   * backend will accept; `errors` holds rejected rows with the reason and the
   * source line number so the user can fix the file.
   */
  function parse(text) {
    const source = stripBom(String(text || ""));

    if (!source.trim()) {
      return { delimiter: ",", hasHeader: false, rows: [], errors: [] };
    }

    const delimiter = detectDelimiter(source);
    const records = tokenize(source, delimiter);

    if (records.length === 0) {
      return { delimiter, hasHeader: false, rows: [], errors: [] };
    }

    const headerMap = readHeaderMap(records[0].cells);
    const hasHeader = headerMap !== null;
    const columnIndex = headerMap || positionalMap();
    const dataRecords = hasHeader ? records.slice(1) : records;
    const rows = [];
    const errors = [];

    for (const record of dataRecords) {
      if (rows.length + errors.length >= MAX_ROWS) {
        errors.push({
          line: record.line,
          message: `File has more than ${MAX_ROWS} rows. Split it and import again.`
        });
        break;
      }

      const row = readRow(record, columnIndex);
      const problem = findRowProblem(row);

      if (problem) {
        errors.push({ line: record.line, message: problem, word: row.word });
        continue;
      }

      rows.push(row);
    }

    return { delimiter, hasHeader, rows, errors };
  }

  /**
   * Splits parsed rows into what will be written and what will be skipped.
   *
   * A row is skipped when its word already exists in the library, or when an
   * earlier row in the same file already used that word. Comparison ignores
   * case and collapses whitespace.
   */
  function planImport(rows, existingCards) {
    const existing = new Set();

    for (const card of existingCards || []) {
      const key = dedupeKey(card && card.word);

      if (key) {
        existing.add(key);
      }
    }

    const seen = new Set();
    const additions = [];
    const duplicates = [];

    for (const row of rows || []) {
      const key = dedupeKey(row.word);

      if (existing.has(key)) {
        duplicates.push({ ...row, reason: "library" });
        continue;
      }

      if (seen.has(key)) {
        duplicates.push({ ...row, reason: "file" });
        continue;
      }

      seen.add(key);
      additions.push(row);
    }

    return { additions, duplicates };
  }

  /**
   * Builds CSV text from flashcards. Starts with a UTF-8 BOM and uses CRLF so
   * Excel opens Vietnamese meanings without mojibake.
   */
  function serialize(cards, options = {}) {
    const delimiter = options.delimiter || ",";
    const lines = [COLUMNS.join(delimiter)];

    for (const card of cards || []) {
      lines.push(COLUMNS
        .map((column) => quoteField(readColumn(card, column), delimiter))
        .join(delimiter));
    }

    return `${BOM}${lines.join("\r\n")}\r\n`;
  }

  /** Builds a download filename such as flashcards-demo-ielts-2026-07-23.csv */
  function buildFileName(username, category, date = new Date()) {
    const parts = [
      "flashcards",
      slug(username) || "user",
      slug(category) || "all",
      date.toISOString().slice(0, 10)
    ];

    return `${parts.join("-")}.csv`;
  }

  function template() {
    return serialize([
      { word: "resilient", meaning: "kiên cường", wordform: "adjective", category: "IELTS" },
      { word: "give up", meaning: "từ bỏ", wordform: "phrasal verb", category: "IELTS" }
    ]);
  }

  function readRow(record, columnIndex) {
    const category = trim(cellAt(record.cells, columnIndex.category)).slice(0, MAX_CATEGORY_LENGTH);

    return {
      line: record.line,
      word: collapse(cellAt(record.cells, columnIndex.word)),
      meaning: trim(cellAt(record.cells, columnIndex.meaning)),
      wordform: normalizeWordform(cellAt(record.cells, columnIndex.wordform)),
      category: category || DEFAULT_CATEGORY
    };
  }

  function findRowProblem(row) {
    if (!row.word) {
      return "Missing word";
    }

    // POST /api/sync rejects the whole batch when any meaning is empty, so a
    // blank meaning has to be caught here rather than sent and failed server-side.
    if (!row.meaning) {
      return "Missing meaning";
    }

    return "";
  }

  function readHeaderMap(cells) {
    const map = {};
    let matched = 0;

    for (let index = 0; index < cells.length; index += 1) {
      const key = HEADER_ALIASES[collapse(cells[index]).toLowerCase()];

      if (key && !(key in map)) {
        map[key] = index;
        matched += 1;
      }
    }

    if (matched === 0 || !("word" in map)) {
      return null;
    }

    // Only named columns count. Falling back to a position here would read an
    // unrelated column whenever the header omits one of the four names.
    return map;
  }

  function positionalMap() {
    return { word: 0, meaning: 1, wordform: 2, category: 3 };
  }

  function cellAt(cells, index) {
    return typeof index === "number" && index < cells.length ? cells[index] : "";
  }

  function normalizeWordform(value) {
    const normalized = collapse(value).toLowerCase();

    if (!normalized) {
      return "";
    }

    return WORDFORMS.includes(normalized) ? normalized : collapse(value);
  }

  function detectDelimiter(text) {
    const firstLine = readFirstLine(text);
    let best = ",";
    let bestCount = 0;

    for (const candidate of DELIMITERS) {
      const count = countOutsideQuotes(firstLine, candidate);

      if (count > bestCount) {
        best = candidate;
        bestCount = count;
      }
    }

    return best;
  }

  function readFirstLine(text) {
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];

      if (char === "\"") {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === "\n" && !inQuotes) {
        return text.slice(0, index);
      }
    }

    return text;
  }

  function countOutsideQuotes(text, needle) {
    let inQuotes = false;
    let count = 0;

    for (const char of text) {
      if (char === "\"") {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === needle && !inQuotes) {
        count += 1;
      }
    }

    return count;
  }

  /** RFC 4180 style scanner: quoted fields may hold delimiters and newlines. */
  function tokenize(text, delimiter) {
    const records = [];
    let cells = [];
    let field = "";
    let inQuotes = false;
    let line = 1;
    let recordLine = 1;
    let touched = false;

    function endField() {
      cells.push(field);
      field = "";
    }

    function endRecord() {
      endField();
      records.push({ line: recordLine, cells });
      cells = [];
      touched = false;
    }

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];

      if (inQuotes) {
        if (char === "\"") {
          if (text[index + 1] === "\"") {
            field += "\"";
            index += 1;
          } else {
            inQuotes = false;
          }
        } else {
          if (char === "\n") {
            line += 1;
          }

          field += char;
        }

        continue;
      }

      if (char === "\"" && field === "") {
        inQuotes = true;
        touched = true;
        continue;
      }

      if (char === delimiter) {
        endField();
        touched = true;
        continue;
      }

      if (char === "\r") {
        continue;
      }

      if (char === "\n") {
        line += 1;

        if (touched || field !== "") {
          endRecord();
        }

        recordLine = line;
        continue;
      }

      field += char;
      touched = true;
    }

    if (touched || field !== "") {
      endRecord();
    }

    return records;
  }

  function quoteField(value, delimiter) {
    const text = value === null || value === undefined ? "" : String(value);
    const needsQuotes = text.includes(delimiter)
      || text.includes("\"")
      || text.includes("\n")
      || text.includes("\r")
      || text !== text.trim();

    return needsQuotes ? `"${text.replace(/"/g, "\"\"")}"` : text;
  }

  function readColumn(card, column) {
    if (column === "category") {
      return card && card.category ? card.category : DEFAULT_CATEGORY;
    }

    return card ? card[column] || "" : "";
  }

  function dedupeKey(value) {
    return collapse(value).toLowerCase();
  }

  function slug(value) {
    return collapse(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32);
  }

  function collapse(value) {
    return trim(value).replace(/\s+/g, " ");
  }

  function trim(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function stripBom(text) {
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  }

  root.FlashcardCsv = {
    BOM,
    COLUMNS,
    MAX_ROWS,
    parse,
    planImport,
    serialize,
    buildFileName,
    template
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
