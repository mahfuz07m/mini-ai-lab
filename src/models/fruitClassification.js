import fruitData from "../data/fruitData.json";

const FEATURES = ["weight_g", "color_score"];
const LABELS = ["apple", "banana", "orange"];
const HIDDEN_SIZE = 6;
const EPOCHS = 1400;
const LEARNING_RATE = 0.025;

function seededRandom(seed = 7) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function softmax(values) {
  const maxValue = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - maxValue));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((value) => value / sum);
}

function normalizeInput(row) {
  return [
    (Number(row.weight_g) - 160) / 60,
    (Number(row.color_score) - 0.55) / 0.4,
  ];
}

function oneHot(label) {
  return LABELS.map((value) => (value === label ? 1 : 0));
}

function trainNetwork() {
  const random = seededRandom();
  const inputSize = FEATURES.length;
  const outputSize = LABELS.length;

  const w1 = Array.from({ length: HIDDEN_SIZE }, () =>
    Array.from({ length: inputSize }, () => (random() - 0.5) * 0.8)
  );
  const b1 = new Array(HIDDEN_SIZE).fill(0);
  const w2 = Array.from({ length: outputSize }, () =>
    Array.from({ length: HIDDEN_SIZE }, () => (random() - 0.5) * 0.8)
  );
  const b2 = new Array(outputSize).fill(0);

  // Full-batch gradient descent keeps this tiny example deterministic and readable.
  for (let epoch = 0; epoch < EPOCHS; epoch++) {
    const gradW1 = w1.map((row) => row.map(() => 0));
    const gradB1 = new Array(HIDDEN_SIZE).fill(0);
    const gradW2 = w2.map((row) => row.map(() => 0));
    const gradB2 = new Array(outputSize).fill(0);

    for (const row of fruitData) {
      const x = normalizeInput(row);
      const target = oneHot(row.fruit);

      const hidden = w1.map((weights, j) =>
        Math.tanh(weights.reduce((sum, weight, i) => sum + weight * x[i], b1[j]))
      );
      const logits = w2.map((weights, j) =>
        weights.reduce((sum, weight, i) => sum + weight * hidden[i], b2[j])
      );
      const probs = softmax(logits);
      const delta2 = probs.map((p, j) => p - target[j]);

      for (let j = 0; j < outputSize; j++) {
        gradB2[j] += delta2[j];
        for (let h = 0; h < HIDDEN_SIZE; h++) {
          gradW2[j][h] += delta2[j] * hidden[h];
        }
      }

      const delta1 = new Array(HIDDEN_SIZE).fill(0);
      for (let h = 0; h < HIDDEN_SIZE; h++) {
        let propagated = 0;
        for (let j = 0; j < outputSize; j++) {
          propagated += w2[j][h] * delta2[j];
        }
        delta1[h] = propagated * (1 - hidden[h] * hidden[h]);
        gradB1[h] += delta1[h];
        for (let i = 0; i < inputSize; i++) {
          gradW1[h][i] += delta1[h] * x[i];
        }
      }
    }

    const scale = LEARNING_RATE / fruitData.length;
    for (let j = 0; j < HIDDEN_SIZE; j++) {
      b1[j] -= scale * gradB1[j];
      for (let i = 0; i < inputSize; i++) w1[j][i] -= scale * gradW1[j][i];
    }
    for (let j = 0; j < outputSize; j++) {
      b2[j] -= scale * gradB2[j];
      for (let h = 0; h < HIDDEN_SIZE; h++) w2[j][h] -= scale * gradW2[j][h];
    }
  }

  return { w1, b1, w2, b2 };
}

const network = trainNetwork();

function forward(weight, color) {
  const x = normalizeInput({ weight_g: weight, color_score: color });
  const hidden = network.w1.map((weights, j) =>
    Math.tanh(weights.reduce((sum, w, i) => sum + w * x[i], network.b1[j]))
  );
  const logits = network.w2.map((weights, j) =>
    weights.reduce((sum, w, i) => sum + w * hidden[i], network.b2[j])
  );
  return softmax(logits);
}

/**
 * Predict a fruit class from weight in grams and color score in [0, 1].
 * The small network trains locally from the bundled synthetic dataset.
 */
export function predictFruit(weightGrams, colorScore) {
  const weight = Number(weightGrams);
  const color = Number(colorScore);

  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error("Fruit weight must be greater than zero.");
  }
  if (!Number.isFinite(color) || color < 0 || color > 1) {
    throw new Error("Color score must be between 0 and 1.");
  }

  const probabilities = forward(weight, color);
  const bestIndex = probabilities.indexOf(Math.max(...probabilities));
  const prediction = LABELS[bestIndex];

  return {
    model: "Small neural network",
    prediction: prediction.charAt(0).toUpperCase() + prediction.slice(1),
    description: "Predicted from fruit weight and color features using a small neural network trained on synthetic examples.",
    confidence: Math.round(probabilities[bestIndex] * 100),
    probabilities: Object.fromEntries(
      LABELS.map((label, index) => [label, Number((probabilities[index] * 100).toFixed(1))])
    ),
  };
}
