import express from "express";
import { detectDanger, getAlerts, handleEmergencyNotification } from "../controllers/alertController.js";

const router = express.Router();

router.post("/detect", detectDanger);
router.get("/alerts", getAlerts);
router.post("/emergency/notify", handleEmergencyNotification);

export default router;