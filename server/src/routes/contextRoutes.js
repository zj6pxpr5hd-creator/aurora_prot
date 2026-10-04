import { Router } from 'express';
import { createContext } from '../services/contextService.js';

const router = Router();

/**
 * GET /context
 * Builds and returns the comprehensive context object for Aurora.
 */
router.get('/context', async (req, res) => {
  console.log('Recieved request at /context');
  try {
    const context = await createContext();
    res.json(context);
  } catch (error) {
    console.error('Error building context: ', error);
    res.status(500).json({ error: 'internal server error while building context' });
  }
});

export default router;
