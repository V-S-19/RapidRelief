import express from "express";
import { detectDanger, getAlerts } from "../controllers/alertController.js";

const router = express.Router();

router.post("/detect", detectDanger);
router.get("/alerts", getAlerts);

export default router;