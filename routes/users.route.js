import express from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { verifytoken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", verifytoken, getProfile);

router.get("/:id", getProfile);

router.put("/:id", verifytoken, updateProfile);
export default router;