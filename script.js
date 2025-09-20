let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let wallet = parseFloat(localStorage.getItem('wallet') || '0');

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!api.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadTheme();
    syncWithBackend();
});

async function syncWithBackend() {
    try {
        // Sync tasks from backend
        const backendTasks = await api.getTasks();
        tasks = backendTasks;
        
        // Get user data
        const stats = await api.getStats();
        wallet = stats.totalEarnings;
        
        updateTaskList();
    } catch (error) {
        console.error('Sync failed:', error);
        // Fallback to local data
        updateTaskList();
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

let lastAction = null;
let currentFilter = 'all';

async function addTask() {
    const taskName = document.getElementById("taskName").value;
    const taskCategory = document.getElementById("taskCategory").value;
    const taskPriority = document.getElementById("taskPriority").value;
    const taskDueDate = document.getElementById("taskDueDate").value;
    const taskReward = parseInt(document.getElementById("taskReward").value);

    if (!taskName || isNaN(taskReward) || taskReward <= 0) {
        alert("Please enter valid task details.");
        return;
    }

    try {
        const taskData = {
            name: taskName,
            category: taskCategory,
            priority: taskPriority,
            dueDate: taskDueDate || null,
            reward: taskReward
        };
        
        const newTask = await api.createTask(taskData);
        tasks.push(newTask);
        
        lastAction = { type: 'add', task: {...newTask} };
        updateTaskList();
        showUndoButton();
        playSound('add');
        
        // Clear input fields
        document.getElementById("taskName").value = "";
        document.getElementById("taskDueDate").value = "";
        document.getElementById("taskReward").value = "";
    } catch (error) {
        alert('Failed to create task: ' + error.message);
    }
}

function updateTaskList() {
    const taskList = document.getElementById("tasks");
    const walletAmount = document.getElementById("walletAmount");
    const completedList = document.getElementById("completedList");

    walletAmount.textContent = wallet;
    taskList.innerHTML = "";
    completedList.innerHTML = "";

    tasks.forEach((task, index) => {
        const listItem = document.createElement("li");
        
        // Add category and priority classes for styling
        listItem.classList.add(`category-${task.category || 'other'}`);
        listItem.classList.add(`priority-${task.priority || 'medium'}`);
        
        // Check if task is overdue
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        if (isOverdue) {
            listItem.classList.add('overdue');
        }

        if (!task.completed) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `taskCheckbox${index}`;
            checkbox.addEventListener("change", async () => {
                if (checkbox.checked) {
                    try {
                        await api.completeTask(task._id || task.id);
                        
                        lastAction = { type: 'complete', task: {...task} };
                        task.completed = true;
                        task.completedAt = new Date().toISOString();
                        wallet += task.reward;
                        
                        updateTaskList();
                        showUndoButton();
                        playSound('complete');
                    } catch (error) {
                        checkbox.checked = false;
                        alert('Failed to complete task: ' + error.message);
                    }
                }
            });

            const taskInfo = document.createElement("div");
            taskInfo.className = "task-info";
            
            const taskText = document.createElement("span");
            taskText.textContent = `${task.name} - ₹${task.reward}`;
            
            const taskMeta = document.createElement("div");
            taskMeta.className = "task-meta";
            taskMeta.innerHTML = `
                <span class="priority-badge priority-${task.priority || 'medium'}">${getPriorityIcon(task.priority)} ${(task.priority || 'medium').toUpperCase()}</span>
                <span class="category-badge category-${task.category || 'other'}">${(task.category || 'other').toUpperCase()}</span>
                ${task.dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">${formatDate(task.dueDate)}</span>` : ''}
            `;
            
            taskInfo.appendChild(taskText);
            taskInfo.appendChild(taskMeta);
            
            listItem.appendChild(taskInfo);
            listItem.appendChild(checkbox);
            taskList.appendChild(listItem);
        } else {
            const taskInfo = document.createElement("div");
            taskInfo.className = "task-info";
            taskInfo.innerHTML = `
                <span style="text-decoration: line-through; color: #808080;">${task.name} - ₹${task.reward}</span>
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority || 'medium'}">${getPriorityIcon(task.priority)} ${(task.priority || 'medium').toUpperCase()}</span>
                    <span class="category-badge category-${task.category || 'other'}">${(task.category || 'other').toUpperCase()}</span>
                </div>
            `;
            listItem.appendChild(taskInfo);
            completedList.appendChild(listItem);
        }
    });
}

function withdrawMoney(amount) {
    wallet += amount;
    saveData();
    updateTaskList();
}

function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('wallet', wallet.toString());
}
// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `${diffDays} days left`;
}

// Priority helper function
function getPriorityIcon(priority) {
    switch(priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '🟡';
    }
}

// Sound effects
function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'complete') {
        // Success sound - ascending notes
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    } else if (type === 'add') {
        // Add sound - single note
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Search and filter functionality
function filterTasks() {
    const searchTerm = document.getElementById('searchTasks').value.toLowerCase();
    const taskItems = document.querySelectorAll('#tasks li, #completedList li');
    
    taskItems.forEach(item => {
        const taskText = item.textContent.toLowerCase();
        const matchesSearch = taskText.includes(searchTerm);
        const matchesCategory = currentFilter === 'all' || item.classList.contains(`category-${currentFilter}`);
        
        item.style.display = (matchesSearch && matchesCategory) ? 'flex' : 'none';
    });
}

function filterByCategory(category) {
    currentFilter = category;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${category}"]`).classList.add('active');
    
    filterTasks();
}

// Undo functionality
function showUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    undoBtn.style.display = 'inline-block';
    setTimeout(() => {
        undoBtn.style.display = 'none';
        lastAction = null;
    }, 10000); // Hide after 10 seconds
}

