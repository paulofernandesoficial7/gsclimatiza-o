// app.js - Sistema GS Climatização - Versão Completa e Funcional
console.log('🔧 Sistema GS Climatização carregando...');

// Dados locais
let users = [
    { id: 1, username: 'admin', password: 'admin', role: 'admin', name: 'Administrador' },
    { id: 2, username: 'joao', password: '123', role: 'technician', name: 'João Técnico' },
    { id: 3, username: 'maria', password: '123', role: 'technician', name: 'Maria Técnica' }
];
let services = JSON.parse(localStorage.getItem('gs_services')) || [
    { id: 1, name: 'Instalação de Ar-Condicionado Split', price: 350.00 },
    { id: 2, name: 'Manutenção Preventiva', price: 200.00 },
    { id: 3, name: 'Recarga de Gás R410a', price: 150.00 }
];
let stock = JSON.parse(localStorage.getItem('gs_stock')) || [
    { id: 1, name: 'Gás R410a (1Kg)', quantity: 25, cost: 85.00 },
    { id: 2, name: 'Tubulação de Cobre (15m)', quantity: 15, cost: 120.00 },
    { id: 3, name: 'Suporte para Condensadora', quantity: 50, cost: 30.00 }
];
let teamStock = JSON.parse(localStorage.getItem('gs_team_stock')) || [
    { userId: 2, productId: 1, quantity: 2 },
    { userId: 3, productId: 3, quantity: 5 }
];
let os = JSON.parse(localStorage.getItem('gs_os')) || [
    {
        id: 'OS-001',
        client: 'Pedro Silva',
        address: 'Rua das Flores, 123',
        serviceId: 1,
        technicianId: 2,
        description: 'Instalação de um novo aparelho de 9000 BTUs',
        status: 'aberta',
        productsUsed: [],
        photos: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 'OS-002',
        client: 'Ana Santos',
        address: 'Av. Paulista, 500',
        serviceId: 2,
        technicianId: 3,
        description: 'Limpeza e manutenção de 2 aparelhos',
        status: 'andamento',
        productsUsed: [{ productId: 1, quantity: 0.5 }],
        photos: [],
        createdAt: new Date().toISOString()
    }
];
let loggedInUser = null;
let currentOS = null;

// ===== FUNÇÕES PRINCIPAIS =====
function saveData() {
    localStorage.setItem('gs_services', JSON.stringify(services));
    localStorage.setItem('gs_stock', JSON.stringify(stock));
    localStorage.setItem('gs_team_stock', JSON.stringify(teamStock));
    localStorage.setItem('gs_os', JSON.stringify(os));
    console.log('💾 Dados salvos');
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

function logout() {
    console.log('🚪 Saindo...');
    loggedInUser = null;
    sessionStorage.removeItem('loggedInUser');
    
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('technician-dashboard').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('login-form').reset();
    
    alert('Logout realizado com sucesso!');
}

function renderDashboard() {
    console.log('📊 Entrando no dashboard...');
    
    document.getElementById('login-container').style.display = 'none';
    
    if (loggedInUser.role === 'admin') {
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('technician-dashboard').style.display = 'none';
        document.getElementById('user-display').textContent = loggedInUser.name;
        renderAdminDashboard();
    } else {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('technician-dashboard').style.display = 'block';
        document.getElementById('technician-display').textContent = loggedInUser.name;
        renderTechnicianDashboard();
    }
}

function renderAdminDashboard() {
    console.log('🛠️ Dashboard admin');
    renderTeamsTable();
    renderOSList();
    renderServicesTable();
    renderStockTable();
    setupAdminEventListeners();
}

function renderTechnicianDashboard() {
    console.log('🔧 Dashboard técnico');
    renderTechnicianOSList();
    setupTechnicianEventListeners();
}

// ===== FUNÇÃO DE LOGIN =====
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    console.log('Tentando login:', username, password, userType);

    // Verificação local
    const user = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === userType
    );

    if (user) {
        loggedInUser = user;
        sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        renderDashboard();
        alert('Login realizado com sucesso!');
    } else {
        alert('Usuário/senha incorretos ou tipo de usuário inválido!');
    }
}

