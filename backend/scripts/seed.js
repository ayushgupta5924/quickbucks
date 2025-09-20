const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbucks');
    
    await User.deleteMany({});
    await Task.deleteMany({});
    
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@quickbucks.com',
      password: 'demo123',
      wallet: 450
    });
    
    await demoUser.save();
    
    const sampleTasks = [
      {
        userId: demoUser._id,
        name: 'Complete project presentation',
        category: 'work',
        priority: 'high',
        reward: 300,
        completed: true,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser._id,
        name: 'Morning workout',
        category: 'health',
        priority: 'medium',
        reward: 100,
        completed: true,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser._id,
        name: 'Prepare quarterly report',
        category: 'work',
        priority: 'high',
        reward: 400,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        completed: false
      }
    ];
    
    await Task.insertMany(sampleTasks);
    console.log('Database seeded! Login: demo@quickbucks.com / demo123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();