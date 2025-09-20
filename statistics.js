// Global variables
let tasks = [];

// Statistics functionality
function updateStatistics() {
    tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const walletAmount = parseFloat(localStorage.getItem('wallet') || '0');
    
    console.log('Tasks from localStorage:', tasks);
    console.log('Wallet amount:', walletAmount);
    
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    
    console.log('Completed tasks:', completedTasks);
    console.log('Pending tasks:', pendingTasks);
    
    const totalTasksElement = document.getElementById('totalTasks');
    const completedTasksElement = document.getElementById('completedTasksCount');
    const totalEarningsElement = document.getElementById('totalEarnings');
    const successRateElement = document.getElementById('successRate');
    
    if (totalTasksElement) totalTasksElement.textContent = tasks.length;
    if (completedTasksElement) completedTasksElement.textContent = completedTasks.length;
    if (totalEarningsElement) totalEarningsElement.textContent = walletAmount;
    
    const successRate = tasks.length > 0 
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;
    if (successRateElement) successRateElement.textContent = successRate + '%';
    
    // Update circular progress chart
    updateCircularProgress(completedTasks.length, tasks.length);
    
    // Update recent completed tasks
    updateRecentTasks(completedTasks);
    
    // Generate AI insights
    generateProductivityInsights(tasks, completedTasks);
}

function updateCircularProgress(completed, total) {
    const progressCircle = document.getElementById('progressCircle');
    const progressText = document.getElementById('progressText');
    
    if (!progressCircle || !progressText) return;
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const circumference = 314; // 2 * π * 50
    const offset = circumference - (percentage / 100) * circumference;
    
    progressCircle.style.strokeDashoffset = offset;
    progressText.textContent = percentage + '%';
}



function updateRecentTasks(completedTasks) {
    const recentTasksList = document.getElementById('recentTasksList');
    if (!recentTasksList) return;
    
    const recentTasks = completedTasks.slice(-5).reverse();
    
    if (recentTasks.length === 0) {
        recentTasksList.innerHTML = '<p style="color: #666; font-style: italic;">No completed tasks yet</p>';
        return;
    }
    
    recentTasksList.innerHTML = recentTasks.map(task => 
        `<div class="recent-task-item">
            <span class="task-name">${task.name}</span>
            <span class="task-reward">₹${task.reward}</span>
        </div>`
    ).join('');
}

// Load statistics on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStatistics();
    loadTheme();
    
    // Refresh insights every 30 seconds if there are tasks
    setInterval(() => {
        const currentTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        if (currentTasks.length > 0) {
            const completedTasks = currentTasks.filter(task => task.completed);
            generateProductivityInsights(currentTasks, completedTasks);
        }
    }, 30000);
});

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}
// AI Productivity Insights & Coaching System
function generateProductivityInsights(allTasks, completedTasks) {
    const insights = [];
    
    if (allTasks.length === 0) {
        insights.push({
            type: 'welcome',
            icon: '🚀',
            title: 'Ready to Start!',
            message: 'Add your first task to begin tracking your productivity journey with AI-powered insights.',
            priority: 'info'
        });
    } else if (completedTasks.length === 0) {
        insights.push({
            type: 'motivation',
            icon: '💪',
            title: 'Time to Get Started!',
            message: `You have ${allTasks.length} task(s) waiting. Complete your first task to unlock detailed AI insights!`,
            priority: 'medium'
        });
    } else if (completedTasks.length < 3) {
        insights.push({
            type: 'welcome',
            icon: '👋',
            title: 'Great Start!',
            message: `You've completed ${completedTasks.length} task(s)! Complete a few more to unlock advanced AI productivity insights.`,
            priority: 'info'
        });
        
        // Add basic insights even with limited data
        insights.push(...generateBasicInsights(allTasks, completedTasks));
    } else {
        // Analyze completion patterns
        insights.push(...analyzeCompletionPatterns(completedTasks));
        insights.push(...analyzeCategoryPerformance(completedTasks));
        insights.push(...analyzeTaskSizeOptimization(allTasks, completedTasks));
        insights.push(...analyzeTimePatterns(completedTasks));
        insights.push(...generateActionableRecommendations(allTasks, completedTasks));
    }
    
    displayInsights(insights);
}

function generateBasicInsights(allTasks, completedTasks) {
    const insights = [];
    const pendingTasks = allTasks.filter(t => !t.completed);
    
    // Basic completion encouragement
    if (completedTasks.length > 0) {
        const totalEarnings = completedTasks.reduce((sum, task) => sum + (task.reward || 0), 0);
        insights.push({
            type: 'success',
            icon: '💰',
            title: 'Earning Progress',
            message: `You've earned ₹${totalEarnings} so far! Keep completing tasks to boost your earnings.`,
            priority: 'medium'
        });
    }
    
    // Pending task motivation
    if (pendingTasks.length > 0) {
        const potentialEarnings = pendingTasks.reduce((sum, task) => sum + (task.reward || 0), 0);
        insights.push({
            type: 'opportunity',
            icon: '🎯',
            title: 'Potential Earnings',
            message: `Complete your ${pendingTasks.length} pending task(s) to earn ₹${potentialEarnings} more!`,
            priority: 'high'
        });
    }
    
    return insights;
}

