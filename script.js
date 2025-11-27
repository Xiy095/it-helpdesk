// База данных в JSON (хранится в localStorage)
let tickets = JSON.parse(localStorage.getItem('tickets')) || [];

// Создание заявки
document.getElementById('ticketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const ticket = {
        id: Date.now(),
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        priority: document.getElementById('priority').value,
        status: 'open',
        created: new Date().toLocaleString('ru-RU')
    };
    
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));
    renderTickets();
    this.reset();
    alert('✅ Заявка создана!');
});

// Отображение заявок
function renderTickets() {
    const container = document.getElementById('ticketsContainer');
    
    if (tickets.length === 0) {
        container.innerHTML = '<p>Заявок пока нет</p>';
        return;
    }
    
    container.innerHTML = tickets.map(ticket => `
        <div class="ticket ${ticket.priority}">
            <h3>${ticket.title}</h3>
            <div class="ticket-meta">
                🔥 Приоритет: ${getPriorityText(ticket.priority)} | 
                📊 Статус: <span class="ticket-status status-${ticket.status}">${getStatusText(ticket.status)}</span> |
                📅 Создана: ${ticket.created}
            </div>
            <p>${ticket.description}</p>
            <button onclick="changeStatus(${ticket.id}, 'in-progress')">В работу</button>
            <button onclick="changeStatus(${ticket.id}, 'resolved')">Решено</button>
            <button onclick="deleteTicket(${ticket.id})" class="delete-btn">Удалить</button>
        </div>
    `).join('');
}

// Смена статуса
function changeStatus(ticketId, newStatus) {
    tickets = tickets.map(ticket => 
        ticket.id === ticketId ? {...ticket, status: newStatus} : ticket
    );
    localStorage.setItem('tickets', JSON.stringify(tickets));
    renderTickets();
}

// Удаление заявки
function deleteTicket(ticketId) {
    if (confirm('Удалить заявку?')) {
        tickets = tickets.filter(ticket => ticket.id !== ticketId);
        localStorage.setItem('tickets', JSON.stringify(tickets));
        renderTickets();
    }
}

function getPriorityText(priority) {
    const priorities = {
        low: '🟢 Низкий',
        medium: '🟡 Средний', 
        high: '🔴 Высокий',
        urgent: '💥 Критический'
    };
    return priorities[priority];
}

function getStatusText(status) {
    const statuses = {
        open: '🟦 Открыта',
        'in-progress': '🟨 В работе',
        resolved: '🟢 Решена'
    };
    return statuses[status];
}

// Загружаем заявки при старте
renderTickets();
