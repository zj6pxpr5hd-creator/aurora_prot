import express from 'express';
import cors from 'cors';
import "dotenv/config";
import memoryRoutes from './src/routes/memoryRoutes.js';
import contextRoutes from './src/routes/contextRoutes.js';
import goalsRoutes from './src/routes/goalsRoutes.js';
import relevantRoutes from './src/routes/relevantRoutes.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  console.log('Received request at /');
  res.send('Aurora server is running');
});

// Register routes
app.use(memoryRoutes);
app.use(contextRoutes);
app.use(goalsRoutes);
app.use(relevantRoutes);

app.listen(port, () => {
  console.log(`Aurora listening at http://localhost:${port}`);
});
