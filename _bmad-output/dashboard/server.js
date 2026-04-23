const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Estado atual de cada agente (persiste para clientes que conectam depois)
const agentCurrentState = {};

const PORT = 3105;
const OUTPUT_DIR = path.resolve(__dirname, '..');
const LOG_FILE = path.join(__dirname, 'activity.log');

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Mapeamento de aliases BMAD → nome do agente no dashboard
const agentAliases = {
    'bmad-agent-architect': 'Winston',
    'bmad-agent-pm': 'John',
    'bmad-agent-analyst': 'Mary',
    'bmad-agent-ux-designer': 'Sally',
    'bmad-agent-dev': 'Amelia',
    'bmad-agent-qa': 'Quinn',
    'bmad-agent-sm': 'Bob',
    'bmad-agent-tech-writer': 'Paige',
    'bmad-agent-quick-flow-solo-dev': 'Barry',
    // Aliases curtos também
    'architect': 'Winston',
    'pm': 'John',
    'analyst': 'Mary',
    'designer': 'Sally',
    'dev': 'Amelia',
    'qa': 'Quinn',
    'sm': 'Bob',
    'writer': 'Paige',
    'barry': 'Barry'
};

function resolveAgent(name) {
    if (!name) return null;
    const lower = name.toLowerCase();
    return agentAliases[lower] ||
           agentAliases[name] ||
           // Capitaliza a primeira letra como fallback
           name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function logActivity(agent, status, message) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] Agente: ${agent} | Status: ${status} | Msg: ${message || '-'}\n`;
    fs.appendFile(LOG_FILE, line, (err) => { if (err) console.error('Erro ao gravar log:', err); });
}

// Mapeamento de aliases de status (novos → internos)
const statusAliases = {
    'active': 'working',
    'working': 'working',
    'waiting': 'waiting',
    'inactive': 'done',
    'done': 'done'
};

function resolveStatus(raw) {
    return statusAliases[(raw || '').toLowerCase()] || 'working';
}

// POST /agent - endpoint principal para agentes se comunicarem
// Body: { agent, status, message }
// status: 'working'|'waiting'|'done' ou 'active'|'waiting'|'inactive'
app.post('/agent', (req, res) => {
    const { agent: rawAgent, status = 'working', message } = req.body;
    const agent = resolveAgent(rawAgent);

    if (!agent) return res.status(400).json({ error: 'Nome do agente não fornecido.' });

    const resolvedStatus = resolveStatus(status);

    io.emit('agent-activity', { agent, status: resolvedStatus, message });
    if (resolvedStatus === 'done') {
        delete agentCurrentState[agent];
    } else {
        agentCurrentState[agent] = { status: resolvedStatus, message };
    }
    logActivity(agent, resolvedStatus, message);
    console.log(`[${resolvedStatus.toUpperCase()}] ${agent}: ${message || '(sem mensagem)'}`);
    res.json({ ok: true, agent, status: resolvedStatus });
});

// GET /active - compatibilidade com chamadas anteriores (curl simples)
// ?agent=Nome&message=Msg&status=working|waiting|done
app.get('/active', (req, res) => {
    const agent = resolveAgent(req.query.agent);
    const message = req.query.message;
    const status = req.query.status || 'working';

    if (!agent) return res.status(400).send('Nome do agente não fornecido.');

    const resolvedStatus = resolveStatus(status);

    io.emit('agent-activity', { agent, status: resolvedStatus, message });
    if (resolvedStatus === 'done') {
        delete agentCurrentState[agent];
    } else {
        agentCurrentState[agent] = { status: resolvedStatus, message };
    }
    logActivity(agent, resolvedStatus, message);
    console.log(`[${resolvedStatus.toUpperCase()}] ${agent}: ${message || '(sem mensagem)'}`);
    res.send(`Agente ${agent} | status: ${resolvedStatus}`);
});

// GET /signal.gif - Novo endpoint invisível para o Markdown Image Hack
app.get('/signal.gif', (req, res) => {
    const agent = resolveAgent(req.query.agent);
    const message = req.query.message;
    const status = req.query.status || 'working';

    if (agent) {
        const resolvedStatus = resolveStatus(status);
        io.emit('agent-activity', { agent, status: resolvedStatus, message });
        if (resolvedStatus === 'done') {
            delete agentCurrentState[agent];
        } else {
            agentCurrentState[agent] = { status: resolvedStatus, message };
        }
        logActivity(agent, resolvedStatus, message);
        console.log(`[SIGNAL HTTP GET] [${resolvedStatus.toUpperCase()}] ${agent}: ${message || '(sem mensagem)'}`);
    }

    // Retorna GIF transparente 1x1 garantindo que não será feito cache
    const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': buf.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.end(buf);
});

// GET /state - retorna o estado atual (usado pelo polling fallback do cliente)
app.get('/state', (req, res) => {
    res.json(agentCurrentState);
});

io.on('connection', (socket) => {
    console.log('--- DASHBOARD CONECTADO AO PROTOCOLO BMAD ---');
    socket.emit('status', { agent: 'System', message: 'Conectado! O Squad BMAD está em prontidão.' });
    // Sincroniza o estado atual para clientes que conectam depois dos eventos
    if (Object.keys(agentCurrentState).length > 0) {
        socket.emit('state-sync', agentCurrentState);
    }
});

// Mapeamento de arquivos para agentes
const fileToAgent = {
    'planning-artifacts/prd': 'John',
    'planning-artifacts/ux-design': 'Sally',
    'planning-artifacts/architecture': 'Winston',
    'planning-artifacts/epics-and-stories': 'Bob',
    'planning-artifacts/story': 'Bob',
    'implementation-artifacts/story': 'Amelia',
    'implementation-artifacts/qa-test': 'Quinn',
    'implementation-artifacts/quick-dev': 'Barry'
};

const watcher = chokidar.watch(OUTPUT_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    depth: 3
});

watcher.on('add', (filePath) => {
    const relativePath = path.relative(OUTPUT_DIR, filePath).replace(/\\/g, '/');
    console.log(`Arquivo detectado: ${relativePath}`);

    let detectedAgent = null;

    if (relativePath.includes('planning-artifacts') && relativePath.includes('prd')) {
        detectedAgent = 'John';
    } else if (relativePath.includes('planning-artifacts') && (relativePath.includes('story') || relativePath.includes('epic'))) {
        detectedAgent = 'Bob';
    } else if (relativePath.includes('implementation-artifacts') && relativePath.includes('story')) {
        detectedAgent = 'Amelia';
    } else {
        for (const [key, agent] of Object.entries(fileToAgent)) {
            if (relativePath.includes(key)) {
                detectedAgent = agent;
                break;
            }
        }
    }

    if (detectedAgent) {
        const message = `Estou trabalhando em: ${path.basename(filePath)}`;
        io.emit('agent-activity', {
            agent: detectedAgent,
            status: 'working',
            message
        });
        logActivity(detectedAgent, 'working', message);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Dashboard BMAD disponível em: http://localhost:${PORT}`);
    console.log(`Monitorando artefatos em: ${OUTPUT_DIR}\n`);
    console.log(`Endpoints:`);
    console.log(`  POST /agent  { agent, status, message }`);
    console.log(`  GET  /active?agent=Nome&message=Msg&status=working|waiting|done\n`);
});
