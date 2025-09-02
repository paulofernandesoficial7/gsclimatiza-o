const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

app.use(express.static(__dirname));
app.use(express.json());

// Habilitar CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// Rotas da API
app.get('/api/teams', (req, res) => {
    try {
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
        res.json(db.teams || []);
    } catch (error) {
        console.error('Erro ao ler db.json:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/teams', async (req, res) => {
    try {
        const { name, username, password, role } = req.body;
        
        if (!name || !username || !password || !role) {
            return res.status(400).json({ success: false, error: 'Dados incompletos' });
        }
        
        const dbPath = path.join(__dirname, 'db.json');
        const dbData = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(dbData);
        
        // Verificar se username já existe
        const userExists = db.teams.find(u => u.username === username);
        if (userExists) {
            return res.json({ success: false, error: 'Username já existe' });
        }
        
        // Gerar novo ID
        const newId = db.teams.length > 0 ? Math.max(...db.teams.map(u => parseInt(u.id))) + 1 : 1;
        
        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Adicionar novo usuário
        const newUser = {
            id: newId.toString(),
            name,
            username,
            password: hashedPassword,
            role
        };
        
        db.teams.push(newUser);
        
        // Salvar no db.json
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        
        res.json({ success: true, user: newUser });
        
    } catch (error) {
        console.error('Erro ao adicionar membro:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password, userType } = req.body;
        
        console.log('Tentativa de login:', { username, userType });
        
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
        
        // Encontrar o usuário
        const user = db.teams.find(u => u.username === username && u.role === userType);
        
        if (!user) {
            console.log('Usuário não encontrado:', username, 'tipo:', userType);
            return res.json({ success: false, error: 'Credenciais inválidas' });
        }
        
        console.log('Usuário encontrado:', user.username);
        
        // Verificar a senha
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (passwordMatch) {
            console.log('Login bem-sucedido para:', username);
            
            // Retornar dados do usuário (sem a senha)
            const userData = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            };
            
            res.json({ success: true, user: userData });
        } else {
            console.log('Senha incorreta para:', username);
            res.json({ success: false, error: 'Credenciais inválidas' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
});

app.listen(3000, () => {
    console.log('🚀 Servidor rodando na porta 3000');
});