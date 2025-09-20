const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { parseNaturalLanguage } = require('../utils/nlp');

const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const taskData = req.body;
    
    // If natural language input provided, parse it
    if (taskData.naturalInput) {
      const parsed = parseNaturalLanguage(taskData.naturalInput);
      Object.assign(taskData, parsed);
    }
    
    const task = new Task({
      ...taskData,
      userId: req.userId
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete task
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.completed = true;
    task.completedAt = new Date();
    await task.save();
    
    // Update user wallet
    await User.findByIdAndUpdate(req.userId, { $inc: { wallet: task.reward } });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;