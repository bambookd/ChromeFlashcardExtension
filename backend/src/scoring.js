export function scoreVocabularyAnswer(answer, expectedWord) {
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedExpected = normalizeAnswer(expectedWord);

  if (!normalizedAnswer || !normalizedExpected) {
    return { result: "wrong", label: "Wrong", points: 0 };
  }

  if (normalizedAnswer === normalizedExpected) {
    return { result: "exact", label: "Exact", points: 100 };
  }

  return longestCommonSubstringLength(normalizedAnswer, normalizedExpected) / normalizedExpected.length >= 0.5
    ? { result: "partial", label: "Partial", points: 50 }
    : { result: "wrong", label: "Wrong", points: 0 };
}

export function normalizeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .replace(/\s+/g, " ");
}

function longestCommonSubstringLength(first, second) {
  const previous = Array(second.length + 1).fill(0);
  let longest = 0;

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    let diagonal = 0;

    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const current = previous[secondIndex];

      if (first[firstIndex - 1] === second[secondIndex - 1]) {
        previous[secondIndex] = diagonal + 1;
        longest = Math.max(longest, previous[secondIndex]);
      } else {
        previous[secondIndex] = 0;
      }

      diagonal = current;
    }
  }

  return longest;
}