function analyzeCompletionPatterns(completedTasks) {
    const insights = [];
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const completionRate = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    
    if (completionRate >= 80) {
        insights.push({
            type: 'success',
            icon: '🎯',
            title: 'Excellent Completion Rate!',
            message: `You complete ${Math.round(completionRate)}% of your tasks. You're a productivity superstar!`,
            priority: 'high'
        });
    } else if (completionRate >= 60) {
        insights.push({
            type: 'good',
            icon: '📈',
            title: 'Good Progress',
            message: `${Math.round(completionRate)}% completion rate. Try breaking larger tasks into smaller ones to boost this further.`,
            priority: 'medium'
        });
    } else {
        insights.push({
            type: 'improvement',
            icon: '💡',
            title: 'Room for Improvement',
            message: `${Math.round(completionRate)}% completion rate. Consider setting smaller, more achievable goals to build momentum.`,
            priority: 'high'
        });
    }
    
    return insights;
}

function analyzeCategoryPerformance(completedTasks) {
    const insights = [];
    const categoryStats = {};
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Calculate completion rates by category
    ['work', 'personal', 'health', 'learning', 'other'].forEach(category => {
        const categoryTasks = allTasks.filter(t => t.category === category);
        const categoryCompleted = completedTasks.filter(t => t.category === category);
        
        if (categoryTasks.length > 0) {
            categoryStats[category] = {
                total: categoryTasks.length,
                completed: categoryCompleted.length,
                rate: (categoryCompleted.length / categoryTasks.length) * 100
            };
        }
    });
    
    // Find best and worst performing categories
    const categories = Object.entries(categoryStats);
    if (categories.length > 1) {
        const bestCategory = categories.reduce((a, b) => a[1].rate > b[1].rate ? a : b);
        const worstCategory = categories.reduce((a, b) => a[1].rate < b[1].rate ? a : b);
        
        if (bestCategory[1].rate > 70) {
            insights.push({
                type: 'success',
                icon: '🏆',
                title: `${bestCategory[0].charAt(0).toUpperCase() + bestCategory[0].slice(1)} Champion`,
                message: `You excel at ${bestCategory[0]} tasks with ${Math.round(bestCategory[1].rate)}% completion rate!`,
                priority: 'medium'
            });
        }
        
        if (worstCategory[1].rate < 50 && worstCategory[1].total >= 2) {
            insights.push({
                type: 'improvement',
                icon: '🎯',
                title: 'Focus Area Identified',
                message: `${worstCategory[0].charAt(0).toUpperCase() + worstCategory[0].slice(1)} tasks need attention (${Math.round(worstCategory[1].rate)}% completion). Try scheduling them at your peak energy times.`,
                priority: 'high'
            });
        }
    }
    
    return insights;
}

function analyzeTaskSizeOptimization(allTasks, completedTasks) {
    const insights = [];
    
    // Analyze task size vs completion rate
    const largeTasksCompleted = completedTasks.filter(t => t.reward > 200).length;
    const largeTasksTotal = allTasks.filter(t => t.reward > 200).length;
    const smallTasksCompleted = completedTasks.filter(t => t.reward <= 100).length;
    const smallTasksTotal = allTasks.filter(t => t.reward <= 100).length;
    
    if (largeTasksTotal > 0 && smallTasksTotal > 0) {
        const largeTaskRate = (largeTasksCompleted / largeTasksTotal) * 100;
        const smallTaskRate = (smallTasksCompleted / smallTasksTotal) * 100;
        
        if (smallTaskRate > largeTaskRate + 20) {
            insights.push({
                type: 'strategy',
                icon: '✂️',
                title: 'Task Size Optimization',
                message: `You complete ${Math.round(smallTaskRate)}% of small tasks vs ${Math.round(largeTaskRate)}% of large ones. Consider breaking tasks >₹200 into smaller chunks.`,
                priority: 'high'
            });
        }
    }
    
    // Check for very large unrewarded tasks
    const veryLargeTasks = allTasks.filter(t => t.reward > 500 && !t.completed);
    if (veryLargeTasks.length > 0) {
        insights.push({
            type: 'strategy',
            icon: '🧩',
            title: 'Large Task Alert',
            message: `You have ${veryLargeTasks.length} task(s) worth >₹500. Breaking these into smaller milestones could improve completion rates.`,
            priority: 'medium'
        });
    }
    
    return insights;
}

