// script.js
const SUPABASE_CONFIG = {
    url: 'https://wtstat1c-1680w4r.dj3twork3s.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0c3RhdDFjLTE2ODB3NHIuZGozdHdvcmszcyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzI5ODQ2NDU0LCJleHAiOjIwNDU0MjI0NTR9.7W8EQ5jFU9g00fe8rla3a9ec4CFpjQ0fca0a5f9Bc44f5DpgJbPEL3rj5a_ACTnwjd8fkjxVWc_5f43rd'
};

let supabaseClient = null;

// === ВСТАВЬТЕ ЭТОТ КОД СЮДА ===
// Получение email пользователя
function getUserEmail() {
    let email = localStorage.getItem('userEmail');
    if (!email) {
        email = prompt('Пожалуйста, введите ваш email:');
        if (email) {
            localStorage.setItem('userEmail', email);
        }
    }
    return email || 'unknown@example.com';
}
// === КОНЕЦ ВСТАВКИ ===

// Инициализация Supabase
async function initializeSupabase() {
    try {
        console.log('Initializing...');
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        console.log('Supabase ready:', !!supabaseClient);
        return supabaseClient;
    } catch (error) {
        console.error('Supabase initialization error:', error);
        throw error;
    }
}

// Загрузка заявок
async function loadTickets() {
    if (!supabaseClient) {
        await initializeSupabase();
    }

    try {
        console.log('Loading tickets...');
        const userEmail = getUserEmail(); // Теперь эта функция работает
        
        const { data, error } = await supabaseClient
            .from('tickets')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        displayTickets(data || []);
    } catch (error) {
        console.error('Error loading tickets:', error);
        alert('Ошибка загрузки заявок: ' + error.message);
    }
}

// Создание заявки
async function createTicket(title, description, priority) {
    if (!supabaseClient) {
        await initializeSupabase();
    }

    try {
        const userEmail = getUserEmail(); // И здесь тоже
        
        const { data, error } = await supabaseClient
            .from('tickets')
            .insert([
                {
                    title: title,
                    description: description,
                    priority: priority,
                    user_email: userEmail,
                    status: 'open',
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;
        
        alert('Заявка создана успешно!');
        loadTickets();
        return data;
    } catch (error) {
        console.error('Error creating ticket:', error);
        alert('Ошибка создания заявки: ' + error.message);
    }
}

// Остальной код без изменений...
function displayTickets(tickets) {
    const container = document.getElementById('ticketsContainer');
    
    if (tickets.length === 0) {
        container.innerHTML = '<p>Заявок пока нет</p>';
        return;
    }

    container.innerHTML = tickets.map(ticket => `
        <div class="ticket-item ${ticket.priority}">
            <h3>${ticket.title}</h3>
            <p>${ticket.description}</p>
            <div class="ticket-meta">
                <span class="priority ${ticket.priority}">${getPriorityText(ticket.priority)}</span>
                <span class="status ${ticket.status}">${getStatusText(ticket.status)}</span>
                <span class="email">${ticket.user_email}</span>
                <span class="date">${new Date(ticket.created_at).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

function getPriorityText(priority) {
    const priorities = {
        'low': 'Низкий', 'medium': 'Средний', 'high': 'Высокий', 'urgent': 'Критический'
    };
    return priorities[priority] || priority;
}

function getStatusText(status) {
    const statuses = {
        'open': 'Открыта', 'in_progress': 'В работе', 'resolved': 'Решена', 'closed': 'Закрыта'
    };
    return statuses[status] || status;
}

document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase().then(() => {
        loadTickets();
    });

    const form = document.getElementById('ticketForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;

        if (!title || !description || !priority) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        await createTicket(title, description, priority);
        form.reset();
    });
});
