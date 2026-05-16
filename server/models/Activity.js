const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['task_created', 'task_updated', 'project_created', 'member_added', 'admin_created'],
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      // Polymorphic ID reference depending on action
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
