// routes/history.routes.js
import express from "express";
import db from "../models/History.js";

const router = express.Router();

router.get("/:userId", (req, res) => {
  db.all(
    "SELECT * FROM history WHERE userId = ? ORDER BY createdAt DESC",
    [req.params.userId],
    (err, rows) => {
      res.json(rows);
    }
  );
});

export default router;
