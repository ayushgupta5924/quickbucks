// Statistics functionality
function updateStatistics() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
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
});

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}