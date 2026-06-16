class APIService {
    constructor() {
        // standalone PWA mode
        this.token = localStorage.getItem('authToken') || 'standalone-mode';
    }

    async login(email, password) { 
        return { token: 'standalone-mode', user: { name: 'Local User' } }; 
    }

    async register(name, email, password) { 
        return { token: 'standalone-mode', user: { name: name } }; 
    }

    logout() { 
        console.log("Logout bypassed in standalone mode.");
    }

    isAuthenticated() { 
        return true;
    }

    async getTasks() {
        return JSON.parse(localStorage.getItem('tasks') || '[]');
    }

    async createTask(taskData) {
        const tasks = await this.getTasks();

        const newTask = {
            _id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: 'pending',
            completed: false,
            ...taskData
        };

        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        return newTask;
    }

    async completeTask(taskId) {
        const tasks = await this.getTasks();
        const taskIndex = tasks.findIndex(t => t._id === taskId || t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = 'completed';
            tasks[taskIndex].completed = true;
            tasks[taskIndex].completedAt = new Date().toISOString();

            localStorage.setItem('tasks', JSON.stringify(tasks));
            return tasks[taskIndex];
        }

        return { success: false, message: 'Task not found' };
    }
    async deleteTask(taskId) {
        let tasks = await this.getTasks();

        tasks = tasks.filter(t => t._id !== taskId && t.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        return { success: true };
    }
    async getStats() {
        const tasks = await this.getTasks();
        const completed = tasks.filter(t => t.completed || t.status === 'completed').length;
        return { 
            totalTasks: tasks.length, 
            completedTasks: completed,
            completionRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0
        };
    }

    async getInsights() { 

        return { 
            insights: ["You are highly productive in standalone mode!"],
            recommendations: ["Keep adding tasks to earn more virtual currency."]
        }; 
    }

    async getPatterns() { 
        return { patterns: [] }; 
    }
}

const api = new APIService();
