// script.js
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwamdicXBwZmdpamp0b2V3aWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDEwOTAsImV4cCI6MjA3OTcxNzA5MH0.64IOlH8jbG1E_1fjBm_NCIthxjdGBIylVWv_S6i9Ld4'
};

let supabaseClient = null;

// Инициализация Supabase
async function initializeSupabase() {
    try {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        console.log('Supabase initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        throw error;
    }
}

// Загрузка заявок
async function loadTickets() {
    if (!supabaseClient) {
        await initializeSupabase();
    }

    try {
        const { data, error } = await supabaseClient
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        displayTickets(data || []);
    } catch (error) {
        console.error('Error loading tickets:', error);
        alert('Ошибка загрузки заявок');
    }
}

// Создание заявки
async function createTicket(title, description, priority) {
    if (!supabaseClient) {
        await initializeSupabase();
    }

    try {
        const { data, error } = await supabaseClient
            .from('tickets')
            .insert([
                {
                    title: title,
                    description: description,
                    priority: priority,
                    status: 'open',
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;
        
        alert('Заявка создана успешно!');
        loadTickets(); // Обновляем список
        return data;
    } catch (error) {
        console.error('Error creating ticket:', error);
        alert('Ошибка создания заявки');
    }
}

// Отображение заявок
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
                <span class="date">${new Date(ticket.created_at).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// Вспомогательные функции
function getPriorityText(priority) {
    const priorities = {
        'low': 'Низкий',
        'medium': 'Средний', 
        'high': 'Высокий',
        'urgent': 'Критический'
    };
    return priorities[priority] || priority;
}

function getStatusText(status) {
    const statuses = {
        'open': 'Открыта',
        'in_progress': 'В работе',
        'resolved': 'Решена',
        'closed': 'Закрыта'
    };
    return statuses[status] || status;
}

// Обработчик формы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем Supabase при загрузке страницы
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
        form.reset(); // Очищаем форму
    });
});
