// Check authentication
if (!api.isAuthenticated()) {
    window.location.href = 'login.html';
}

// Add logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const dataSection = document.querySelector('.settings-section:last-child');
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'danger-btn';
    logoutBtn.onclick = () => {
        if (confirm('Are you sure you want to logout?')) {
            api.logout();
        }
    };
    dataSection.appendChild(logoutBtn);
});

// Settings functionality
function exportData() {
    const data = {
        tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
        completedTasks: JSON.parse(localStorage.getItem('completedTasks') || '[]'),
        walletAmount: localStorage.getItem('walletAmount') || '0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quickbucks-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        alert('All data has been cleared.');
    }
}

// Theme functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeSelect = document.getElementById('theme');
    const savedTheme = localStorage.getItem('theme') || 'default';
    
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);
    
    themeSelect.addEventListener('change', function() {
        const selectedTheme = this.value;
        localStorage.setItem('theme', selectedTheme);
        applyTheme(selectedTheme);
    });
});

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}