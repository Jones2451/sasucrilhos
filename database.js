const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, 'sasucrilhos.db');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        initDatabase();
    }
});

// Inicializar tabelas
function initDatabase() {
    // Tabela de dubladores
    db.run(`CREATE TABLE IF NOT EXISTS dubladores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        categorias TEXT NOT NULL DEFAULT '["dublador"]',
        personagens TEXT,
        especialidades TEXT,
        redes_sociais TEXT,
        curiosidade TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela dubladores:', err.message);
        } else {
            console.log('Tabela dubladores criada/verificada.');
            // Adicionar colunas se não existirem (para migração)
            db.run(`ALTER TABLE dubladores ADD COLUMN categorias TEXT DEFAULT '["dublador"]'`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Erro ao adicionar coluna categorias:', err.message);
                }
            });
            db.run(`ALTER TABLE dubladores ADD COLUMN especialidades TEXT`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Erro ao adicionar coluna especialidades:', err.message);
                }
            });
            db.run(`ALTER TABLE dubladores ADD COLUMN redes_sociais TEXT`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Erro ao adicionar coluna redes_sociais:', err.message);
                }
            });
            // Comentado para não re-inserir dados de exemplo ao reiniciar o servidor
            // insertSampleDubladores();
        }
    });

    // Tabela de episódios
    db.run(`CREATE TABLE IF NOT EXISTS episodios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        anime TEXT NOT NULL,
        data TEXT NOT NULL,
        descricao TEXT NOT NULL,
        miniatura TEXT,
        duracao TEXT,
        youtube_url TEXT,
        youtube_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela episodios:', err.message);
        } else {
            console.log('Tabela episodios criada/verificada.');
            // Adicionar colunas youtube_url e youtube_id se não existirem
            db.run(`ALTER TABLE episodios ADD COLUMN youtube_url TEXT`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Erro ao adicionar coluna youtube_url:', err.message);
                }
            });
            db.run(`ALTER TABLE episodios ADD COLUMN youtube_id TEXT`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Erro ao adicionar coluna youtube_id:', err.message);
                }
            });
            // Comentado para não re-inserir dados de exemplo ao reiniciar o servidor
            // insertSampleEpisodios();
        }
    });

    // Tabela de contatos
    db.run(`CREATE TABLE IF NOT EXISTS contatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        tipoParceria TEXT NOT NULL,
        mensagem TEXT NOT NULL,
        data DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela contatos:', err.message);
        } else {
            console.log('Tabela contatos criada/verificada.');
        }
    });

    // Tabela de redes sociais do site
    db.run(`CREATE TABLE IF NOT EXISTS redes_sociais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plataforma TEXT NOT NULL,
        url TEXT NOT NULL,
        descricao TEXT,
        ordem INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela redes_sociais:', err.message);
        } else {
            console.log('Tabela redes_sociais criada/verificada.');
            // Comentado para não re-inserir dados de exemplo ao reiniciar o servidor
            // insertSampleRedesSociais();
        }
    });
}

// Inserir dados de exemplo se a tabela estiver vazia
// DESATIVADO: Dados de exemplo não são mais inseridos automaticamente
// para preservar as edições do usuário entre reinícios do servidor
function insertSampleDubladores() {
    console.log('Inserção de dados de exemplo desativada.');
    return;
}

function insertSampleEpisodios() {
    console.log('Inserção de dados de exemplo desativada.');
    return;
}

function insertSampleRedesSociais() {
    console.log('Inserção de dados de exemplo desativada.');
    return;
}

module.exports = db;
