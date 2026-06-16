const express = require('express');
const app = express();
const fs = require('fs');

// O servidor lê o arquivo db.json
app.get('/api/dados', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
    res.json(data);
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
