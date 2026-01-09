import db from "../models/History.js";

export const getHistory = (req, res) => {
  const userId = req.params.userId;

  db.all(
    "SELECT * FROM history WHERE userId = ? ORDER BY createdAt DESC",
    [userId],
    (err, rows) => {
      res.json(rows);
    }
  );
};