// ===== FUNÇÕES PARA EQUIPES =====
function renderTeamsTable() {
    const tableBody = document.getElementById('teams-table').querySelector('tbody');
    if (!tableBody) {
        console.log('Tabela de equipes não encontrada');
        return;
    }
    
    tableBody.innerHTML = '';
    users.filter(u => u.role === 'technician').forEach(u => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>Técnico</td>
            <td>${u.username}</td>
            <td>${teamStock.filter(ts => ts.userId == u.id).length} itens</td>
            <td>
                <button class="btn btn-warning btn-sm me-2" onclick="editTeamMember(${u.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteTeamMember(${u.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addTeamMember(e) {
    e.preventDefault();
    const name = document.getElementById('team-name').value;
    const username = document.getElementById('team-username').value;
    const password = document.getElementById('team-password').value;
    
    if (!name || !username || !password) {
        alert('Preencha todos os campos!');
        return;
    }
    
    // Verificar se usuário já existe
    if (users.find(u => u.username === username)) {
        alert('Usuário já existe!');
        return;
    }
    
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
        id: newId,
        name,
        username,
        password,
        role: 'technician'
    };
    
    users.push(newUser);
    renderTeamsTable();
    closeModal('team-modal');
    alert('Técnico adicionado com sucesso!');
}

function editTeamMember(id) {
    const member = users.find(u => u.id === id);
    if (!member) return;
    
    document.getElementById('team-modal-title').textContent = 'Editar Técnico';
    document.getElementById('team-id').value = member.id;
    document.getElementById('team-name').value = member.name;
    document.getElementById('team-username').value = member.username;
    document.getElementById('team-password').value = '';
    
    openModal('team-modal');
}

function deleteTeamMember(id) {
    if (confirm('Tem certeza que deseja excluir este técnico?')) {
        users = users.filter(u => u.id !== id);
        renderTeamsTable();
        alert('Técnico excluído com sucesso!');
    }
}

// ===== FUNÇÕES PARA OS =====
function renderOSList(filter = 'todos') {
    const osList = document.getElementById('os-list');
    if (!osList) return;
    
    osList.innerHTML = '';
    const filteredOS = filter === 'todos' ? os : os.filter(o => o.status === filter);
    
    if (filteredOS.length === 0) {
        osList.innerHTML = '<p class="text-center text-muted">Nenhuma OS encontrada</p>';
        return;
    }
    
    filteredOS.forEach(o => {
        const technicianName = getTechnicianName(o.technicianId);
        const serviceName = getServiceName(o.serviceId);
        
        const card = document.createElement('div');
        card.className = `os-card ${o.status}`;
        card.innerHTML = `
            <div class="os-header">
                <span class="os-id">${o.id}</span>
                <span class="os-status status-${o.status}">${o.status.toUpperCase()}</span>
            </div>
            <div class="os-info">
                <div class="os-info-item"><i class="fas fa-user"></i> <strong>Cliente:</strong> ${o.client}</div>
                <div class="os-info-item"><i class="fas fa-map-marker-alt"></i> <strong>Endereço:</strong> ${o.address}</div>
                <div class="os-info-item"><i class="fas fa-tools"></i> <strong>Serviço:</strong> ${serviceName}</div>
                <div class="os-info-item"><i class="fas fa-user-tie"></i> <strong>Técnico:</strong> ${technicianName}</div>
            </div>
            <div class="os-actions">
                <button class="btn btn-info btn-sm" onclick="editOS('${o.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteOS('${o.id}')">
                    <i class="fas fa-trash-alt"></i> Excluir
                </button>
            </div>
        `;
        osList.appendChild(card);
    });
}

function addOS(e) {
    e.preventDefault();
    const client = document.getElementById('os-client').value;
    const address = document.getElementById('os-address').value;
    const serviceId = parseInt(document.getElementById('os-service').value);
    const technicianId = parseInt(document.getElementById('os-technician').value);
    const description = document.getElementById('os-description').value;
    const status = document.getElementById('os-status').value;
    
    const newId = `OS-${String(os.length + 1).padStart(3, '0')}`;
    const newOS = {
        id: newId,
        client,
        address,
        serviceId,
        technicianId,
        description,
        status,
        productsUsed: [],
        photos: [],
        createdAt: new Date().toISOString()
    };
    
    os.push(newOS);
    saveData();
    renderOSList();
    closeModal('os-modal');
    alert('OS criada com sucesso!');
}

function editOS(id) {
    const osToEdit = os.find(o => o.id === id);
    if (!osToEdit) return;
    
    document.getElementById('os-modal-title').textContent = 'Editar OS';
    document.getElementById('os-id').value = osToEdit.id;
    document.getElementById('os-client').value = osToEdit.client;
    document.getElementById('os-address').value = osToEdit.address;
    document.getElementById('os-description').value = osToEdit.description;
    document.getElementById('os-status').value = osToEdit.status;
    
    loadTechnicians(osToEdit.technicianId);
    loadServices(osToEdit.serviceId);
    openModal('os-modal');
}

