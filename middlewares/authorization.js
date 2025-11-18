const Board = require("../models/board.model");

exports.isBoardOwner = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board)
      return res.status(404).json({ message: "Board not found" });

    if (board.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed" });

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
