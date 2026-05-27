# SASUCRILHOS - Estúdio de Dublagem no Discord

Site oficial do estúdio de dublagem SASUCRILHOS, um projeto profissional de dublagem de anime operando dentro do Discord.

## 🎨 Paleta de Cores

- **#B06932** — Laranja queimado / principal (destaques, botões principais)
- **#B77845** — Laranja terroso (hover, detalhes, bordas)
- **#2F3844** — Azul acinzentado escuro (fundos alternativos, cards, navbar)
- **#F2EEE8** — Branco quente (fundos claros, texto em fundos escuros)
- **#E6E1DD** — Bege suave (segundo plano claro)
- **#000000** — Preto absoluto (textos principais, footer)
- **#A0A3A9** — Cinza médio (textos secundários)
- **#807D7C** — Cinza quente (bordas, divisórias)
- **#999999** — Cinza claro (placeholders, ícones)
- **#5B5B5B** — Cinza escuro (texto em fundos claros)
- **#D8D0BD** — Bege acinzentado (fundos de cards ou seções suaves)

## 📁 Estrutura do Projeto

```
sasucrilhos/
├── server.js                 # Servidor Express com rotas da API
├── database.js              # Inicialização do banco de dados SQLite
├── package.json              # Dependências do projeto
├── README.md                 # Este arquivo
├── sasucrilhos.db           # Banco de dados SQLite (criado automaticamente)
├── dados/
│   ├── dubladores.json       # Dados dos dubladores (legado)
│   ├── episodios.json        # Dados dos episódios (legado)
│   └── contatos.json         # Mensagens de contato (legado)
└── public/
    ├── index.html            # Página principal
    ├── admin.html            # Painel administrativo
    ├── css/
    │   ├── style.css         # Estilos com animações premium
    │   └── admin.css         # Estilos do painel admin
    ├── js/
    │   ├── main.js           # JavaScript interativo
    │   └── admin.js          # JavaScript do painel admin
    ├── uploads/              # Diretório de upload de imagens
    └── assets/
        └── imagens placeholder
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)

### Passos

1. **Clone ou baixe o projeto**
   ```bash
   cd "c:\Users\Skyzoe\Documents\Projeto Sasucrilhos"
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor**
   ```bash
   node server.js
   ```
   - O banco de dados SQLite será criado automaticamente na primeira execução
   - O diretório `public/uploads` será criado para armazenar imagens

## 📡 API Routes

