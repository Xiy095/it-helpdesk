const SUPABASE_URL = 'https://wtstat1c-1680w4r.dj3twork3s.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0c3RhdDFjLTE2ODB3NHIuZGozdHdvcmszcyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzI5ODQ2NDU0LCJleHAiOjIwNDU0MjI0NTR9.7W8EQ5jFU9g00fe8rla3a9ec4CFpjQ0fca0a5f9Bc44f5DpgJbPEL3rj5a_ACTnwjd8fkjxVWc_5f43rd'

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

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

async function loadTickets() {
    try {
        const userEmail = getUserEmail()
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false })

        if (error) throw error
        displayTickets(data || [])
    } catch (error) {
        console.error('Ошибка загрузки:', error)
        alert('Ошибка загрузки заявок')
    }
}

async function createTicket(title, description, priority) {
    try {
        const userEmail = getUserEmail()
        const { data, error } = await supabase
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
        alert('Заявка создана!')
        loadTickets()
    } catch (error) {
        console.error('Ошибка создания:', error)
        alert('Ошибка создания заявки')
    }
}

function displayTickets(tickets) {
    const container = document.getElementById('ticketsContainer')
    if (tickets.length === 0) {
        container.innerHTML = '<p>Заявок нет</p>'
        return
    }

    container.innerHTML = tickets.map(ticket => `
        <div class="ticket-item ${ticket.priority}">
            <h3>${ticket.title}</h3>
            <p>${ticket.description}</p>
            <div class="ticket-meta">
                <span class="priority ${ticket.priority}">${getPriorityText(ticket.priority)}</span>
                <span class="status">${ticket.status}</span>
                <span class="date">${new Date(ticket.created_at).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('')
}

function getPriorityText(priority) {
    const texts = {
        'low': 'Низкий',
        'medium': 'Средний', 
        'high': 'Высокий',
        'urgent': 'Критический'
    }
    return texts[priority] || priority
}

document.addEventListener('DOMContentLoaded', function() {
    loadTickets()
    
    document.getElementById('ticketForm').addEventListener('submit', async function(e) {
        e.preventDefault()
        const title = document.getElementById('title').value
        const description = document.getElementById('description').value
        const priority = document.getElementById('priority').value

        if (!title || !description || !priority) {
            alert('Заполните все поля')
            return
        }

        await createTicket(title, description, priority)
        this.reset()
    })
})
