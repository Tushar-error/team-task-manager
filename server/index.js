require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin');
const User = require('./models/User');

// Connect to MongoDB
connectDB().then(async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@demo.com' });
    let admin;
    if (!adminExists) {
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@demo.com',
        password: 'Admin@1234',
        role: 'admin',
        isSuperAdmin: true,
      });
      console.log('🌱 Super Admin seeded: admin@demo.com');
    } else {
      admin = adminExists;
    }

    // Automatically seed required data if in-memory DB is empty
    const Project = require('./models/Project');
    const Task = require('./models/Task');

    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const david = await User.create({ name: 'David Lee', email: 'david.lee@email.com', password: 'Password123', role: 'member' });
      const emma = await User.create({ name: 'Emma Wilson', email: 'emma.wilson@email.com', password: 'Password123', role: 'member' });
      const alice = await User.create({ name: 'Alice Johnson', email: 'alice.johnson@email.com', password: 'Password123', role: 'member' });
      const bob = await User.create({ name: 'Bob Smith', email: 'bob.smith@email.com', password: 'Password123', role: 'member' });
      const ryan = await User.create({ name: 'Ryan Clark', email: 'ryan.clark@email.com', password: 'Password123', role: 'member' });
      const sophie = await User.create({ name: 'Sophie Turner', email: 'sophie.turner@email.com', password: 'Password123', role: 'member' });

      const portfolio = await Project.create({ title: 'Portfolio Website', description: 'A personal portfolio showcasing design and development work.', createdBy: admin._id, members: [alice._id, bob._id] });
      const ecommerce = await Project.create({ title: 'E-Commerce Platform', description: 'An online store with product listings, cart, and payment integration.', createdBy: admin._id, members: [david._id, ryan._id] });
      const mobile = await Project.create({ title: 'Mobile App MVP', description: 'A minimum viable product for a task management mobile application.', createdBy: admin._id, members: [emma._id, sophie._id] });

      const inDays = d => new Date(Date.now() + d * 86400000);
      await Task.create([
        { title: 'Design Homepage', project: portfolio._id, assignedTo: alice._id, createdBy: admin._id, status: 'todo', dueDate: inDays(7), priority: 'medium' },
        { title: 'Setup Hosting', project: portfolio._id, assignedTo: bob._id, createdBy: admin._id, status: 'todo', dueDate: inDays(10), priority: 'medium' },
        { title: 'Build Product Listing Page', project: ecommerce._id, assignedTo: david._id, createdBy: admin._id, status: 'in-progress', dueDate: inDays(14), priority: 'high' },
        { title: 'Create Wireframes', project: mobile._id, assignedTo: emma._id, createdBy: admin._id, status: 'todo', dueDate: inDays(5), priority: 'medium' }
      ]);
      console.log('🌱 Seeded default members, projects, and tasks');
    }
  } catch (error) {
    console.error('❌ Failed to seed data', error.message);
  }
});

const app = express();
app.set('trust proxy', true); // Trust Railway proxy for express-rate-limit and CORS

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// ── Routes ────────────────────────────────────────────────────────────────────
// Register auth routes with both /api prefix and without to handle misconfigured clients
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
// Root route for Railway health checks
app.get('/', (req, res) => {
  res.status(200).send('Team Task Manager API is running');
});

// Health check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const mode = process.env.NODE_ENV || 'development';
  const corsOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
  
  console.log('\n🚀  Server is up and running!');
  console.log(`📡  Port: ${PORT}`);
  console.log(`🌍  Mode: ${mode}`);
  console.log(`🔒  CORS allowed origin: ${corsOrigin}`);
  
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? '✅ Connected' : dbState === 2 ? '⏳ Connecting...' : '❌ Disconnected';
  console.log(`📦  Database: ${dbStatus}\n`);
});
