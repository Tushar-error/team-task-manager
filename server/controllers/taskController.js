const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * GET /api/tasks
 * Admin: all tasks. Member: only their assigned tasks.
 * Query params: status, projectId
 */
const getTasks = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }

    // Search by title
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/tasks/:id
 * Get a single task.
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title members')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only see tasks assigned to them
    if (
      req.user.role !== 'admin' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * POST /api/tasks
 * Create a task (admin only).
 */
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  try {
    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority: priority || 'medium',
      dueDate,
      assignedTo: assignedTo || undefined,
      project,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'project', select: 'title' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/tasks/:id
 * Admin: update any field. Member: update status only (if assigned).
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'admin') {
      // Admin can update any field
      const { title, description, status, priority, dueDate, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    } else {
      // Member can only update status on their own tasks
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    }

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'project', select: 'title' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid data provided', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task (admin only).
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/tasks/dashboard
 * Dashboard statistics for the logged-in user.
 */
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const baseFilter = isAdmin ? {} : { assignedTo: userId };

    const [total, completed, inProgress, overdue, myTasks] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: 'done' }),
      Task.countDocuments({ ...baseFilter, status: 'in-progress' }),
      Task.countDocuments({
        ...baseFilter,
        dueDate: { $lt: now },
        status: { $ne: 'done' },
      }),
      Task.find({ assignedTo: userId, status: { $ne: 'done' } })
        .populate('project', 'title')
        .sort({ dueDate: 1 })
        .limit(5),
    ]);

    res.json({
      total,
      completed,
      pending: total - completed,
      inProgress,
      overdue,
      myTasks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
};
