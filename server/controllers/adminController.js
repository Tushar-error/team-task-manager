const User = require('../models/User');
const { validationResult } = require('express-validator');
const Activity = require('../models/Activity');

/**
 * POST /api/admin/create-admin
 * Create a new admin user (Admins only)
 */
const createAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: 'admin' });

    // Log activity
    await Activity.create({
      action: 'admin_created',
      description: `Created new admin: ${user.name} (${user.email})`,
      user: req.user._id,
      targetId: user._id,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'Admin created successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/admin/users
 * Get all users
 */
const getUsers = async (req, res) => {
  try {
    // 8-second timeout for the DB query to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), 8000)
    );

    const queryPromise = User.find({}).select('-password').sort({ createdAt: -1 });

    const users = await Promise.race([queryPromise, timeoutPromise]);
    res.json(users);
  } catch (error) {
    if (error.message === 'DATABASE_TIMEOUT') {
      return res.status(408).json({ message: 'Request timeout: Database is taking too long to respond' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Promote or demote a user
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot modify super admin' });
    }

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot delete super admin' });
    }

    // 1. Remove user from all projects they are a member of
    const Project = require('../models/Project');
    await Project.updateMany(
      { members: user._id },
      { $pull: { members: user._id } }
    );

    // 2. Unassign user from any tasks
    const Task = require('../models/Task');
    await Task.updateMany(
      { assignedTo: user._id },
      { $set: { assignedTo: null } }
    );

    // 3. Delete user
    await user.deleteOne();

    res.json({ message: 'User removed from system and all projects unassigned' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createAdmin, getUsers, updateUserRole, deleteUser };
