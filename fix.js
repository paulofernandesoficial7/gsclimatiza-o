// fix.js - Correção para path-to-regexp
const { exec } = require('child_process');
exec('npm install path-to-regexp@6.2.0 --save', (error) => {
  if (error) console.error('Erro:', error);
  else console.log('Fix aplicado! Tente novamente.');
});