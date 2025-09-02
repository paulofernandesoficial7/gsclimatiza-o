const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.static(__dirname));
app.use(express.json());

// API Simulada
app.get('/api/teams', (req, res) => {
    const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
    res.json(db.teams || []);
});

app.post('/api/login', (req, res) => {
    const { username, password, userType } = req.body;
    const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
    
    const user = db.teams.find(u => u.username === username && u.password === password && u.role === userType);
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false, error: 'Credenciais inválidas' });
    }
});

app.listen(3000, () => {
    console.log('🚀 Servidor rodando na porta 3000');
});
```