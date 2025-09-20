const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { generateInsights } = require('../utils/aiInsights');

const router = express.Router();

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    const completedTasks = tasks.filter(task => task.completed);
    
    const stats = {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      totalEarnings: completedTasks.reduce((sum, task) => sum + task.reward, 0),
      successRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      categoryStats: getCategoryStats(tasks),
      recentTasks: completedTasks.slice(-5).reverse()
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get AI insights
router.get('/insights', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    const insights = generateInsights(tasks);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get productivity patterns
router.get('/patterns', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId, completed: true });
    
    const patterns = {
      dailyCompletion: getDailyCompletionPattern(tasks),
      categoryPerformance: getCategoryPerformance(tasks),
      timePatterns: getTimePatterns(tasks)
    };
    
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function getCategoryStats(tasks) {
  const categories = ['work', 'personal', 'health', 'learning', 'other'];
  return categories.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const completed = categoryTasks.filter(task => task.completed);
    return {
      category,
      total: categoryTasks.length,
      completed: completed.length,
      rate: categoryTasks.length > 0 ? Math.round((completed.length / categoryTasks.length) * 100) : 0
    };
  });
}

function getDailyCompletionPattern(tasks) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pattern = {};
  
  tasks.forEach(task => {
    if (task.completedAt) {
      const day = days[new Date(task.completedAt).getDay()];
      pattern[day] = (pattern[day] || 0) + 1;
    }
  });
  
  return pattern;
}

function getCategoryPerformance(tasks) {
  const categories = {};
  tasks.forEach(task => {
    if (!categories[task.category]) {
      categories[task.category] = { count: 0, totalReward: 0 };
    }
    categories[task.category].count++;
    categories[task.category].totalReward += task.reward;
  });
  return categories;
}

function getTimePatterns(tasks) {
  const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  
  tasks.forEach(task => {
    if (task.completedAt) {
      const hour = new Date(task.completedAt).getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else if (hour >= 18 && hour < 22) timeSlots.evening++;
      else timeSlots.night++;
    }
  });
  
  return timeSlots;
}

module.exports = router;