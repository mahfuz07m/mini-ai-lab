import houseData from "../data/houseData";

// Fits y = slope*x + intercept using the supplied training examples.
// Dataset prices are in lakh BDT.
function fitLinearRegression(data) {
  const n = data.length;
  const meanX = data.reduce((sum, row) => sum + row.area_sqft, 0) / n;
  const meanY = data.reduce((sum, row) => sum + row.price_lakh_bdt, 0) / n;

  const numerator = data.reduce(
    (sum, row) =>
      sum + (row.area_sqft - meanX) * (row.price_lakh_bdt - meanY),
    0
  );
  const denominator = data.reduce(
    (sum, row) => sum + (row.area_sqft - meanX) ** 2,
    0
  );

  if (!denominator) throw new Error("Training areas must not all be identical.");

  const slope = numerator / denominator;
  return { slope, intercept: meanY - slope * meanX };
}

const trainedModel = fitLinearRegression(houseData);

export function predictHousePrice(areaSqft) {
  const area = Number(areaSqft);
  if (!Number.isFinite(area) || area <= 0) {
    throw new Error("Enter a valid house area greater than zero.");
  }

  return {
    prediction: trainedModel.slope * area + trainedModel.intercept,
    unit: "lakh BDT",
    model: "Linear Regression",
  };
}
