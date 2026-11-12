# CIA 2.0 — Centro Integrado de Atendimento ao Aluno (UniCatólica)

> **Plataforma web de autoatendimento 24/7 e gestão inteligente de chamados acadêmicos e financeiros do Centro Universitário Católica do Tocantins (UniCatólica).**

![Status](https://img.shields.io/badge/Status-Prot%C3%B3tipo%20Funcional-0B1D3A?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-164273?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## Sobre o Projeto

O **CIA 2.0** nasceu na disciplina de **Práticas Profissionais / Processos de Construção de Software** (Engenharia de Software — UniCatólica, Palmas/TO) com o objetivo de solucionar um gargalo crítico enfrentado pelos estudantes: **longas filas presenciais e horas de espera no atendimento digital** para demandas operacionais repetitivas de secretaria e financeiro.

A plataforma substitui o fluxo manual e fragmentado por um portal unificado com **autoatendimento instantâneo** (emissão de documentos e 2ª via de boletos), **base de conhecimento inteligente (FAQ)** e um **sistema de tickets rastreáveis por protocolo com controle de SLA** para a equipe de atendimento.

---

## Principais Funcionalidades

### 1. Autenticação e Roteamento por Perfil (Simulação SSO Microsoft)
* **Controle de Acesso por Domínio Institucional:**
  * `@a.catolica-to.edu.br` $\rightarrow$ Redireciona automaticamente para o **Portal do Aluno / Responsável Financeiro**.
  * `@catolica-to.edu.br` / `@cia.catolica-to.edu.br` $\rightarrow$ Redireciona para o **Painel Operacional do Atendente CIA**.
  * `@p.catolica-to.edu.br` $\rightarrow$ Acesso bloqueado (módulo exclusivo para comunicação direta entre discentes e departamento institucional).
* **Acesso Rápido de Demonstração:** Botões de login rápido na tela inicial para testar ambos os perfis sem burocracia.

### 2. Portal do Aluno (Autoatendimento)
* **Emissão Rápida (1-Clique):** Geração imediata de **Declaração de Matrícula**, **Histórico Escolar** e **2ª Via de Boleto**, com visualização em modal e envio simulado para o e-mail institucional.
* **Base de Conhecimento (FAQ Inteligente):** Busca em tempo real e filtragem por categorias (*Acadêmico, Financeiro, Requerimentos e Bolsas e Benefícios*) com avaliação de utilidade da resposta.
* **Abertura e Rastreamento de Chamados:** Geração de protocolo único (ex: `#CIA-2026-0042`) e acompanhamento visual em tempo real (*Aberto $\rightarrow$ Em Análise $\rightarrow$ Encaminhado $\rightarrow$ Concluído*).

### 3. Painel Operacional do Atendente CIA
* **Monitoramento de KPIs e Capacidade:** Indicadores em tempo real de tickets pendentes, chamados com SLA crítico e alertas de sobrecarga por setor.
* **Fila Priorizada por SLA:** Ordenação automática por nível de criticidade (*Alta, Média, Baixa*) e contagem regressiva de prazo de atendimento.
* **Tratativa Integrada:** Modal para resposta direta ao estudante, anexo de documentos oficiais e atualização de status sincronizada em tempo real via persistência local (`localStorage`).

---

## Tecnologias Utilizadas

* **Front-end:** React 19, TypeScript, Vite 8
* **Estilização & Animações:** Tailwind CSS v4, Lucide React (ícones), Motion
* **Back-end / Integrações:** Express, Dotenv, Google GenAI SDK (`@google/genai`)
* **Tipografia Institucional:** Plus Jakarta Sans, Public Sans e JetBrains Mono

---

## Estrutura do Projeto

```text
cia-2.0/
├── src/
│   ├── components/      # Componentes reutilizáveis (Modais, Cards, Badges de SLA)
│   ├── pages/           # Telas principais (Login SSO, Portal do Aluno, Painel Atendente)
│   ├── data/            # Dados iniciais pré-populados (Mock Data e FAQ)
│   ├── types/           # Tipagens TypeScript (Tickets, Usuários, Documentos)
│   ├── App.tsx          # Roteamento de perfis e estado global
│   └── main.tsx         # Ponto de entrada da aplicação
├── index.html           # Estrutura HTML e fontes Google Fonts
├── package.json         # Dependências e scripts do projeto
├── tsconfig.json        # Configuração do TypeScript
└── vite.config.ts       # Configuração do bundler Vite
```

---

## Como Executar Localmente

### Pré-requisitos
* **Node.js** (versão 18 ou superior recomendada)
* **npm** ou **yarn**

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/cia-2.0.git
   cd cia-2.0
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente (opcional para recursos de IA):**
   Crie um arquivo `.env.local` na raiz do projeto com base no `.env.example`:
   ```env
   GEMINI_API_KEY="sua_chave_api_aqui"
   APP_URL="http://localhost:3000"
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   Abra `http://localhost:3000` para visualizar e testar a aplicação.

### Scripts Disponíveis
* `npm run dev` — Inicia o servidor local na porta `3000`.
* `npm run build` — Gera a versão otimizada para produção na pasta `dist/`.
* `npm run preview` — Visualiza localmente o build de produção.
* `npm run lint` — Executa a verificação de tipos com TypeScript (`tsc --noEmit`).

---

## Equipe 404 — UniCatólica (2026)

* **Gabriel Oliveira Vidal**
* **João Vittor de Sousa Cortes**
* **Karen Lorena Kuhn Silva**
* **Pedro Henrique Braga Oliveira**
* **Pedro Henrique dos Santos Dultra**
* **Willian Douglas Lima Ribeiro Pugas**

---

<div align="center">
  Desenvolvido para o Centro Universitário Católica do Tocantins (UniCatólica) — Palmas, TO.
</div>