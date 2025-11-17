import { Router } from 'express';
const router = Router();
router.post('/create', (req, res) => {
    // Logic to create a new board
    res.send('Board created');
})

export default router;