function analyzeTimePatterns(completedTasks) {
    const insights = [];
    
    if (completedTasks.length < 5) return insights;
    
    // Analyze completion times (simulated - in real app would use actual completion timestamps)
    const dayPatterns = {};
    const timePatterns = {};
    
    completedTasks.forEach(task => {
        if (task.completedAt) {
            const date = new Date(task.completedAt);
            const dayOfWeek = date.getDay();
            const hour = date.getHours();
            
            dayPatterns[dayOfWeek] = (dayPatterns[dayOfWeek] || 0) + 1;
            
            if (hour >= 6 && hour < 12) timePatterns.morning = (timePatterns.morning || 0) + 1;
            else if (hour >= 12 && hour < 18) timePatterns.afternoon = (timePatterns.afternoon || 0) + 1;
            else if (hour >= 18 && hour < 22) timePatterns.evening = (timePatterns.evening || 0) + 1;
        }
    });
    
    // Find peak day
    const peakDay = Object.entries(dayPatterns).reduce((a, b) => a[1] > b[1] ? a : b);
    if (peakDay && peakDay[1] >= 2) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        insights.push({
            type: 'pattern',
            icon: '📅',
            title: 'Peak Performance Day',
            message: `${dayNames[peakDay[0]]} is your most productive day! Schedule important tasks then.`,
            priority: 'medium'
        });
    }
    
    // Find peak time
    const peakTime = Object.entries(timePatterns).reduce((a, b) => a[1] > b[1] ? a : b);
    if (peakTime && peakTime[1] >= 2) {
        insights.push({
            type: 'pattern',
            icon: '⏰',
            title: 'Optimal Time Window',
            message: `You're most productive in the ${peakTime[0]}. Try scheduling challenging tasks during this time.`,
            priority: 'medium'
        });
    }
    
    return insights;
}

function generateActionableRecommendations(allTasks, completedTasks) {
    const insights = [];
    const pendingTasks = allTasks.filter(t => !t.completed);
    
    // Overdue task recommendations
    const overdueTasks = pendingTasks.filter(t => {
        return t.dueDate && new Date(t.dueDate) < new Date();
    });
    
    if (overdueTasks.length > 0) {
        insights.push({
            type: 'urgent',
            icon: '⚠️',
            title: 'Overdue Tasks Alert',
            message: `You have ${overdueTasks.length} overdue task(s). Consider rescheduling or breaking them into smaller parts.`,
            priority: 'high'
        });
    }
    
    // High-value task recommendations
    const highValuePending = pendingTasks.filter(t => t.reward > 300);
    if (highValuePending.length > 0) {
        insights.push({
            type: 'opportunity',
            icon: '💎',
            title: 'High-Value Opportunities',
            message: `${highValuePending.length} high-reward task(s) pending. Completing these could significantly boost your earnings!`,
            priority: 'medium'
        });
    }
    
    // Streak building recommendations
    if (completedTasks.length > 0) {
        const recentCompletions = completedTasks.filter(t => {
            const completedDate = new Date(t.completedAt || t.createdAt);
            const daysSince = (new Date() - completedDate) / (1000 * 60 * 60 * 24);
            return daysSince <= 7;
        });
        
        if (recentCompletions.length >= 3) {
            insights.push({
                type: 'motivation',
                icon: '🔥',
                title: 'You\'re On Fire!',
                message: `${recentCompletions.length} tasks completed this week! Keep the momentum going with one more today.`,
                priority: 'low'
            });
        }
    }
    
    return insights;
}

function displayInsights(insights) {
    const insightsList = document.getElementById('insightsList');
    if (!insightsList) return;
    
    if (insights.length === 0) {
        insightsList.innerHTML = '<p class="no-insights">Complete more tasks to unlock AI insights! 🤖</p>';
        return;
    }
    
    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1, info: 0 };
    insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    
    // Display top 4 insights
    const topInsights = insights.slice(0, 4);
    
    insightsList.innerHTML = topInsights.map(insight => `
        <div class="insight-card ${insight.type} priority-${insight.priority}">
            <div class="insight-header">
                <span class="insight-icon">${insight.icon}</span>
                <h5 class="insight-title">${insight.title}</h5>
            </div>
            <p class="insight-message">${insight.message}</p>
        </div>
    `).join('');
}

function generateNewInsights() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const completedTasks = tasks.filter(task => task.completed);
    
    // Add a small delay for better UX
    const insightsList = document.getElementById('insightsList');
    if (insightsList) {
        insightsList.innerHTML = '<div class="loading-insights">🤖 Analyzing your productivity patterns...</div>';
        
        setTimeout(() => {
            generateProductivityInsights(tasks, completedTasks);
        }, 1000);
    }
}

// Test function to verify AI insights are working
function testAIInsights() {
    console.log('Testing AI Insights functionality...');
    
    // Create sample data for testing
    const sampleTasks = [
        { id: 1, name: 'Complete project report', category: 'work', priority: 'high', reward: 300, completed: true, completedAt: new Date().toISOString() },
        { id: 2, name: 'Go for a run', category: 'health', priority: 'medium', reward: 100, completed: true, completedAt: new Date().toISOString() },
        { id: 3, name: 'Read a book', category: 'learning', priority: 'low', reward: 150, completed: false },
        { id: 4, name: 'Buy groceries', category: 'personal', priority: 'medium', reward: 50, completed: false }
    ];
    
    const completedSampleTasks = sampleTasks.filter(task => task.completed);
    
    console.log('Sample tasks:', sampleTasks);
    console.log('Completed tasks:', completedSampleTasks);
    
    // Test insights generation
    generateProductivityInsights(sampleTasks, completedSampleTasks);
    
    console.log('AI Insights test completed. Check the insights panel for results.');
}