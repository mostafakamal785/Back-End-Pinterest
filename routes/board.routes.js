import express from 'express';
import handleValidate  from '../middleware/handleValidate.js';
import {
  createBoardValidation,
  updateBoardValidation,
  boardIdValidation,
  manageBoardPinValidation,
  searchUserBoardsValidation,
  filterBoardsPrivacyValidation,
} from '../validations/boards.validations.js';
import * as boardController from '../controllers/board.controller.js';
import  authMiddleware  from '../middleware/authenticate.js';

const router = express.Router();
router.use(authMiddleware);

// BOARD CRUD
router.post('/', createBoardValidation, handleValidate, boardController.createBoard);
router.get('/', boardController.getUserBoards);
router.get('/:id', boardIdValidation, handleValidate, boardController.getBoard);
router.put('/:id', updateBoardValidation, handleValidate, boardController.updateBoard);
router.delete('/:id', boardIdValidation, handleValidate, boardController.deleteBoard);

// BOARD PINS MANAGEMENT
router.post(
  '/:id/pins/:pinId',
  manageBoardPinValidation,
  handleValidate,
  boardController.addPinToBoard
);
router.delete(
  '/:id/pins/:pinId',
  manageBoardPinValidation,
  handleValidate,
  boardController.removePinFromBoard
);
router.get('/:id/pins', boardIdValidation, handleValidate, boardController.getBoardPins);

// SEARCH & FILTERS
router.get(
  '/search/user',
  searchUserBoardsValidation,
  handleValidate,
  boardController.searchUserBoards
);
router.get(
  '/filter/privacy/:type',
  filterBoardsPrivacyValidation,
  handleValidate,
  boardController.getBoardsByPrivacy
);

export default router;
