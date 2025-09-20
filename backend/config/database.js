const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbucks', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await createIndexes();
    
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const Task = require('../models/Task');
    const User = require('../models/User');
    
    await Task.collection.createIndex({ userId: 1, completed: 1 });
    await Task.collection.createIndex({ userId: 1, category: 1 });
    await Task.collection.createIndex({ userId: 1, createdAt: -1 });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    
    console.log('Database indexes created');
  } catch (error) {
    console.error('Index creation error:', error);
  }
};

module.exports = connectDB;