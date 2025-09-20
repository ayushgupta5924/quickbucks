let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let wallet = parseFloat(localStorage.getItem('wallet') || '0');

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    updateTaskList();
    loadTheme();
});

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

function addTask() {
    const taskName = document.getElementById("taskName").value;
    const taskReward = parseInt(document.getElementById("taskReward").value);

    if (!taskName || isNaN(taskReward) || taskReward <= 0) {
        alert("Please enter valid task details.");
        return;
    }

    const existingTask = tasks.find(task => task.name === taskName && !task.completed);

    if (existingTask) {
        alert("Task already exists in current tasks!");
    } else {
        const task = {
            name: taskName,
            reward: taskReward,
            completed: false
        };

        tasks.push(task);
        saveData();
        updateTaskList();
        
        // Clear input fields
        document.getElementById("taskName").value = "";
        document.getElementById("taskReward").value = "";
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

        if (!task.completed) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `taskCheckbox${index}`;
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    withdrawMoney(task.reward);
                    task.completed = true;
                    saveData();
                    updateTaskList();
                }
            });

            listItem.textContent = `${task.name} - ₹${task.reward}`;
            listItem.appendChild(checkbox);
            taskList.appendChild(listItem);
        } else {
            listItem.textContent = `${task.name} - ₹${task.reward}`;
            listItem.style.textDecoration = "line-through";
            listItem.style.color = "#808080";
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