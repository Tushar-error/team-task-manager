const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateMembers,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/projects
router.get('/', getProjects);

// GET /api/projects/:id
router.get('/:id', getProjectById);

// POST /api/projects (admin only)
router.post(
  '/',
  adminOnly,
  [body('title').trim().notEmpty().withMessage('Title is required')],
  createProject
);

// PUT /api/projects/:id (admin only)
router.put('/:id', adminOnly, updateProject);

// DELETE /api/projects/:id (admin only)
router.delete('/:id', adminOnly, deleteProject);

// PUT /api/projects/:id/members (admin only)
router.put('/:id/members', adminOnly, updateMembers);

// DELETE /api/projects/:projectId/members/:memberId (admin only)
router.delete('/:projectId/members/:memberId', adminOnly, removeMember);

module.exports = router;
