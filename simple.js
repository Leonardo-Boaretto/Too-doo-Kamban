class SimpleTaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.animateInitialLoad();
        console.log('✅ SimpleTaskManager inicializado');
    }

    loadTasks() {
        try {
            const tasks = localStorage.getItem('simple-tasks');
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('❌ Erro ao carregar tarefas:', error);
            this.showNotification('Erro ao carregar tarefas', 'error');
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('simple-tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('❌ Erro ao salvar tarefas:', error);
            this.showNotification('Erro ao salvar tarefas', 'error');
        }
    }

    setupEventListeners() {
        const addBtn = document.getElementById('add-task-btn');
        const input = document.getElementById('new-task-input');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.addTask());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask();
                }
            });

            input.focus();
        }

        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'welcome.html';
            });
        }

        console.log('✅ Event listeners configurados');
    }

    addTask() {
        const input = document.getElementById('new-task-input');
        if (!input) return;

        const title = input.value.trim();

        if (!title) {
            this.showNotification('Por favor, digite uma tarefa.', 'error');
            input.focus();
            return;
        }

        if (this.tasks.some(task => task.title.toLowerCase() === title.toLowerCase())) {
            this.showNotification('Esta tarefa já existe!', 'error');
            return;
        }

        this.tasks.push({
            id: Date.now().toString(),
            title: title,
            completed: false,
            createdAt: new Date().toISOString()
        });

        this.saveTasks();
        this.render();
        input.value = '';
        this.showNotification('Tarefa adicionada com sucesso!', 'success');
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
        this.showNotification('Tarefa excluída!', 'info');
    }

    editTask(id, newTitle) {
        const task = this.tasks.find(task => task.id === id);
        if (task && newTitle.trim()) {
            task.title = newTitle.trim();
            this.saveTasks();
            this.render();
            this.showNotification('Tarefa editada com sucesso!', 'success');
        }
    }

    render() {
        const tasksList = document.getElementById('tasks-list');
        const emptyState = document.getElementById('empty-state');

        if (!tasksList) return;

        tasksList.innerHTML = '';

        if (this.tasks.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;

        taskItem.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="task-${task.id}" class="checkbox-custom"></label>
            </div>
            <div class="task-content">
                <span class="task-title ${task.completed ? 'completed-text' : ''}">${task.title}</span>
                <div class="task-actions">
                    <button class="edit-btn" title="Editar">✏️</button>
                    <button class="delete-btn" title="Excluir">🗑️</button>
                </div>
            </div>
        `;

        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => this.toggleTask(task.id));

        const editBtn = taskItem.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.startEdit(task);
            });
        }

        const deleteBtn = taskItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        return taskItem;
    }

    startEdit(task) {
        const taskElement = document.querySelector(`[data-id="${task.id}"]`);
        const titleElement = taskElement.querySelector('.task-title');
        const actionsElement = taskElement.querySelector('.task-actions');
        const taskContent = taskElement.querySelector('.task-content');

        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.title;
        input.className = 'task-input edit-input';

        const editContainer = document.createElement('div');
        editContainer.className = 'edit-container';
        editContainer.innerHTML = `
            <input type="text" class="edit-input" value="${task.title}">
            <div class="edit-actions">
                <button class="btn btn-primary save-edit">💾</button>
                <button class="btn btn-ghost cancel-edit">❌</button>
            </div>
        `;

        console.log('Edit container created:', editContainer);

        taskContent.innerHTML = '';
        taskContent.appendChild(editContainer);

        const editInput = editContainer.querySelector('.edit-input');

        editInput.focus();
        editInput.select();

        const saveEdit = () => {
            const newTitle = editInput.value.trim();
            if (newTitle && newTitle !== task.title) {
                this.editTask(task.id, newTitle);
            } else {
                this.cancelEdit(task);
            }
        };

        editContainer.querySelector('.save-edit').addEventListener('click', saveEdit);
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
        editContainer.querySelector('.cancel-edit').addEventListener('click', () => this.cancelEdit(task));

        console.log('startEdit function completed successfully');
    }
    cancelEdit(task) {
        const taskElement = document.querySelector(`[data-id="${task.id}"]`);
        const taskContent = taskElement.querySelector('.task-content');
        const editContainer = taskContent.querySelector('.edit-container');

        if (editContainer) {
            editContainer.remove();
        }

        const originalContent = `
            <span class="task-title ${task.completed ? 'completed-text' : ''}">${task.title}</span>
            <div class="task-actions">
                <button class="edit-btn" title="Editar">✏️</button>
                <button class="delete-btn" title="Excluir">🗑️</button>
            </div>
        `;

        taskContent.innerHTML = originalContent;

        const editBtn = taskContent.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => this.startEdit(task));

        const deleteBtn = taskContent.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification-simple notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    animateButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    animateInitialLoad() {
        const container = document.querySelector('.simple-container');
        if (container && window.motion) {
            window.motion.animate(container, {
                opacity: [0, 1],
                y: [20, 0]
            }, {
                duration: 0.5,
                easing: 'ease-out'
            });
        }
    }

    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        return {
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    clearCompleted() {
        const hadCompleted = this.tasks.some(task => task.completed);

        if (!hadCompleted) {
            this.showNotification('Nenhuma tarefa concluída para limpar', 'info');
            return;
        }

        if (confirm('Tem certeza que deseja excluir todas as tarefas concluídas?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
            this.showNotification('Tarefas concluídas removidas!', 'success');
        }
    }

    exportTasks() {
        if (this.tasks.length === 0) {
            this.showNotification('Nenhuma tarefa para exportar', 'info');
            return;
        }

        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `simple-tasks-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        this.showNotification('Tarefas exportadas!', 'success');
    }

    importTasks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedTasks = JSON.parse(e.target.result);

                    if (!Array.isArray(importedTasks)) {
                        throw new Error('Formato inválido');
                    }

                    const validTasks = importedTasks.filter(task =>
                        task.id && task.title && typeof task.completed === 'boolean'
                    );

                    if (validTasks.length === 0) {
                        throw new Error('Nenhuma tarefa válida encontrada');
                    }

                    const willOverwrite = this.tasks.length > 0;
                    const message = willOverwrite
                        ? `Importar ${validTasks.length} tarefas? (Isso substituirá as tarefas atuais)`
                        : `Importar ${validTasks.length} tarefas?`;

                    if (confirm(message)) {
                        this.tasks = validTasks;
                        this.saveTasks();
                        this.render();
                        this.showNotification(`${validTasks.length} tarefas importadas!`, 'success');
                    }
                } catch (error) {
                    console.error('Erro ao importar:', error);
                    this.showNotification('Erro ao importar arquivo', 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Simple Todo...');

    if (!document.querySelector('.simple-container')) {
        console.log('⚠️ Página Simple Todo não encontrada');
        return;
    }

    window.simpleTaskManager = new SimpleTaskManager();
    window.SimpleTaskManager = SimpleTaskManager;

    console.log('✅ Simple Todo carregado com sucesso!');
});

window.debugSimpleTasks = function() {
    console.log('=== DEBUG SIMPLE TASKS ===');
    console.log('Tasks:', window.simpleTaskManager.tasks);
    console.log('Stats:', window.simpleTaskManager.getStats());
    console.log('DOM Elements:', {
        container: document.querySelector('.simple-container') ? 'OK' : 'MISSING',
        tasksList: document.getElementById('tasks-list') ? 'OK' : 'MISSING',
        addBtn: document.getElementById('add-task-btn') ? 'OK' : 'MISSING',
        input: document.getElementById('new-task-input') ? 'OK' : 'MISSING'
    });
};
