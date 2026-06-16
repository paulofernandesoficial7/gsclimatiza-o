const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
// Isso serve seus arquivos (index.html, app.js, style.css) automaticamente
app.use(express.static(__dirname));

// Rota de exemplo para listar dados do db.json
app.get('/api/dados', (req, res) => {
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
    res.json(data);
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