function undoLastAction() {
    if (!lastAction) return;
    
    if (lastAction.type === 'add') {
        // Remove the last added task
        tasks = tasks.filter(task => task.id !== lastAction.task.id);
    } else if (lastAction.type === 'complete') {
        // Uncomplete the task and remove reward
        const task = tasks.find(t => t.id === lastAction.task.id);
        if (task) {
            task.completed = false;
            delete task.completedAt;
            wallet -= task.reward;
        }
    }
    
    saveData();
    updateTaskList();
    document.getElementById('undoBtn').style.display = 'none';
    lastAction = null;
    playSound('add'); // Neutral sound for undo
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt+N to focus on task name input
    if (e.altKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('taskName').focus();
    }
    
    // Enter to add task when in task name field
    if (e.key === 'Enter' && document.activeElement.id === 'taskName') {
        e.preventDefault();
        addTask();
    }
    
    // Space to toggle first uncompleted task (when not in input field)
    if (e.key === ' ' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        const firstCheckbox = document.querySelector('#tasks input[type="checkbox"]');
        if (firstCheckbox) {
            firstCheckbox.click();
        }
    }
});
// Natural Language Processing for Task Creation
function parseNaturalLanguage() {
    const input = document.getElementById('naturalInput').value.trim();
    if (!input) return;
    
    const parsed = extractTaskDetails(input);
    
    // Populate form fields with extracted data
    document.getElementById('taskName').value = parsed.name;
    document.getElementById('taskCategory').value = parsed.category;
    document.getElementById('taskPriority').value = parsed.priority;
    document.getElementById('taskDueDate').value = parsed.dueDate;
    document.getElementById('taskReward').value = parsed.reward;
    
    // Clear natural input
    document.getElementById('naturalInput').value = '';
    
    // Show success feedback
    showParseSuccess(parsed);
}

