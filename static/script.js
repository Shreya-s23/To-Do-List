document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const progressCount = document.querySelector('.progress-count');
    const streakCount = document.querySelector('.streak-count');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    // State
    let currentTab = 'active';
    let streak = localStorage.getItem('streak') ? parseInt(localStorage.getItem('streak')) : 0;
    let lastCompletionDate = localStorage.getItem('lastCompletionDate') || null;
    
    // Motivational quotes
    const quotes = [
        {
            text: "The secret of getting ahead is getting started.",
            author: "Mark Twain"
        },
        {
            text: "You don't have to be great to start, but you have to start to be great.",
            author: "Zig Ziglar"
        },
        {
            text: "Small daily improvements are the key to staggering long-term results.",
            author: "Robin Sharma"
        },
        {
            text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
            author: "Paul J. Meyer"
        },
        {
            text: "The way to get started is to quit talking and begin doing.",
            author: "Walt Disney"
        }
    ];
    
    // Initialize the app
    init();
    
    // Event Listeners
    taskForm.addEventListener('submit', addTask);
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Functions
    function init() {
        updateStreak();
        renderTasks();
        updateProgress();
        showRandomQuote();
    }
    
    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        
        if (taskText) {
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            saveTask(task);
            taskInput.value = '';
            renderTasks();
            updateProgress();
            
            // Animation feedback
            const addBtn = document.querySelector('.add-btn');
            addBtn.classList.add('pulse');
            setTimeout(() => addBtn.classList.remove('pulse'), 300);
        }
    }
    
    function saveTask(task) {
        const tasks = getTasks();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }
    
    function renderTasks() {
        const tasks = getTasks();
        const filteredTasks = tasks.filter(task => {
            if (currentTab === 'active') return !task.completed;
            if (currentTab === 'completed') return task.completed;
            return true;
        });
        
        taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                if (task.completed) taskItem.classList.add('completed');
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button class="task-btn edit" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                        <button class="task-btn delete" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                taskList.appendChild(taskItem);
            });
        }
        
        // Add event listeners to new elements
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTask);
        });
        
        document.querySelectorAll('.task-btn.delete').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });
        
        document.querySelectorAll('.task-btn.edit').forEach(btn => {
            btn.addEventListener('click', editTask);
        });
    }
    
    function toggleTask(e) {
        const taskId = parseInt(e.target.dataset.id);
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = e.target.checked;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            if (tasks[taskIndex].completed) {
                updateStreak(true);
                showRandomQuote();
            }
            
            renderTasks();
            updateProgress();
        }
    }
    
    function deleteTask(e) {
        const taskId = parseInt(e.target.closest('button').dataset.id);
        const tasks = getTasks().filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateProgress();
    }
    
    function editTask(e) {
        const taskId = parseInt(e.target.closest('button').dataset.id);
        const tasks = getTasks();
        const task = tasks.find(task => task.id === taskId);
        
        if (task) {
            const newText = prompt('Edit your task:', task.text);
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
            }
        }
    }
    
    function switchTab(tab) {
        currentTab = tab;
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        renderTasks();
    }
    
    function updateProgress() {
        const tasks = getTasks();
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        
        progressCount.textContent = `${completedTasks} / ${totalTasks}`;
    }
    
    function updateStreak(taskCompleted = false) {
        const today = new Date().toDateString();
        
        if (taskCompleted) {
            if (lastCompletionDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastCompletionDate === yesterday.toDateString()) {
                    streak++;
                } else if (lastCompletionDate !== today) {
                    streak = 1;
                }
                
                lastCompletionDate = today;
                localStorage.setItem('lastCompletionDate', lastCompletionDate);
                localStorage.setItem('streak', streak.toString());
            }
        }
        
        streakCount.textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;
    }
    
    function showRandomQuote() {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteText.textContent = `"${randomQuote.text}"`;
        quoteAuthor.textContent = `- ${randomQuote.author}`;
    }
});