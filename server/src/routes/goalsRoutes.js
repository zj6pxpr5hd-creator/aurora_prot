import { Router } from 'express';
import { getUserGoals } from '../services/contextService.js';

const router = Router();

/**
 * GET /goals
 * Fetches user goals from database.
 */
router.get('/goals', async (req, res) => {
  console.log('Recieved request at /goals');
  try {
    const goals = await getUserGoals();
    res.json({ goals });

  } catch (error) {
    console.error('Error fetching user goals: ', error);
    res.status(500).json({ error: 'internal server error while retrieving user goals' });
  }
});

export default router;
