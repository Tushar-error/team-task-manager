const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/tasks/dashboard — must be before /:id
router.get('/dashboard', getDashboardStats);

// GET /api/tasks
router.get('/', getTasks);

// GET /api/tasks/:id
router.get('/:id', getTaskById);

// POST /api/tasks (admin only)
router.post(
  '/',
  adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('project').notEmpty().withMessage('Project ID is required'),
  ],
  createTask
);

// PUT /api/tasks/:id (admin: all fields; member: status only — handled in controller)
router.put('/:id', updateTask);

// DELETE /api/tasks/:id (admin only)
router.delete('/:id', adminOnly, deleteTask);

module.exports = router;
