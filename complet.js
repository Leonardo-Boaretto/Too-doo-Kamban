class Task {
    constructor(id, title, description, priority, status) {
        this.id = id;
        this.title = title;
        this.description = description || '';
        this.priority = priority || 'medium';
        this.status = status || 'todo';
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    update(title, description, priority, status) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.updatedAt = new Date().toISOString();
    }
}

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentView = 'todo';
        this.editingTaskId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.setupDragAndDrop();
        this.animateInitialLoad();
        this.setupDynamicEventListeners();
    }

    loadTasks() {
        try {
            const tasks = localStorage.getItem('tasks');
            if (tasks) {
                return JSON.parse(tasks).map(task => ({
                    ...task,
                    createdAt: new Date(task.createdAt),
                    updatedAt: new Date(task.updatedAt)
                }));
            } else {
                return this.loadSampleTasks();
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            return this.loadSampleTasks();
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Erro ao salvar tarefas:', error);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    loadSampleTasks() {
        return [
            {
                id: 'task1',
                title: 'Configurar ambiente de desenvolvimento',
                description: 'Instalar Node.js, Git e configurar VS Code',
                priority: 'high',
                status: 'done',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'task2',
                title: 'Criar wireframes do projeto',
                description: 'Desenhar os mockups das telas principais da aplicação',
                priority: 'medium',
                status: 'in-progress',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'task3',
                title: 'Implementar sistema de autenticação',
                description: 'Desenvolver login, registro e recuperação de senha',
                priority: 'high',
                status: 'todo',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'task4',
                title: 'Revisar documentação da API',
                description: 'Ler e entender a documentação da API externa',
                priority: 'low',
                status: 'todo',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'task5',
                title: 'Testar funcionalidade de drag and drop',
                description: 'Verificar se o sistema Kanban está funcionando corretamente',
                priority: 'medium',
                status: 'in-progress',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
    }

    createTask(title, description, priority, status) {
        const task = new Task(this.generateId(), title, description, priority, status);
        this.tasks.push(task);
        this.saveTasks();
        this.render();
        return task;
    }

    updateTask(id, title, description, priority, status) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            // Atualizar diretamente as propriedades do objeto
            this.tasks[taskIndex].title = title;
            this.tasks[taskIndex].description = description;
            this.tasks[taskIndex].priority = priority;
            this.tasks[taskIndex].status = status;
            this.tasks[taskIndex].updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    }

    getTasksByStatus(status) {
        return this.tasks.filter(task => task.status === status);
    }

    setupDynamicEventListeners() {
        if (this.dynamicEventHandler) {
            document.removeEventListener('click', this.dynamicEventHandler);
        }

        this.dynamicEventHandler = (e) => {
            if (e.target.closest('.edit-btn')) {
                e.preventDefault();
                const taskId = e.target.closest('.edit-btn').dataset.id;
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    this.openTaskModal(task);
                }
            }

            if (e.target.closest('.delete-btn')) {
                const taskId = e.target.closest('.delete-btn').dataset.id;
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    this.openDeleteModal(task);
                }
            }

            if (e.target.closest('.kanban-card') && !e.target.closest('.kanban-card-badges')) {
                const taskId = e.target.closest('.kanban-card').dataset.id;
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    this.openTaskModal(task);
                }
            }
        };

        document.addEventListener('click', this.dynamicEventHandler);
    }

    setupEventListeners() {
        document.getElementById('todo-view-btn').addEventListener('click', () => {
            this.switchView('todo');
        });

        document.getElementById('kanban-view-btn').addEventListener('click', () => {
            this.switchView('kanban');
        });

        document.getElementById('back-to-welcome').addEventListener('click', () => {
            window.location.href = 'welcome.html';
        });

        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.getElementById('add-kanban-task-btn').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('cancel-task').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('save-task').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        document.getElementById('close-delete-modal').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.handleDeleteConfirm();
        });

        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeTaskModal();
            }
        });

        document.getElementById('delete-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeDeleteModal();
            }
        });
    }

    switchView(view) {
        this.currentView = view;

        document.getElementById('todo-view-btn').classList.toggle('active', view === 'todo');
        document.getElementById('kanban-view-btn').classList.toggle('active', view === 'kanban');

        document.getElementById('todo-view').classList.toggle('active', view === 'todo');
        document.getElementById('kanban-view').classList.toggle('active', view === 'kanban');

        this.render();
        this.animateViewSwitch(view);
    }

    animateViewSwitch(view) {
        const viewElement = document.getElementById(`${view}-view`);
        if (window.motion) {
            window.motion.animate(viewElement, {
                opacity: [0, 1],
                y: [20, 0]
            }, {
                duration: 0.3,
                easing: 'ease-out'
            });
        }
    }

    render() {
        if (this.currentView === 'todo') {
            this.renderTodoList();
        } else {
            this.renderKanbanBoard();
        }
    }

    renderTodoList() {
        const todoList = document.getElementById('todo-list');
        todoList.innerHTML = '';

        if (this.tasks.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>Nenhuma tarefa encontrada</h3>
                    <p>Crie sua primeira tarefa para começar a se organizar!</p>
                </div>
            `;
            return;
        }

        this.tasks.forEach(task => {
            const taskElement = this.createTodoItem(task);
            todoList.appendChild(taskElement);
        });

        this.updateTaskCounts();
    }

    createTodoItem(task) {
        const item = document.createElement('div');
        item.className = 'todo-item';
        item.dataset.id = task.id;

        item.innerHTML = `
            <div class="todo-item-header">
                <div>
                    <div class="todo-item-title">${this.escapeHtml(task.title)}</div>
                    <div class="todo-item-description">${this.escapeHtml(task.description)}</div>
                </div>
                <div class="todo-item-badges">
                    <span class="priority-badge priority-${task.priority}">${this.getPriorityText(task.priority)}</span>
                    <span class="status-badge status-${task.status}">${this.getStatusText(task.status)}</span>
                </div>
            </div>
            <div class="todo-item-actions">
                <button class="action-btn edit-btn" data-id="${task.id}" title="Editar">✏️</button>
                <button class="action-btn delete-btn" data-id="${task.id}" title="Excluir">🗑️</button>
            </div>
        `;

        return item;
    }

    renderKanbanBoard() {
        const columns = ['todo', 'in-progress', 'done'];

        columns.forEach(status => {
            const column = document.getElementById(`${status}-column`);
            const tasks = this.getTasksByStatus(status);

            column.innerHTML = '';

            tasks.forEach(task => {
                const card = this.createKanbanCard(task);
                column.appendChild(card);
            });
        });

        this.updateTaskCounts();
    }

    createKanbanCard(task) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.dataset.id = task.id;
        card.draggable = true;

        card.innerHTML = `
            <div class="kanban-card-title">${this.escapeHtml(task.title)}</div>
            <div class="kanban-card-description">${this.escapeHtml(task.description)}</div>
            <div class="kanban-card-badges">
                <span class="priority-badge priority-${task.priority}">${this.getPriorityText(task.priority)}</span>
            </div>
        `;

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        return card;
    }

    setupDragAndDrop() {
        const columns = document.querySelectorAll('.column-content');

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');

                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = column.id.replace('-column', '');

                const task = this.tasks.find(t => t.id === taskId);
                if (task && task.status !== newStatus) {
                    task.status = newStatus;
                    task.updatedAt = new Date().toISOString();
                    this.saveTasks();
                    this.render();
                    this.animateCardMove();
                }
            });
        });
    }

    animateCardMove() {
        const cards = document.querySelectorAll('.kanban-card');
        if (window.motion && cards.length > 0) {
            window.motion.animate(cards, {
                scale: [1.05, 1]
            }, {
                duration: 0.2,
                easing: 'ease-out'
            });
        }
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const title = document.getElementById('modal-title');

        if (task) {
            this.editingTaskId = task.id;
            title.textContent = 'Editar Tarefa';
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-status').value = task.status;
        } else {
            this.editingTaskId = null;
            title.textContent = 'Nova Tarefa';
            form.reset();
            document.getElementById('task-status').value = 'todo';
            document.getElementById('task-priority').value = 'medium';
        }

        modal.classList.add('show');
        document.getElementById('task-title').focus();

        if (window.motion) {
            const modalContent = modal.querySelector('.modal-content');
            window.motion.animate(modalContent, {
                opacity: [0, 1],
                y: [-50, 0],
                scale: [0.95, 1]
            }, {
                duration: 0.3,
                easing: 'ease-out'
            });
        }
    }

    closeTaskModal() {
        const modal = document.getElementById('task-modal');
        modal.classList.remove('show');
        this.editingTaskId = null;
    }

    openDeleteModal(task) {
        this.taskToDelete = task;
        const modal = document.getElementById('delete-modal');
        modal.classList.add('show');

        if (window.motion) {
            const modalContent = modal.querySelector('.modal-content');
            window.motion.animate(modalContent, {
                opacity: [0, 1],
                y: [-50, 0],
                scale: [0.95, 1]
            }, {
                duration: 0.3,
                easing: 'ease-out'
            });
        }
    }

    closeDeleteModal() {
        const modal = document.getElementById('delete-modal');
        modal.classList.remove('show');
        this.taskToDelete = null;
    }

    handleTaskSubmit() {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;

        if (!title) {
            alert('Por favor, digite um título para a tarefa.');
            return;
        }

        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, title, description, priority, status);
        } else {
            this.createTask(title, description, priority, status);
        }

        this.closeTaskModal();
        this.showNotification('Tarefa salva com sucesso!', 'success');
    }

    handleDeleteConfirm() {
        if (this.taskToDelete) {
            this.deleteTask(this.taskToDelete.id);
            this.closeDeleteModal();
            this.showNotification('Tarefa excluída com sucesso!', 'error');
        }
    }

    updateTaskCounts() {
        const columns = ['todo', 'in-progress', 'done'];

        columns.forEach(status => {
            const count = this.getTasksByStatus(status).length;
            const countElement = document.querySelector(`[data-status="${status}"] .task-count`);
            if (countElement) {
                countElement.textContent = count;

                if (window.motion) {
                    window.motion.animate(countElement, {
                        scale: [1.2, 1]
                    }, {
                        duration: 0.2,
                        easing: 'ease-out'
                    });
                }
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        `;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getPriorityText(priority) {
        const priorities = {
            'low': 'Baixa',
            'medium': 'Média',
            'high': 'Alta'
        };
        return priorities[priority] || 'Média';
    }

    getStatusText(status) {
        const statuses = {
            'todo': 'A Fazer',
            'in-progress': 'Em Progresso',
            'done': 'Concluído'
        };
        return statuses[status] || 'A Fazer';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    animateInitialLoad() {
        const elements = document.querySelectorAll('.todo-item, .kanban-card');

        if (window.motion && elements.length > 0) {
            window.motion.animate(elements, {
                opacity: [0, 1],
                y: [20, 0]
            }, {
                duration: 0.3,
                delay: window.motion.stagger(0.1),
                easing: 'ease-out'
            });
        }
    }
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// Estilos CSS para drag and drop
const style = document.createElement('style');
style.textContent = `
    .column-content.drag-over {
        background: rgba(99, 102, 241, 0.1);
        border: 2px dashed var(--primary-color);
        border-radius: var(--radius);
    }

    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-secondary);
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .empty-state h3 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }

    .todo-item-badges {
        display: flex;
        gap: 0.5rem;
    }

    .kanban-card-badges {
        margin-top: 0.5rem;
    }
`;
document.head.appendChild(style);
