import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './src/routes/authRoutes.js';
import eventsRoutes from './src/routes/eventsRoutes.js';
import usersRoutes from './src/routes/usersRoutes.js';
import tasksRoutes from './src/routes/tasksRoutes.js';
import notificationsRoutes from './src/routes/notificationsRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Lineup API is running' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process using it or use a different port.`);
  } else {
    console.error('Server error:', err);
  }
});
