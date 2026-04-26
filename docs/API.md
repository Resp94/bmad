# 📡 API do Dashboard BMAD

Referencia completa dos endpoints HTTP e eventos WebSocket do servidor de sinalizacao do dashboard.

**Base URL:** `http://localhost:3105`

---

## Endpoints HTTP

### `GET /active`

Endpoint principal para sinalizar atividade de um agente via `curl`. Este eh o mais usado dentro das skills BMAD.

| Parametro | Tipo   | Obrigatorio | Descricao |
|-----------|--------|-------------|-----------|
| `agent`   | string | Sim         | Nome ou alias do agente |
| `status`  | string | Nao         | `working`, `waiting` ou `done` (padrao: `working`) |
| `message` | string | Nao         | Mensagem exibida no chat e na dialog box |

**Exemplo:**

```bash
curl.exe -s 'http://127.0.0.1:3105/active?agent=Amelia&status=working&message=Codificando+o+backend...'
```

**Resposta:** `Agente Amelia | status: working`

> **Nota para Windows/PowerShell:** Use `curl.exe` (nao `curl`) e aspas simples (`'`) na URL. Evite acentos na mensagem.

---

### `POST /agent`

Alternativa ao `GET /active` para chamadas programaticas com JSON body.

**Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "agent": "Winston",
  "status": "working",
  "message": "Definindo a arquitetura..."
}
```

**Exemplo com curl:**

```bash
curl.exe -s -X POST http://127.0.0.1:3105/agent -H "Content-Type: application/json" -d "{\"agent\":\"Winston\",\"status\":\"working\",\"message\":\"Definindo a arquitetura...\"}"
```

**Resposta:**

```json
{ "ok": true, "agent": "Winston", "status": "working" }
```

---

### `GET /signal.gif`

Endpoint invisivel para sinalizacao via imagem Markdown. Retorna um GIF transparente 1x1 e processa os mesmos parametros do `/active`.

Util para skills que querem sinalizar o dashboard sem usar `curl`, inserindo uma imagem no output Markdown:

```markdown
![](http://127.0.0.1:3105/signal.gif?agent=Mary&status=working&message=Pesquisando...)
```

| Parametro | Tipo   | Obrigatorio | Descricao |
|-----------|--------|-------------|-----------|
| `agent`   | string | Sim         | Nome ou alias do agente |
| `status`  | string | Nao         | `working`, `waiting` ou `done` (padrao: `working`) |
| `message` | string | Nao         | Mensagem exibida no chat e na dialog box |

**Resposta:** GIF transparente 1x1 (sem cache).

---

### `GET /state`

Retorna o estado atual de todos os agentes ativos. Usado internamente pelo polling fallback do cliente.

**Resposta:**

```json
{
  "Amelia": { "status": "working", "message": "Codificando o backend..." },
  "Winston": { "status": "waiting", "message": "Aguardando aprovacao..." }
}
```

Agentes com status `done` sao removidos do estado — se o JSON estiver vazio (`{}`), nenhum agente esta ativo.

---

## Aliases de Agentes

O servidor aceita varios formatos de nome para cada agente. Todos os aliases abaixo sao resolvidos automaticamente:

| Agente   | Aliases aceitos |
|----------|-----------------|
| Winston  | `winston`, `architect`, `bmad-agent-architect` |
| John     | `john`, `pm`, `bmad-agent-pm` |
| Mary     | `mary`, `analyst`, `bmad-agent-analyst` |
| Sally    | `sally`, `designer`, `bmad-agent-ux-designer` |
| Amelia   | `amelia`, `dev`, `bmad-agent-dev` |
| Quinn    | `quinn`, `qa`, `bmad-agent-qa` |
| Bob      | `bob`, `sm`, `bmad-agent-sm` |
| Paige    | `paige`, `writer`, `bmad-agent-tech-writer` |
| Barry    | `barry`, `bmad-agent-quick-flow-solo-dev` |

Se um nome nao reconhecido for enviado, a primeira letra eh capitalizada automaticamente (ex: `carlos` → `Carlos`).

---

## Aliases de Status

| Valor enviado | Status interno |
|---------------|----------------|
| `active` ou `working` | `working` |
| `waiting` | `waiting` |
| `inactive` ou `done` | `done` |

---

## Eventos WebSocket (Socket.io)

O cliente se conecta via Socket.io na mesma porta (`3105`). Os seguintes eventos sao emitidos pelo servidor:

### `agent-activity`

Emitido sempre que um agente muda de estado (via qualquer endpoint HTTP).

```javascript
socket.on('agent-activity', (data) => {
  // data = { agent: "Amelia", status: "working", message: "Codificando..." }
});
```

### `state-sync`

Emitido uma unica vez quando um cliente se conecta, para sincronizar o estado atual dos agentes que ja estavam ativos.

```javascript
socket.on('state-sync', (state) => {
  // state = { "Amelia": { status: "working", message: "..." }, ... }
});
```

### `status`

Emitido na conexao inicial como mensagem de boas-vindas.

```javascript
socket.on('status', (data) => {
  // data = { agent: "System", message: "Conectado! O Squad BMAD está em prontidão." }
});
```

---

## Efeitos Visuais no Dashboard

Quando um endpoint eh chamado, os seguintes efeitos ocorrem simultaneamente no navegador:

| Status    | Icone | Glow         | Zoom   | Animacao |
|-----------|-------|--------------|--------|----------|
| `working` | 💻    | Verde        | 1.8x   | Digitacao (sprite alternando frames) |
| `waiting` | ⏳    | Amarelo      | 1.8x   | Nenhuma |
| `done`    | 💤    | Nenhum       | 1.0x   | Nenhuma (volta ao idle) |

Alem disso:
- A **dialog box** exibe a mensagem com efeito de typewriter
- O **painel INFINITY COMMS** registra a mensagem no historico de chat
- Um **efeito sonoro 8-bit** toca (se o som estiver ativado)

---

## Ciclo de Vida Completo

Exemplo de fluxo tipico de uma skill ativando a Amelia:

```bash
# 1. Agente comeca a trabalhar
curl.exe -s 'http://127.0.0.1:3105/active?agent=Amelia&status=working&message=Iniciando+implementacao...'

# 2. Agente aguarda input do usuario
curl.exe -s 'http://127.0.0.1:3105/active?agent=Amelia&status=waiting&message=Aguardando+revisao...'

# 3. Agente volta a trabalhar
curl.exe -s 'http://127.0.0.1:3105/active?agent=Amelia&status=working&message=Aplicando+correcoes...'

# 4. Agente finaliza
curl.exe -s 'http://127.0.0.1:3105/active?agent=Amelia&status=done&message=Implementacao+concluida!'
```

---

## File Watcher

O servidor monitora automaticamente a pasta `_bmad-output/` com profundidade 3. Quando um arquivo novo eh criado, o agente correspondente eh ativado automaticamente:

| Caminho do arquivo | Agente ativado |
|---------------------|----------------|
| `planning-artifacts/*prd*` | John (PM) |
| `planning-artifacts/*ux*` | Sally (UX) |
| `planning-artifacts/*architecture*` | Winston (Architect) |
| `planning-artifacts/*story*` ou `*epic*` | Bob (SM) |
| `implementation-artifacts/*story*` | Amelia (Dev) |
| `implementation-artifacts/*qa-test*` | Quinn (QA) |
| `implementation-artifacts/*quick-dev*` | Barry (Quick Dev) |

---

## Porta

O servidor escuta na porta **3105** por padrao (`0.0.0.0:3105`). Essa porta eh referenciada em todas as skills BMAD e nao deve ser alterada.
