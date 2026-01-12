import dummyResults from "../data/dummyResults.js";

export function getDummyPrediction() {
  const randomIndex = Math.floor(Math.random() * dummyResults.length);
  return dummyResults[randomIndex];
}
