import express from "express";
import upload from "../utils/upload.js";
import { analyzeImage } from "../controllers/predict.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), analyzeImage);

export default router;
