const bcrypt = require('bcrypt');

async function generateHashes() {
  try {
    console.log('Gerando hashes de senha...');
    
    // Hash para senha "123" (usuários joao e maria)
    const hash123 = await bcrypt.hash('123', 10);
    console.log('Senha "123":', hash123);
    
    // Hash para senha "admin" (usuário admin)
    const hashAdmin = await bcrypt.hash('admin', 10);
    console.log('Senha "admin":', hashAdmin);
    
    console.log('\nCopie esses hashes para o arquivo db.json');
  } catch (error) {
    console.error('Erro ao gerar hashes:', error);
  }
}

generateHashes();