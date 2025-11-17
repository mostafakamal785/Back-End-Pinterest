import express from "express";
import {
    follow,
    getFollowers,
    getFollowing,
} from "../controllers/follow.controller.js";
import { verifytoken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/:id/follow", verifytoken, follow);
router.get("/:id/followers", verifytoken, getFollowers);

router.get("/:id/following", verifytoken,getFollowing);

export default router;