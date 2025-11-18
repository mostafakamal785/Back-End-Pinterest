const express = require("express");
const router = express.Router();

const Board = require("../models/board.model");
const authenticate = require("../middlewares/authenticate");
const { isBoardOwner } = require("../middlewares/authorization");

router.post("/", authenticate, async (req, res) => {
  const board = await Board.create({
    name: req.body.name,
    description: req.body.description,
    owner: req.user._id
  });

  res.status(201).json(board);
});

router.put("/:id", authenticate, isBoardOwner, async (req, res) => {
  const updated = await Board.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

router.delete("/:id", authenticate, isBoardOwner, async (req, res) => {
  await Board.findByIdAndDelete(req.params.id);
  res.json({ message: "Board deleted" });
});

module.exports = router;
