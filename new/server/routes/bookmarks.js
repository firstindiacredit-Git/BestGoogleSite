import express from 'express';
import { getBookmarks, addBookmark, deleteBookmark } from '../controllers/bookmarkController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);
router.get('/', getBookmarks);
router.post('/', addBookmark);
router.delete('/:id', deleteBookmark);

export default router;