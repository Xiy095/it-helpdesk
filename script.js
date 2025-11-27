const supabaseUrl = 'https://jsj@appf.gijtsverix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NIIsinR5cCl6ikpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSlsInJIZil61mpwamdicXBwZmdpamp0b2V3aWx4Ilwicm9sZSl6ImFub24ILCJpYXQIOjE3NjQxNDEwOTAsImV4cCl6MjA3OTcxNzA5MH0.64IQIHgjbGTE_IfjBm_NCIthxjdGBlyLVWv_S619Ld4';

// Загружаем Supabase библиотеку динамически
async function initSupabase() {
    // Загружаем библиотеку
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    
    // Создаем клиент
    window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase инициализирован');
    
    // Загружаем заявки
    renderTickets();
}

// Создание заявки
async function setupEventListeners() {
    document.getElementById('ticketForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;
        
        // Создаем заявку в Supabase
        const { data, error } = await window.supabase
            .from('tickets')
            .insert([
                {
                    title: title,
                    description: description,
                    priority: priority,
                    status: 'open',
                    user_email: 'user@example.com'
                }
            ])
            .select();
        
        if (error) {
            alert('Ошибка: ' + error.message);
            console.error('Supabase error:', error);
        } else {
            alert('✅ Заявка создана в базе данных!');
            renderTickets();
            this.reset();
        }
    });
}

// Загрузка и отображение заявок
async function renderTickets() {
    try {
        const { data: tickets, error } = await window.supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Ошибка загрузки:', error);
            document.getElementById('ticketsContainer').innerHTML = '<p>Ошибка загрузки заявок</p>';
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
                <button onclick="changeStatus('${ticket.id}', 'in-progress')">В работу</button>
                <button onclick="changeStatus('${ticket.id}', 'resolved')">Решено</button>
                <button onclick="deleteTicket('${ticket.id}')" class="delete-btn">Удалить</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

// Смена статуса
async function changeStatus(ticketId, newStatus) {
    const { error } = await window.supabase
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
        const { error } = await window.supabase
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

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initSupabase().then(() => {
        setupEventListeners();
    });
});
