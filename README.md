# 👾 BMAD: Business Management AI Developer

> **Transforme seu terminal em um escritório virtual habitado por uma equipe completa de Inteligência Artificial.**

Bem-vindo ao **BMAD**! Imagine que você está jogando um RPG clássico de GameBoy Advance, mas em vez de derrotar monstros, seus personagens estão construindo software do mundo real. O BMAD é um ecossistema visual e interativo onde agentes de IA (Gerentes de Produto, Arquitetos, Desenvolvedores, QA) trabalham juntos em uma "baia" virtual direto no seu navegador.

---

## 🎮 O que é o BMAD?

**Analogia Rápida:** Pense no BMAD como o "The Sims" do Desenvolvimento de Software.
No mundo tradicional, você interage com IAs através de chats de texto estáticos. No BMAD, cada IA da sua equipe ganha um **avatar pixel art**, uma mesa de trabalho, e um status em tempo real. Quando uma IA está "pensando", pesquisando ou escrevendo código, você *vê* o avatar dela trabalhando, a tela do computador brilhando e balões de diálogo mostrando exatamente o que ela está fazendo.

Tudo isso é orquestrado através do seu terminal, unindo o poder bruto de agentes autônomos (via CLI) com uma interface visual incrivelmente charmosa e amigável.

---

## ✨ Principais Funcionalidades

*   **🕹️ Interface Estilo GBA:** Um dashboard imersivo em pixel art com sistema de câmera (zoom e foco automático). Nada de painéis corporativos sem graça!
*   **🤖 Equipe Multidisciplinar:** O escritório já vem "contratado" com personas prontas:
    *   **John (PM):** Cuida dos requisitos e épicos.
    *   **Bob (SM):** Organiza sprints e cerimônias ágeis.
    *   **Winston (Arquiteto):** Define a fundação técnica.
    *   **Amelia (Dev) & Barry (Solo Dev):** Põem a mão na massa e escrevem o código.
    *   **Quinn (QA) & Mary (Analista):** Garantem a qualidade e fazem as pesquisas de mercado.
    *   **Sally (UX) & Paige (Tech Writer):** Desenhistas e documentadoras da equipe.
*   **⚡ Real-Time com Socket.io:** Atualizações instantâneas e animações fluidas baseadas no status de cada agente sem a necessidade de recarregar a página.

---

## 🚀 Como Começar (Guia Rápido)

Rodar o seu próprio escritório de IA é tão simples quanto dar o *play* no seu videogame favorito.

### 1. Pré-requisitos
Você só precisa ter o [Node.js](https://nodejs.org/) instalado no seu computador.

### 2. Instalação
Clone este repositório para o seu computador. A raiz do projeto contém os cérebros (skills e agentes), e a interface visual mora na pasta de output.

```bash
# Clone o projeto
git clone https://github.com/SEU_USUARIO/bmad.git
cd bmad

# Entre na pasta do Dashboard Visual
cd _bmad-output/dashboard

# Instale as dependências (Node)
npm install
```

### 3. Ligando o Escritório
Ainda dentro da pasta `dashboard`, inicie o servidor:

```bash
npm run bmad:dashboard
```

Pronto! Agora abra o seu navegador e acesse **`http://localhost:3105`**. O escritório virtual carregará e a equipe estará em suas mesas, prontas e aguardando ordens.

---

## ⚙️ Como a Mágica Acontece? (Por Baixo dos Panos)

A arquitetura do BMAD é dividida em duas pontas, se comunicando como se usassem *Walkie-Talkies*:

1.  **O Terminal (O Cérebro):** É onde a IA orquestradora roda suas **Skills** (habilidades descritas em Markdown nas pastas `.agent/skills/` e `_bmad/`). Quando a IA decide executar uma tarefa para cumprir seu planejamento, ela "pega o walkie-talkie".
2.  **O Dashboard (O Palco):** O servidor Node.js recebe o sinal do terminal através de requisições web super leves (`curl`) e traduz isso em animações visuais no navegador.

**Exemplo do fluxo (Terminal -> Dashboard):**
Quando a desenvolvedora (Amelia) começa a codificar uma feature, a skill no seu terminal dispara silenciosamente um comando como este:
```bash
curl.exe -s 'http://127.0.0.1:3105/active?agent=Amelia&status=working&message=Amelia+Codificando_backend...'
```
*BAM!* No mesmo milissegundo, a câmera do dashboard dá um zoom na Amelia, o computador dela acende e um balãozinho interativo diz "Codificando backend...". E tudo isso acontece enquanto o código é de fato gerado no seu terminal!

---

## 🧠 Personalizando a sua Agência de IA

Se você quiser expandir a equipe ou modificar processos, não precisa aprender linguagens complexas. Todos os "cérebros" dos seus agentes e o conhecimento deles estão guardados nas pastas `.agent/skills/` e `_bmad/core/`.

O BMAD usa uma estrutura forte baseada em **Markdown** (`.md`) e **YAML** (`.yaml`) para instruir os agentes. Para criar uma nova persona ou dar uma nova habilidade para o time, basta adicionar um novo `SKILL.md` ensinando o passo a passo daquela tarefa!

---

*Transforme a forma de interagir com IAs. Desenvolvido com ❤️, criatividade e muitos pixels.*
