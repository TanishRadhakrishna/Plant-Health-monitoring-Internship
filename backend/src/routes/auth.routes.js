import express from "express";

const router = express.Router();

router.post("/login", (req, res) => {
  res.json({
    success: true,
    message: "Login successful (dummy)",
    user: {
      name: "Test User",
      email: "test@example.com"
    }
  });
});

export default router;