function deleteOS(id) {
    if (confirm('Tem certeza que deseja excluir esta OS?')) {
        os = os.filter(o => o.id !== id);
        saveData();
        renderOSList();
        alert('OS excluída com sucesso!');
    }
}

// ===== FUNÇÕES PARA SERVIÇOS =====
function renderServicesTable() {
    const tableBody = document.getElementById('services-table').querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    services.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>R$ ${s.price.toFixed(2)}</td>
            <td>
                <button class="btn btn-warning btn-sm me-2" onclick="editService(${s.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteService(${s.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addService(e) {
    e.preventDefault();
    const name = document.getElementById('service-name').value;
    const price = parseFloat(document.getElementById('service-price').value);
    
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    services.push({ id: newId, name, price });
    
    saveData();
    renderServicesTable();
    closeModal('service-modal');
    alert('Serviço adicionado com sucesso!');
}

function editService(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    document.getElementById('service-modal-title').textContent = 'Editar Serviço';
    document.getElementById('service-id').value = service.id;
    document.getElementById('service-name').value = service.name;
    document.getElementById('service-price').value = service.price;
    
    openModal('service-modal');
}

function deleteService(id) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        services = services.filter(s => s.id !== id);
        saveData();
        renderServicesTable();
        alert('Serviço excluído com sucesso!');
    }
}

// ===== FUNÇÕES PARA ESTOQUE =====
function renderStockTable() {
    const tableBody = document.getElementById('stock-table').querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    stock.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>R$ ${item.cost.toFixed(2)}</td>
            <td>R$ ${(item.quantity * item.cost).toFixed(2)}</td>
            <td>
                <button class="btn btn-warning btn-sm me-2" onclick="editStock(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteStock(${item.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addStock(e) {
    e.preventDefault();
    const name = document.getElementById('stock-name').value;
    const quantity = parseInt(document.getElementById('stock-quantity').value);
    const cost = parseFloat(document.getElementById('stock-cost').value);
    
    const newId = stock.length > 0 ? Math.max(...stock.map(s => s.id)) + 1 : 1;
    stock.push({ id: newId, name, quantity, cost });
    
    saveData();
    renderStockTable();
    closeModal('stock-modal');
    alert('Item adicionado ao estoque!');
}

function editStock(id) {
    const item = stock.find(s => s.id === id);
    if (!item) return;
    
    document.getElementById('stock-modal-title').textContent = 'Editar Estoque';
    document.getElementById('stock-id').value = item.id;
    document.getElementById('stock-name').value = item.name;
    document.getElementById('stock-quantity').value = item.quantity;
    document.getElementById('stock-cost').value = item.cost;
    
    openModal('stock-modal');
}

function deleteStock(id) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        stock = stock.filter(s => s.id !== id);
        saveData();
        renderStockTable();
        alert('Item excluído do estoque!');
    }
}

// ===== FUNÇÕES DO TÉCNICO =====
function renderTechnicianOSList(filter = 'todos') {
    const osList = document.getElementById('technician-os-list');
    if (!osList) return;
    
    osList.innerHTML = '';
    const myOS = os.filter(o => o.technicianId === loggedInUser.id);
    const filteredOS = filter === 'todos' ? myOS : myOS.filter(o => o.status === filter);
    
    if (filteredOS.length === 0) {
        osList.innerHTML = '<p class="text-center text-muted">Nenhuma OS encontrada</p>';
        return;
    }
    
    filteredOS.forEach(o => {
        const serviceName = getServiceName(o.serviceId);
        const card = document.createElement('div');
        card.className = `os-card technician-view ${o.status}`;
        card.innerHTML = `
            <div class="os-header">
                <span class="os-id">${o.id}</span>
                <span class="os-status status-${o.status}">${o.status.toUpperCase()}</span>
            </div>
            <div class="os-info">
                <div class="os-info-item"><i class="fas fa-user"></i> <strong>Cliente:</strong> ${o.client}</div>
                <div class="os-info-item"><i class="fas fa-map-marker-alt"></i> <strong>Endereço:</strong> ${o.address}</div>
                <div class="os-info-item"><i class="fas fa-tools"></i> <strong>Serviço:</strong> ${serviceName}</div>
            </div>
            <div class="os-actions">
                <button class="btn btn-primary btn-sm" onclick="viewTechnicianOS('${o.id}')">
                    <i class="fas fa-eye"></i> Visualizar
                </button>
            </div>
        `;
        osList.appendChild(card);
    });
}

