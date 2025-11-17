const express = require('express');

const router = express.Router();
const followController = require("../controllers/follow.controller.js");
const { verifytoken } = require("../middleware/authMiddleware.js");



router.post("/:id/follow", verifytoken, followController.follow);
router.get("/:id/followers", verifytoken, followController.getFollowers);

router.get("/:id/following", verifytoken, followController.getFollowing);





module.exports = router;