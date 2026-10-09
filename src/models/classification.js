import spamData from "../data/spamData.json";

// Tiny Multinomial Naive Bayes text classifier.
// spamData uses: 1 = spam, 0 = not spam.
const tokenize = (text) =>
  (text.toLowerCase().match(/[a-z0-9']+/g) || []);

export function predictSpam(message) {
  const docs = spamData;
  const classes = [0, 1];
  const vocabulary = new Set();
  const tokenCounts = { 0: new Map(), 1: new Map() };
  const totalTokens = { 0: 0, 1: 0 };
  const docCounts = { 0: 0, 1: 0 };

  for (const doc of docs) {
    const label = Number(doc.spam);
    docCounts[label]++;
    for (const token of tokenize(doc.text)) {
      vocabulary.add(token);
      tokenCounts[label].set(
        token,
        (tokenCounts[label].get(token) || 0) + 1
      );
      totalTokens[label]++;
    }
  }

  const words = tokenize(message);
  if (!words.length) {
    throw new Error("Enter a message containing some words.");
  }

  const vocabSize = Math.max(vocabulary.size, 1);
  const scores = {};

  for (const label of classes) {
    // Log probabilities avoid numerical underflow.
    let score = Math.log(docCounts[label] / docs.length);
    for (const word of words) {
      const count = tokenCounts[label].get(word) || 0;
      const probability =
        (count + 1) / (totalTokens[label] + vocabSize);
      score += Math.log(probability);
    }
    scores[label] = score;
  }

  const prediction = scores[1] > scores[0] ? "Spam" : "Not spam";
  const max = Math.max(scores[0], scores[1]);
  const p0 = Math.exp(scores[0] - max);
  const p1 = Math.exp(scores[1] - max);
  const confidence = Math.round((Math.max(p0, p1) / (p0 + p1)) * 100);

  return {
    prediction,
    confidence,
    model: "Multinomial Naive Bayes",
  };
}
