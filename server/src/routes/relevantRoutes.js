import { Router } from 'express';
import { getMoreRelevant } from '../services/geminiService.js';

const router = Router();

/**
 * POST /relevant
 * Determines which active persistent memories are relevant based on chat context.
 */
router.post('/relevant', async (req, res) => {
  console.log('Recieved request at /relevant');
  const messages = req.body.messages || [];
  try {
    const relevant = await getMoreRelevant(messages);
    res.json({ relevant });

  } catch (error) {
    console.error('Error fetching relevant memories: ', error);
    res.status(500).json({ error: 'internal server error while retrieving relevant memories' });
  }
});

export default router;