function extractTaskDetails(input) {
    const result = {
        name: '',
        category: 'other',
        priority: 'medium',
        dueDate: '',
        reward: 0
    };
    
    // Extract reward amount (₹, Rs, rupees, or just numbers)
    const rewardPatterns = [
        /(?:₹|rs\.?|rupees?)\s*(\d+)/i,
        /(\d+)\s*(?:₹|rs\.?|rupees?)/i,
        /for\s+(\d+)/i,
        /worth\s+(\d+)/i
    ];
    
    for (const pattern of rewardPatterns) {
        const match = input.match(pattern);
        if (match) {
            result.reward = parseInt(match[1]);
            break;
        }
    }
    
    // Extract due dates
    const datePatterns = [
        { pattern: /by\s+(today|tomorrow)/i, handler: (match) => getRelativeDate(match[1]) },
        { pattern: /by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, handler: (match) => getNextWeekday(match[1]) },
        { pattern: /by\s+(\d{1,2}\/\d{1,2}\/\d{4})/i, handler: (match) => formatDate(match[1]) },
        { pattern: /by\s+(\d{1,2}\/\d{1,2})/i, handler: (match) => formatDateWithYear(match[1]) },
        { pattern: /due\s+(today|tomorrow)/i, handler: (match) => getRelativeDate(match[1]) },
        { pattern: /due\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, handler: (match) => getNextWeekday(match[1]) }
    ];
    
    for (const { pattern, handler } of datePatterns) {
        const match = input.match(pattern);
        if (match) {
            result.dueDate = handler(match);
            break;
        }
    }
    
    // Extract category based on keywords
    const categoryKeywords = {
        work: ['work', 'office', 'meeting', 'report', 'presentation', 'project', 'client', 'business', 'email', 'call'],
        health: ['workout', 'exercise', 'gym', 'run', 'walk', 'doctor', 'medicine', 'health', 'fitness', 'yoga'],
        personal: ['clean', 'laundry', 'shopping', 'groceries', 'home', 'family', 'friend', 'personal', 'buy'],
        learning: ['study', 'learn', 'read', 'course', 'tutorial', 'practice', 'research', 'book', 'skill']
    };
    
    const lowerInput = input.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerInput.includes(keyword))) {
            result.category = category;
            break;
        }
    }
    
    // Extract priority based on urgency words
    const urgencyKeywords = {
        high: ['urgent', 'asap', 'immediately', 'critical', 'important', 'priority'],
        low: ['later', 'sometime', 'eventually', 'when possible', 'low priority']
    };
    
    for (const [priority, keywords] of Object.entries(urgencyKeywords)) {
        if (keywords.some(keyword => lowerInput.includes(keyword))) {
            result.priority = priority;
            break;
        }
    }
    
    // Extract task name (remove parsed elements)
    let taskName = input;
    
    // Remove reward mentions
    taskName = taskName.replace(/(?:for\s+)?(?:₹|rs\.?|rupees?)\s*\d+/gi, '');
    taskName = taskName.replace(/\d+\s*(?:₹|rs\.?|rupees?)/gi, '');
    taskName = taskName.replace(/for\s+\d+/gi, '');
    taskName = taskName.replace(/worth\s+\d+/gi, '');
    
    // Remove date mentions
    taskName = taskName.replace(/by\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '');
    taskName = taskName.replace(/due\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '');
    taskName = taskName.replace(/by\s+\d{1,2}\/\d{1,2}(?:\/\d{4})?/gi, '');
    
    // Remove priority mentions
    taskName = taskName.replace(/\b(urgent|asap|immediately|critical|important|priority|later|sometime|eventually|when possible|low priority)\b/gi, '');
    
    // Clean up the task name
    taskName = taskName.replace(/\s+/g, ' ').trim();
    taskName = taskName.replace(/^(finish|complete|do|make|create|write|send)\s+/i, '');
    
    result.name = taskName || 'New Task';
    
    return result;
}

// Helper functions for date processing
function getRelativeDate(day) {
    const today = new Date();
    if (day.toLowerCase() === 'today') {
        return today.toISOString().split('T')[0];
    } else if (day.toLowerCase() === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    return '';
}

function getNextWeekday(dayName) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    
    if (targetDay === -1) return '';
    
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntilTarget = targetDay - currentDay;
    
    if (daysUntilTarget <= 0) {
        daysUntilTarget += 7; // Next week
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
}

function formatDate(dateStr) {
    // Convert MM/DD/YYYY to YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return '';
}

function formatDateWithYear(dateStr) {
    // Convert MM/DD to YYYY-MM-DD (current year)
    const parts = dateStr.split('/');
    if (parts.length === 2) {
        const currentYear = new Date().getFullYear();
        return `${currentYear}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return '';
}

function showParseSuccess(parsed) {
    const feedback = document.createElement('div');
    feedback.className = 'parse-feedback';
    feedback.innerHTML = `
        <div class="parse-success">
            ✨ AI Parsed Successfully!
            <div class="parsed-details">
                <span><strong>Task:</strong> ${parsed.name}</span>
                <span><strong>Category:</strong> ${parsed.category}</span>
                <span><strong>Priority:</strong> ${parsed.priority}</span>
                ${parsed.dueDate ? `<span><strong>Due:</strong> ${parsed.dueDate}</span>` : ''}
                ${parsed.reward ? `<span><strong>Reward:</strong> ₹${parsed.reward}</span>` : ''}
            </div>
        </div>
    `;
    
    const taskInput = document.getElementById('taskInput');
    taskInput.insertBefore(feedback, taskInput.firstChild);
    
    setTimeout(() => {
        feedback.remove();
    }, 5000);
}

function handleNaturalInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        parseNaturalLanguage();
    }
}