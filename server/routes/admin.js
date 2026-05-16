const express = require('express');
const { body } = require('express-validator');
const { createAdmin, getUsers, updateUserRole, deleteUser } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes must be protected and restricted to admins
router.use(protect);
router.use(isAdmin);

router.post(
  '/create-admin',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  createAdmin
);

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
