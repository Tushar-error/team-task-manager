const User = require('../models/User');

/**
 * GET /api/users
 * Return all users (admin usage — for assigning members).
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllUsers };
