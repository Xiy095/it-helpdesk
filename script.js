const SUPABASE_URL = 'https://wtstat1c-1680w4r.dj3twork3s.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0c3RhdDFjLTE2ODB3NHIuZGozdHdvcmszcyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzI5ODQ2NDU0LCJleHAiOjIwNDU0MjI0NTR9.7W8EQ5jFU9g00fe8rla3a9ec4CFpjQ0fca0a5f9Bc44f5DpgJbPEL3rj5a_ACTnwjd8fkjxVWc_5f43rd'

// Инициализация Supabase
const { createClient } = supabase
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)

// Получение email пользователя
function getUserEmail() {
    let email = localStorage.getItem('userEmail')
    if (!email) {
        email = prompt('Введите ваш email:')
        if (email) {
            localStorage.setItem('userEmail', email)
        }
    }
    return email || 'user@example.com'
}

// Загрузка заявок
async function loadTickets() {
    try {
        const userEmail = getUserEmail()
        const { data, error } = await supabaseClient
            .from('tickets')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false })

        if (error) throw error
        displayTickets(data || [])
    } catch (error) {
        console.error('Ошибка загрузки:', error)
        alert('Ошибка загрузки заявок: ' + error.message)
    }
}

// Создание заявки
async function createTicket(title, description, priority) {
    try {
        const userEmail = getUserEmail()
        const { data, error } = await supabaseClient
            .from('tickets')
            .insert([{
                title: title,
                description: description,
                priority: priority,
                user_email: userEmail,
                status: 'open',
                created_at: new Date().toISOString()
            }])
            .select()

        if (error) throw error
        alert('Заявка создана успешно!')
        loadTickets()
        return data
    } catch (error) {
        console.error('Ошибка создания:', error)
        alert('Ошибка создания заявки: ' + error.message)
    }
}

// Отображение заявок
function displayTickets(tickets) {
    const container = document.getElementById('ticketsContainer')
    
    if (tickets.length === 0) {
        container.innerHTML = '<p>Заявок пока нет</p>'
        return
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
    `).join('')
}

// Вспомогательные функции
function getPriorityText(priority) {
    const priorities = {
        'low': 'Низкий',
        'medium': 'Средний', 
        'high': 'Высокий',
        'urgent': 'Критический'
    }
    return priorities[priority] || priority
}

function getStatusText(status) {
    const statuses = {
        'open': 'Открыта',
        'in_progress': 'В работе',
        'resolved': 'Решена',
        'closed': 'Закрыта'
    }
    return statuses[status] || status
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузка страницы...')
    loadTickets()

    const form = document.getElementById('ticketForm')
    form.addEventListener('submit', async function(e) {
        e.preventDefault()
        
        const title = document.getElementById('title').value
        const description = document.getElementById('description').value
        const priority = document.getElementById('priority').value

        if (!title || !description || !priority) {
            alert('Пожалуйста, заполните все поля')
            return
        }

        await createTicket(title, description, priority)
        form.reset()
    })
})
