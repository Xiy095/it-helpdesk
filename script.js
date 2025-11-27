// Инициализация Supabase
const supabaseUrl = 'https://jsj@appf.gijtsverix.supabase.co';
const supabaseKey = 'ey3hb6c101J7UzI1N1IsInR5ccT6TkpXVCJ9, ey3pc3H1012zdX8hYmFZZSIsInJlZ11GTrf';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Создание заявки
document.getElementById('ticketForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('priority').value;
    
    // Создаем заявку в Supabase
    const { data, error } = await supabase
        .from('tickets')
        .insert([
            {
                title: title,
                description: description,
                priority: priority,
                status: 'open',
                user_email: 'user@example.com' // временно
            }
        ])
        .select();
    
    if (error) {
        alert('Ошибка: ' + error.message);
    } else {
        alert('✅ Заявка создана в базе данных!');
        renderTickets();
        this.reset();
    }
});

// Загрузка и отображение заявок
async function renderTickets() {
    const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Ошибка:', error);
        return;
    }
    
    const container = document.getElementById('ticketsContainer');
    
    if (!tickets || tickets.length === 0) {
        container.innerHTML = '<p>Заявок пока нет</p>';
        return;
    }
    
    container.innerHTML = tickets.map(ticket => `
        <div class="ticket ${ticket.priority}">
            <h3>${ticket.title}</h3>
            <div class="ticket-meta">
                🔥 Приоритет: ${getPriorityText(ticket.priority)} | 
                📊 Статус: <span class="ticket-status status-${ticket.status}">${getStatusText(ticket.status)}</span> |
                📅 Создана: ${new Date(ticket.created_at).toLocaleString('ru-RU')}
            </div>
            <p>${ticket.description}</p>
            <button onclick="changeStatus(${ticket.id}, 'in-progress')">В работу</button>
            <button onclick="changeStatus(${ticket.id}, 'resolved')">Решено</button>
            <button onclick="deleteTicket('${ticket.id}')" class="delete-btn">Удалить</button>
        </div>
    `).join('');
}

// Смена статуса
async function changeStatus(ticketId, newStatus) {
    const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);
    
    if (error) {
        alert('Ошибка: ' + error.message);
    } else {
        renderTickets();
    }
}

// Удаление заявки
async function deleteTicket(ticketId) {
    if (confirm('Удалить заявку?')) {
        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', ticketId);
        
        if (error) {
            alert('Ошибка: ' + error.message);
        } else {
            renderTickets();
        }
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
