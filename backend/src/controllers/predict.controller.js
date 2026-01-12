import { getDummyPrediction } from "../services/ai.service.js";
import { saveHistory } from "../services/history.service.js";

export const analyzeImage = (req, res) => {
  const result = getDummyPrediction();

  saveHistory("demo-user", {
    image: req.file.filename,
    ...result
  });

  res.json(result);
};
