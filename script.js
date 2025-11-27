// Конфигурация Supabase
const SUPABASE_CONFIG = {
    url: 'https://jsj@appf.gijtsverix.supabase.co',
    key: 'eyJhbGciOiJIUzI1NIIsinR5cCl6ikpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSlsInJIZil61mpwamdicXBwZmdpamp0b2V3aWx4Ilwicm9sZSl6ImFub24ILCJpYXQIOjE3NjQxNDEwOTAsImV4cCl6MjA3OTcxNzA5MH0.64IQIHgjbGTE_IfjBm_NCIthxjdGBlyLVWv_S619Ld4'
};

let supabaseClient = null;

// Инициализация Supabase
async function initSupabase() {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        return;
    }
    
    // Ждем загрузки библиотеки
    await new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            console.log('Supabase loaded');
            supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Создание заявки
async function handleTicketSubmit(e) {
    e.preventDefault();
    
    if (!supabaseClient) {
        alert('Система не готова. Подождите...');
        return;
    }
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('priority').value;
    
    try {
        const { data, error } = await supabaseClient
            .from('tickets')
            .insert([{ title, description, priority, status: 'open', user_email: 'user@example.com' }])
            .select();
        
        if (error) throw error;
        
        alert('✅ Заявка создана!');
        await renderTickets();
        e.target.reset();
    } catch (error) {
        alert('Ошибка: ' + error.message);
        console.error('Supabase error:', error);
    }
}

// Загрузка заявок
async function renderTickets() {
    if (!supabaseClient) return;
    
    try {
        const { data: tickets, error } = await supabaseClient
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const container = document.getElementById('ticketsContainer');
        container.innerHTML = tickets && tickets.length > 0 
            ? tickets.map(ticket => `
                <div class="ticket ${ticket.priority}">
                    <h3>${ticket.title}</h3>
                    <div class="ticket-meta">
                        Приоритет: ${getPriorityText(ticket.priority)} | 
                        Статус: <span class="ticket-status status-${ticket.status}">${getStatusText(ticket.status)}</span> |
                        Создана: ${new Date(ticket.created_at).toLocaleString('ru-RU')}
                    </div>
                    <p>${ticket.description}</p>
                    <button onclick="changeStatus('${ticket.id}', 'in-progress')">В работу</button>
                    <button onclick="changeStatus('${ticket.id}', 'resolved')">Решено</button>
                    <button onclick="deleteTicket('${ticket.id}')" class="delete-btn">Удалить</button>
                </div>
            `).join('')
            : '<p>Заявок пока нет</p>';
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('ticketsContainer').innerHTML = '<p>Ошибка загрузки заявок</p>';
    }
}

// Смена статуса
async function changeStatus(ticketId, newStatus) {
    if (!supabaseClient) return;
    
    try {
        const { error } = await supabaseClient
            .from('tickets')
            .update({ status: newStatus })
            .eq('id', ticketId);
        
        if (error) throw error;
        await renderTickets();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// Удаление заявки
async function deleteTicket(ticketId) {
    if (!supabaseClient || !confirm('Удалить заявку?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('tickets')
            .delete()
            .eq('id', ticketId);
        
        if (error) throw error;
        await renderTickets();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// Вспомогательные функции
function getPriorityText(priority) {
    const priorities = { low: 'Низкий', medium: 'Средний', high: 'Высокий', urgent: 'Критический' };
    return priorities[priority] || priority;
}

function getStatusText(status) {
    const statuses = { open: 'Открыта', 'in-progress': 'В работе', resolved: 'Решена' };
    return statuses[status] || status;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing...');
    await initSupabase();
    console.log('Supabase ready:', !!supabaseClient);
    
    document.getElementById('ticketForm').addEventListener('submit', handleTicketSubmit);
    await renderTickets();
});
