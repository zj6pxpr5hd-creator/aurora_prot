import express from 'express';
import cors from 'cors';
import "dotenv/config";
import memoryRoutes from './src/routes/memoryRoutes.js';
import contextRoutes from './src/routes/contextRoutes.js';
import goalsRoutes from './src/routes/goalsRoutes.js';
import relevantRoutes from './src/routes/relevantRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, '../dist');

app.use(express.json());
app.use(cors());
app.use(express.static(distPath));

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  console.log('Received request at /');
  res.send('Aurora server is running');
});

// Register routes
app.use(memoryRoutes);
app.use(contextRoutes);
app.use(goalsRoutes);
app.use(relevantRoutes);

app.get('*splat', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Aurora listening at http://localhost:${port}`);
});
