import db from "../models/History.js";

export function saveHistory(userId, data) {
  db.run(
    `INSERT INTO history (userId, image, result, confidence, remedy)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      data.image,
      data.class,
      data.confidence,
      data.remedy
    ]
  );
}
