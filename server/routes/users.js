const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users — all authenticated users can list users (for assigning tasks)
router.get('/', protect, getAllUsers);

module.exports = router;
