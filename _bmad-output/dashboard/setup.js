const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- 🚀 INICIANDO SETUP DO BMAD SENTINEL DASHBOARD ---');

const dashboardDir = __dirname;
const rootDir = path.resolve(dashboardDir, '../..');

try {
    // 1. Instala dependências silenciosamente
    console.log('📦 Instalando dependências (Express, Socket.io, Chokidar)...');
    execSync('npm install', { cwd: dashboardDir, stdio: 'inherit' });

    // 2. Garante que as pastas de output existam para o watcher não falhar
    const folders = [
        path.join(rootDir, '_bmad-output/planning-artifacts'),
        path.join(rootDir, '_bmad-output/implementation-artifacts')
    ];
    
    folders.forEach(f => {
        if (!fs.existsSync(f)) {
            fs.mkdirSync(f, { recursive: true });
            console.log(`📁 Pasta criada: ${path.relative(rootDir, f)}`);
        }
    });

    console.log('\n--- ✅ SETUP CONCLUÍDO COM SUCESSO! ---');
    console.log('\nPara iniciar o dashboard agora e sempre que for trabalhar, use:');
    console.log('👉 npm run bmad:dashboard');
    console.log('\nO dashboard abrirá em: http://localhost:3105');

} catch (error) {
    console.error('❌ Erro no setup:', error.message);
}
