import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import predictRoutes from "./routes/predict.routes.js";
import historyRoutes from "./routes/history.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/history", historyRoutes);

export default app;
