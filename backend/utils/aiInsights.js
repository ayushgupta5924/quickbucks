function generateInsights(tasks) {
  const insights = [];
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  
  if (tasks.length === 0) {
    return [{
      type: 'welcome',
      icon: '🚀',
      title: 'Welcome to QuickBucks!',
      message: 'Start adding tasks to unlock AI-powered productivity insights.',
      priority: 'info'
    }];
  }
  
  // Completion rate analysis
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  
  if (completionRate >= 80) {
    insights.push({
      type: 'success',
      icon: '🎯',
      title: 'Excellent Performance!',
      message: `${Math.round(completionRate)}% completion rate. You're crushing your goals!`,
      priority: 'high'
    });
  } else if (completionRate >= 60) {
    insights.push({
      type: 'good',
      icon: '📈',
      title: 'Good Progress',
      message: `${Math.round(completionRate)}% completion rate. Consider breaking larger tasks into smaller ones.`,
      priority: 'medium'
    });
  } else if (completedTasks.length > 0) {
    insights.push({
      type: 'improvement',
      icon: '💡',
      title: 'Room for Growth',
      message: `${Math.round(completionRate)}% completion rate. Try setting smaller, achievable goals.`,
      priority: 'high'
    });
  }
  
  // Category performance analysis
  const categoryInsights = analyzeCategoryPerformance(tasks, completedTasks);
  insights.push(...categoryInsights);
  
  // Task size optimization
  const sizeInsights = analyzeTaskSizes(tasks, completedTasks);
  insights.push(...sizeInsights);
  
  // Time pattern analysis
  const timeInsights = analyzeTimePatterns(completedTasks);
  insights.push(...timeInsights);
  
  // Actionable recommendations
  const recommendations = generateRecommendations(tasks, completedTasks, pendingTasks);
  insights.push(...recommendations);
  
  return insights.slice(0, 6); // Return top 6 insights
}

function analyzeCategoryPerformance(tasks, completedTasks) {
  const insights = [];
  const categories = ['work', 'personal', 'health', 'learning', 'other'];
  const categoryStats = {};
  
  categories.forEach(category => {
    const categoryTasks = tasks.filter(t => t.category === category);
    const categoryCompleted = completedTasks.filter(t => t.category === category);
    
    if (categoryTasks.length > 0) {
      categoryStats[category] = {
        total: categoryTasks.length,
        completed: categoryCompleted.length,
        rate: (categoryCompleted.length / categoryTasks.length) * 100
      };
    }
  });
  
  const categoryEntries = Object.entries(categoryStats);
  if (categoryEntries.length > 1) {
    const bestCategory = categoryEntries.reduce((a, b) => a[1].rate > b[1].rate ? a : b);
    const worstCategory = categoryEntries.reduce((a, b) => a[1].rate < b[1].rate ? a : b);
    
    if (bestCategory[1].rate > 70) {
      insights.push({
        type: 'success',
        icon: '🏆',
        title: `${capitalize(bestCategory[0])} Champion`,
        message: `You excel at ${bestCategory[0]} tasks with ${Math.round(bestCategory[1].rate)}% completion!`,
        priority: 'medium'
      });
    }
    
    if (worstCategory[1].rate < 50 && worstCategory[1].total >= 2) {
      insights.push({
        type: 'improvement',
        icon: '🎯',
        title: 'Focus Area Identified',
        message: `${capitalize(worstCategory[0])} tasks need attention (${Math.round(worstCategory[1].rate)}% completion).`,
        priority: 'high'
      });
    }
  }
  
  return insights;
}

function analyzeTaskSizes(tasks, completedTasks) {
  const insights = [];
  
  const largeCompleted = completedTasks.filter(t => t.reward > 200).length;
  const largeTotal = tasks.filter(t => t.reward > 200).length;
  const smallCompleted = completedTasks.filter(t => t.reward <= 100).length;
  const smallTotal = tasks.filter(t => t.reward <= 100).length;
  
  if (largeTotal > 0 && smallTotal > 0) {
    const largeRate = (largeCompleted / largeTotal) * 100;
    const smallRate = (smallCompleted / smallTotal) * 100;
    
    if (smallRate > largeRate + 20) {
      insights.push({
        type: 'strategy',
        icon: '✂️',
        title: 'Task Size Optimization',
        message: `You complete ${Math.round(smallRate)}% of small vs ${Math.round(largeRate)}% of large tasks. Break big tasks into smaller chunks.`,
        priority: 'high'
      });
    }
  }
  
  return insights;
}

function analyzeTimePatterns(completedTasks) {
  const insights = [];
  
  if (completedTasks.length < 3) return insights;
  
  const dayPatterns = {};
  const timePatterns = { morning: 0, afternoon: 0, evening: 0 };
  
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const date = new Date(task.completedAt);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      
      dayPatterns[dayOfWeek] = (dayPatterns[dayOfWeek] || 0) + 1;
      
      if (hour >= 6 && hour < 12) timePatterns.morning++;
      else if (hour >= 12 && hour < 18) timePatterns.afternoon++;
      else if (hour >= 18 && hour < 22) timePatterns.evening++;
    }
  });
  
  const peakDay = Object.entries(dayPatterns).reduce((a, b) => a[1] > b[1] ? a : b);
  if (peakDay && peakDay[1] >= 2) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    insights.push({
      type: 'pattern',
      icon: '📅',
      title: 'Peak Performance Day',
      message: `${dayNames[peakDay[0]]} is your most productive day!`,
      priority: 'medium'
    });
  }
  
  const peakTime = Object.entries(timePatterns).reduce((a, b) => a[1] > b[1] ? a : b);
  if (peakTime && peakTime[1] >= 2) {
    insights.push({
      type: 'pattern',
      icon: '⏰',
      title: 'Optimal Time Window',
      message: `You're most productive in the ${peakTime[0]}. Schedule important tasks then.`,
      priority: 'medium'
    });
  }
  
  return insights;
}

function generateRecommendations(tasks, completedTasks, pendingTasks) {
  const insights = [];
  
  // Overdue tasks
  const overdueTasks = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
  if (overdueTasks.length > 0) {
    insights.push({
      type: 'urgent',
      icon: '⚠️',
      title: 'Overdue Tasks Alert',
      message: `${overdueTasks.length} task(s) are overdue. Consider rescheduling or breaking them down.`,
      priority: 'high'
    });
  }
  
  // High-value opportunities
  const highValuePending = pendingTasks.filter(t => t.reward > 300);
  if (highValuePending.length > 0) {
    insights.push({
      type: 'opportunity',
      icon: '💎',
      title: 'High-Value Opportunities',
      message: `${highValuePending.length} high-reward task(s) pending. Big earnings await!`,
      priority: 'medium'
    });
  }
  
  // Streak motivation
  if (completedTasks.length >= 3) {
    const recentCompletions = completedTasks.filter(t => {
      const daysSince = (new Date() - new Date(t.completedAt || t.createdAt)) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });
    
    if (recentCompletions.length >= 3) {
      insights.push({
        type: 'motivation',
        icon: '🔥',
        title: 'On Fire!',
        message: `${recentCompletions.length} tasks completed this week! Keep the momentum going!`,
        priority: 'low'
      });
    }
  }
  
  return insights;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { generateInsights };