function viewTechnicianOS(osId) {
    currentOS = os.find(o => o.id === osId);
    if (!currentOS) return;
    
    document.getElementById('technician-os-modal-title').textContent = `OS ${currentOS.id}`;
    document.getElementById('technician-os-id').textContent = currentOS.id;
    document.getElementById('t-os-client').textContent = currentOS.client;
    document.getElementById('t-os-address').textContent = currentOS.address;
    document.getElementById('t-os-service').textContent = getServiceName(currentOS.serviceId);
    document.getElementById('t-os-description').textContent = currentOS.description;
    
    openModal('technician-os-modal');
}

// ===== FUNÇÕES UTILITÁRIAS =====
function getTechnicianName(id) {
    const technician = users.find(u => u.id === id && u.role === 'technician');
    return technician ? technician.name : 'Não Atribuído';
}

function getServiceName(id) {
    const service = services.find(s => s.id === id);
    return service ? service.name : 'Serviço Desconhecido';
}

function loadTechnicians(selectedId = null) {
    const select = document.getElementById('os-technician');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione o Técnico</option>';
    const technicians = users.filter(u => u.role === 'technician');
    
    technicians.forEach(tech => {
        const option = document.createElement('option');
        option.value = tech.id;
        option.textContent = tech.name;
        if (selectedId && tech.id === selectedId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function loadServices(selectedId = null) {
    const select = document.getElementById('os-service');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione o Serviço</option>';
    
    services.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `${s.name} - R$ ${s.price.toFixed(2)}`;
        if (selectedId && s.id === selectedId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
function setupAdminEventListeners() {
    // Formulários
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', addService);
    }
    
    const stockForm = document.getElementById('stock-form');
    if (stockForm) {
        stockForm.addEventListener('submit', addStock);
    }
    
    const teamForm = document.getElementById('team-form');
    if (teamForm) {
        teamForm.addEventListener('submit', addTeamMember);
    }
    
    const osForm = document.getElementById('os-form');
    if (osForm) {
        osForm.addEventListener('submit', addOS);
    }
    
    // Botões de adicionar
    const addServiceBtn = document.getElementById('add-service-btn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            document.getElementById('service-form').reset();
            document.getElementById('service-id').value = '';
            document.getElementById('service-modal-title').textContent = 'Novo Serviço';
            openModal('service-modal');
        });
    }
    
    const addStockBtn = document.getElementById('add-stock-btn');
    if (addStockBtn) {
        addStockBtn.addEventListener('click', () => {
            document.getElementById('stock-form').reset();
            document.getElementById('stock-id').value = '';
            document.getElementById('stock-modal-title').textContent = 'Novo Item';
            openModal('stock-modal');
        });
    }
    
    const addTeamBtn = document.getElementById('add-team-btn');
    if (addTeamBtn) {
        addTeamBtn.addEventListener('click', () => {
            document.getElementById('team-form').reset();
            document.getElementById('team-id').value = '';
            document.getElementById('team-modal-title').textContent = 'Novo Técnico';
            openModal('team-modal');
        });
    }
    
    const addOSBtn = document.getElementById('add-os-btn');
    if (addOSBtn) {
        addOSBtn.addEventListener('click', () => {
            document.getElementById('os-form').reset();
            document.getElementById('os-id').value = '';
            document.getElementById('os-modal-title').textContent = 'Nova OS';
            loadTechnicians();
            loadServices();
            openModal('os-modal');
        });
    }
}

function setupTechnicianEventListeners() {
    // Implementar eventos específicos do técnico se necessário
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema carregado');
    
    // Evento de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Eventos de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const techLogoutBtn = document.getElementById('technician-logout-btn');
    if (techLogoutBtn) {
        techLogoutBtn.addEventListener('click', logout);
    }
    
    // Menu lateral
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar-link').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            document.getElementById(this.dataset.section).classList.add('active');
            
            // Recarregar dados da seção
            if (this.dataset.section === 'gerenciar-os') renderOSList();
            if (this.dataset.section === 'gerenciar-servicos') renderServicesTable();
            if (this.dataset.section === 'gerenciar-estoque') renderStockTable();
            if (this.dataset.section === 'gerenciar-equipes') renderTeamsTable();
        });
    });
    
    // Filtros
    document.querySelectorAll('.filter-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            
            if (document.getElementById('os-list')) renderOSList(filter);
            if (document.getElementById('technician-os-list')) renderTechnicianOSList(filter);
        });
    });
    
    // Fechar modais
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.dataset.modal;
            closeModal(modalId);
        });
    });
    
    // Verificar login
    const savedUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (savedUser) {
        loggedInUser = savedUser;
        renderDashboard();
    }
});