### GET /api/dubladores
Retorna todos os dubladores cadastrados.

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Kael 'Voz de Ferro' Rodrigues",
    "personagens": ["Goku (Dragon Ball)", "Levi (Attack on Titan)"],
    "redesSociais": {
      "discord": "kael_vozferro#1234",
      "twitter": "@KaelVozDeFerro",
      "instagram": "@kael.dublador"
    },
    "curiosidade": "Começou dublando vídeos de memes em 2019..."
  }
]
```

### GET /api/episodios
Retorna todos os episódios lançados.

**Resposta:**
```json
[
  {
    "id": 1,
    "titulo": "A Batalha dos Deuses - Parte 1",
    "anime": "Dragon Ball Super",
    "data": "15/03/2022",
    "descricao": "Goku enfrenta Bills pela primeira vez...",
    "miniatura": "assets/episodio1.jpg",
    "duracao": "12:34"
  }
]
```

### POST /api/contato
Salva uma mensagem de contato.

**Request Body:**
```json
{
  "nome": "Seu Nome",
  "email": "seu@email.com",
  "tipoParceria": "parceria",
  "mensagem": "Sua mensagem aqui..."
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso!"
}
```

### POST /api/dubladores
Adiciona um novo dublador.

**Request Body:**
```json
{
  "nome": "Nome do Dublador",
  "personagens": ["Personagem 1", "Personagem 2"],
  "redesSociais": {
    "discord": "usuario#1234",
    "twitter": "@usuario",
    "instagram": "@usuario"
  },
  "curiosidade": "Curiosidade sobre o dublador"
}
```

### PUT /api/dubladores/:id
Atualiza um dublador existente.

### DELETE /api/dubladores/:id
Remove um dublador.

### POST /api/episodios
Adiciona um novo episódio.

**Request Body:**
```json
{
  "titulo": "Título do Episódio",
  "anime": "Nome do Anime",
  "data": "DD/MM/AAAA",
  "descricao": "Descrição do episódio",
  "miniatura": "assets/episodio.jpg",
  "duracao": "MM:SS"
}
```

### PUT /api/episodios/:id
Atualiza um episódio existente.

### DELETE /api/episodios/:id
Remove um episódio.

### POST /api/upload
Faz upload de uma imagem.

**Request Body:** (FormData)
- `imagem`: Arquivo de imagem (jpeg, jpg, png, gif, webp)

**Resposta:**
```json
{
  "success": true,
  "imageUrl": "/uploads/1234567890-image.jpg"
}
```

### GET /api/contatos
Retorna todas as mensagens de contato (para painel admin).

### DELETE /api/contatos/:id
Remove uma mensagem de contato.

## ✨ Funcionalidades

### Front-end
- **Hero Section** impactante com animações
- **Seção Sobre** com história do estúdio e cards de dubladores
- **Grid de Episódios** responsivo com cards interativos
- **Redes Sociais** agregadas em uma seção dedicada
- **Timeline interativa** com marcos do canal
- **Formulário de Contato** funcional com validação
- **Footer completo** com links e scroll to top

### Efeitos Visuais Premium
- **Scroll Reveal**: elementos surgem ao rolar a página
- **Glassmorphism**: efeitos de vidro fosco em cards e formulários
- **Partículas Animadas**: background com partículas flutuantes
- **Hover suave**: transições elegantes em elementos interativos
- **Glow laranja**: efeito de brilho pulsante nos botões principais
- **Navbar fixa**: permanece no topo com glassmorphism
- **Animações CSS**: transições de 0.4s a 0.5s com cubic-bezier
- **Sombras elegantes**: sombras profundas e realistas
- **Gradient Effects**: gradientes sofisticados em toda a interface

### Responsividade
- **Mobile-first**: desenvolvido pensando primeiro em dispositivos móveis
- **Breakpoints**: adaptado para tablets e desktops
- **Menu hamburger**: funcional em telas pequenas

### Painel Administrativo
- **Dashboard**: visão geral com estatísticas
- **Gerenciamento de Dubladores**: adicionar, editar e remover dubladores
- **Gerenciamento de Episódios**: adicionar, editar e remover episódios
- **Upload de Imagens**: upload de thumbnails para episódios diretamente do computador
- **Visualização de Contatos**: mensagens recebidas através do formulário
- **Interface Moderna**: glassmorphism e animações premium
- **Login Seguro**: proteção por senha

## 🎯 Seções do Site

1. **Hero Section**: Entrada impactante com chamada para ação
2. **Sobre**: História do estúdio e cards dos dubladores
3. **Episódios**: Grid responsivo com dublagens lançadas
4. **Redes Sociais**: Links para Discord, Twitter, Instagram e YouTube
5. **Timeline**: Linha do tempo com marcos importantes do canal
6. **Contato**: Formulário para parcerias e mensagens
7. **Footer**: Informações adicionais e navegação

## 🛠️ Tecnologias Utilizadas

- **Back-end**: Node.js + Express
- **Front-end**: HTML5, CSS3, JavaScript (Vanilla)
- **CSS Frameworks**: Tailwind CSS + Bootstrap 5
- **Ícones**: Font Awesome 6 (ícones originais das marcas)
- **Banco de Dados**: SQLite (sqlite3)
- **Upload de Arquivos**: Multer
- **Fontes**: Google Fonts (Poppins)

## 📝 Dados Fictícios

O projeto inclui dados fictícios para demonstração que são inseridos automaticamente na primeira execução:

- **5 Dubladores** com nomes criativos, personagens, redes sociais e curiosidades
- **6 Episódios** com títulos, animes, datas, descrições e durações
- **História do Sasucrilhos**: criado em 2021, primeiro episódio em 2022, mais de 50 episódios produzidos, comunidade de 15 mil membros

## 💾 Banco de Dados SQLite

O projeto utiliza SQLite como banco de dados para persistência de dados:

- **Arquivo**: `sasucrilhos.db` (criado automaticamente)
- **Tabelas**:
  - `dubladores`: armazena informações dos dubladores
  - `episodios`: armazena informações dos episódios
  - `contatos`: armazena mensagens de contato
- **Inicialização**: O banco de dados é criado automaticamente na primeira execução com dados de exemplo
- **Backup**: O arquivo `.db` pode ser copiado para backup dos dados

## 🎨 Design

O design segue uma identidade visual única:
- **Tema**: Industrial sofisticado / Vintage técnico / Anime streetwear
- **Sensação**: Acolhedor mas moderno, com personalidade forte
- **Contraste**: Quente (laranjas) vs Frio (azul escuro) vs Neutros (cinzas e bege)
- **Efeitos**: Sombra suave, glow laranja, transições elegantes

## 🔧 Personalização

### Adicionar novos dubladores
Edite o arquivo `dados/dubladores.json` seguindo o formato existente.

### Adicionar novos episódios
Edite o arquivo `dados/episodios.json` seguindo o formato existente.

### Modificar cores
Edite as variáveis CSS no início de `public/css/style.css`.

### Adicionar imagens
Coloque as imagens na pasta `public/assets/` e atualize os caminhos nos arquivos JSON.

## 📄 Licença

Este projeto foi criado para o estúdio de dublagem SASUCRILHOS.

## 👥 Equipe

- **Desenvolvimento**: Skyzoe (Developer Full-Stack)
- **Design**: Skyzoe (Developer Full-Stack)
- **Conteúdo**: Equipe SASUCRILHOS

---

**SASUCRILHOS - Transformando animes em experiências épicas desde 2026.** 🎬✨
