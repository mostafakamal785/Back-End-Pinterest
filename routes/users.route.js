const express = require('express');

const router = express.Router();

const userController = require('../controllers/user.controller.js');
const { verifytoken } = require("../middleware/authMiddleware.js");

router.get('/profile', verifytoken, userController.getProfile);

router.get("/:id", userController.getProfile);


router.put('/:id', verifytoken, userController.updateProfile);

module.exports = router;