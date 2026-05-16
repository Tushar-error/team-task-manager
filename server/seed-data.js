require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

// Connect to the DB manually (hardcoded to the current known port if .env is not present, but .env should work since the server runs it)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:62711/';

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to DB');

  try {
    // 1. Create David and Emma
    const david = await User.create({ name: 'David Lee', email: 'david.lee@email.com', password: 'Password123', role: 'member' });
    const emma = await User.create({ name: 'Emma Wilson', email: 'emma.wilson@email.com', password: 'Password123', role: 'member' });
    console.log('Created David and Emma');

    // 2. Fetch Alice and Bob (they were created via the UI previously)
    const alice = await User.findOne({ email: 'alice.johnson@email.com' });
    const bob = await User.findOne({ email: 'bob.smith@email.com' });
    
    if (!alice || !bob) {
      console.log('Alice or Bob not found, creating them as well just in case');
      // If they were lost due to in-memory restart, create them
      if (!alice) await User.create({ name: 'Alice Johnson', email: 'alice.johnson@email.com', password: 'Password123', role: 'member' });
      if (!bob) await User.create({ name: 'Bob Smith', email: 'bob.smith@email.com', password: 'Password123', role: 'member' });
    }

    const finalAlice = await User.findOne({ email: 'alice.johnson@email.com' });
    const finalBob = await User.findOne({ email: 'bob.smith@email.com' });

    // 3. Fetch Projects
    let portfolio = await Project.findOne({ title: 'Portfolio Website' });
    let ecommerce = await Project.findOne({ title: 'E-Commerce Platform' });
    let mobile = await Project.findOne({ title: 'Mobile App MVP' });

    const admin = await User.findOne({ email: 'admin@demo.com' });

    // If projects don't exist, create them
    if (!portfolio) portfolio = await Project.create({ title: 'Portfolio Website', description: 'A personal portfolio showcasing design and development work.', createdBy: admin._id });
    if (!ecommerce) ecommerce = await Project.create({ title: 'E-Commerce Platform', description: 'An online store with product listings, cart, and payment integration.', createdBy: admin._id });
    if (!mobile) mobile = await Project.create({ title: 'Mobile App MVP', description: 'A minimum viable product for a task management mobile application.', createdBy: admin._id });

    // 4. Assign Members
    // Alice and Bob to Portfolio
    portfolio.members = [finalAlice._id, finalBob._id];
    await portfolio.save();

    // David to E-Commerce
    ecommerce.members = [david._id];
    await ecommerce.save();

    // Emma to Mobile App
    mobile.members = [emma._id];
    await mobile.save();

    console.log('Assigned members to projects');

    // 5. Create Tasks
    const inDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await Task.create([
      { title: 'Design Homepage', project: portfolio._id, assignedTo: finalAlice._id, status: 'todo', dueDate: inDays(7), priority: 'medium' },
      { title: 'Setup Hosting', project: portfolio._id, assignedTo: finalBob._id, status: 'todo', dueDate: inDays(10), priority: 'medium' },
      { title: 'Build Product Listing Page', project: ecommerce._id, assignedTo: david._id, status: 'in-progress', dueDate: inDays(14), priority: 'high' },
      { title: 'Create Wireframes', project: mobile._id, assignedTo: emma._id, status: 'todo', dueDate: inDays(5), priority: 'medium' }
    ]);

    console.log('Tasks created successfully');
    process.exit(0);
  } catch (e) {
    console.error('Error seeding data', e);
    process.exit(1);
  }
});
