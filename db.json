document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const dashboard = document.getElementById('dashboard');
    const technicianDashboard = document.getElementById('technician-dashboard');
    const logoutBtn = document.getElementById('logout-btn');
    const techLogoutBtn = document.getElementById('technician-logout-btn');

    // Função de Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userType = document.getElementById('userType').value;
        const username = document.getElementById('username').value;

        // Esconde o Login
        loginContainer.style.display = 'none';

        // Mostra o dashboard baseado no tipo de usuário
        if (userType === 'admin') {
            document.getElementById('user-display').textContent = username;
            dashboard.style.display = 'block';
        } else if (userType === 'technician') {
            document.getElementById('technician-display').textContent = username;
            technicianDashboard.style.display = 'block';
        }
    });

    // Função de Logout (recarrega a página para limpar o estado)
    const handleLogout = () => {
        window.location.reload();
    };

    logoutBtn.addEventListener('click', handleLogout);
    techLogoutBtn.addEventListener('click', handleLogout);

    // Navegação do Menu (Sidebar)
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove classe active de todos
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

            // Adiciona classe active no clicado
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
});
