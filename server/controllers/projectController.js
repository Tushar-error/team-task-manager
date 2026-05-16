const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

/**
 * GET /api/projects
 * Admin: all projects. Member: projects they belong to.
 */
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/projects/:id
 * Get a single project by ID.
 */
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Members can only view projects they belong to
    if (
      req.user.role !== 'admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * POST /api/projects
 * Create a new project (admin only).
 */
const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, members } = req.body;

  try {
    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    const populated = await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/projects/:id
 * Update project (admin only).
 */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { title, description } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;

    await project.save();
    await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /api/projects/:id
 * Delete project and associated tasks (admin only).
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove all tasks linked to this project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project and associated tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/projects/:id/members
 * Add or remove members from a project (admin only).
 */
const updateMembers = async (req, res) => {
  const { members } = req.body; // Array of user IDs

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.members = members;
    await project.save();
    await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /api/projects/:projectId/members/:memberId
 * Remove a specific member from a project and unassign their tasks.
 */
const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove from members array
    project.members = project.members.filter(id => id.toString() !== memberId);
    await project.save();

    // Unassign tasks in this project
    await Task.updateMany(
      { project: projectId, assignedTo: memberId },
      { $set: { assignedTo: null } }
    );

    await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateMembers,
  removeMember,
};
