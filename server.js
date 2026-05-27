const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const db = require('./database');

const app = express();
const PORT = 3000;

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// API Routes

// GET /api/dubladores - Retorna todos os dubladores
app.get('/api/dubladores', (req, res) => {
  db.all('SELECT * FROM dubladores ORDER BY id DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Converter personagens, categorias, especialidades e redes_sociais de JSON string para array
    const dubladores = rows.map(row => ({
      ...row,
      categorias: JSON.parse(row.categorias || '["dublador"]'),
      personagens: row.personagens ? JSON.parse(row.personagens) : [],
      especialidades: row.especialidades ? JSON.parse(row.especialidades) : [],
      redes_sociais: row.redes_sociais ? JSON.parse(row.redes_sociais) : []
    }));
    res.json(dubladores);
  });
});

// POST /api/dubladores - Adiciona novo dublador
app.post('/api/dubladores', (req, res) => {
  const { nome, categorias, personagens, especialidades, redes_sociais, curiosidade } = req.body;
  
  if (!nome || !curiosidade) {
    return res.status(400).json({ error: 'Nome e curiosidade são obrigatórios' });
  }
  
  const personagensJson = (personagens && personagens.length > 0) ? JSON.stringify(personagens) : null;
  const especialidadesJson = (especialidades && especialidades.length > 0) ? JSON.stringify(especialidades) : null;
  const redesSociaisJson = (redes_sociais && redes_sociais.length > 0) ? JSON.stringify(redes_sociais) : null;
  const categoriasValue = Array.isArray(categorias) ? JSON.stringify(categorias) : JSON.stringify(categorias || ['dublador']);
  
  const sql = 'INSERT INTO dubladores (nome, categorias, personagens, especialidades, redes_sociais, curiosidade) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [nome, categoriasValue, personagensJson, especialidadesJson, redesSociaisJson, curiosidade], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Buscar o dublador inserido
    db.get('SELECT * FROM dubladores WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const dublador = {
        ...row,
        categorias: JSON.parse(row.categorias),
        personagens: row.personagens ? JSON.parse(row.personagens) : [],
        especialidades: row.especialidades ? JSON.parse(row.especialidades) : [],
        redes_sociais: row.redes_sociais ? JSON.parse(row.redes_sociais) : []
      };
      
      res.json({ success: true, message: 'Dublador adicionado com sucesso!', dublador });
    });
  });
});

// PUT /api/dubladores/:id - Atualiza dublador
app.put('/api/dubladores/:id', (req, res) => {
  const { id } = req.params;
  const { nome, categorias, personagens, especialidades, redes_sociais, curiosidade } = req.body;
  
  const personagensJson = (personagens && personagens.length > 0) ? (Array.isArray(personagens) ? JSON.stringify(personagens) : JSON.stringify([personagens])) : null;
  const especialidadesJson = (especialidades && especialidades.length > 0) ? (Array.isArray(especialidades) ? JSON.stringify(especialidades) : JSON.stringify([especialidades])) : null;
  const redesSociaisJson = (redes_sociais && redes_sociais.length > 0) ? (Array.isArray(redes_sociais) ? JSON.stringify(redes_sociais) : JSON.stringify([redes_sociais])) : null;
  const categoriasValue = categorias ? (Array.isArray(categorias) ? JSON.stringify(categorias) : JSON.stringify([categorias])) : null;
  
  const sql = `UPDATE dubladores SET 
    nome = COALESCE(?, nome),
    categorias = COALESCE(?, categorias),
    personagens = COALESCE(?, personagens),
    especialidades = COALESCE(?, especialidades),
    redes_sociais = COALESCE(?, redes_sociais),
    curiosidade = COALESCE(?, curiosidade)
    WHERE id = ?`;
    
  db.run(sql, [nome, categoriasValue, personagensJson, especialidadesJson, redesSociaisJson, curiosidade, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Dublador não encontrado' });
    }
    
    // Buscar o dublador atualizado
    db.get('SELECT * FROM dubladores WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const dublador = {
        ...row,
        categorias: JSON.parse(row.categorias),
        personagens: row.personagens ? JSON.parse(row.personagens) : [],
        especialidades: row.especialidades ? JSON.parse(row.especialidades) : [],
        redes_sociais: row.redes_sociais ? JSON.parse(row.redes_sociais) : []
      };
      
      res.json({ success: true, message: 'Dublador atualizado com sucesso!', dublador });
    });
  });
});

// DELETE /api/dubladores/:id - Remove dublador
app.delete('/api/dubladores/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM dubladores WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Dublador não encontrado' });
    }
    
    res.json({ success: true, message: 'Dublador removido com sucesso!' });
  });
});

// GET /api/episodios - Retorna todos os episódios
app.get('/api/episodios', (req, res) => {
  db.all('SELECT * FROM episodios ORDER BY id DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/episodios - Adiciona novo episódio
app.post('/api/episodios', (req, res) => {
  const { titulo, anime, data, descricao, miniatura, duracao, youtube_url, youtube_id } = req.body;
  
  if (!titulo || !anime || !data || !descricao) {
    return res.status(400).json({ error: 'Título, anime, data e descrição são obrigatórios' });
  }
  
  const sql = 'INSERT INTO episodios (titulo, anime, data, descricao, miniatura, duracao, youtube_url, youtube_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.run(sql, [titulo, anime, data, descricao, miniatura || '', duracao || '', youtube_url || '', youtube_id || ''], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Buscar o episódio inserido
    db.get('SELECT * FROM episodios WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ success: true, message: 'Episódio adicionado com sucesso!', episodio: row });
    });
  });
});

// PUT /api/episodios/:id - Atualiza episódio
app.put('/api/episodios/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, anime, data, descricao, miniatura, duracao, youtube_url, youtube_id } = req.body;
  
  const sql = `UPDATE episodios SET 
    titulo = COALESCE(?, titulo),
    anime = COALESCE(?, anime),
    data = COALESCE(?, data),
    descricao = COALESCE(?, descricao),
    miniatura = COALESCE(?, miniatura),
    duracao = COALESCE(?, duracao),
    youtube_url = COALESCE(?, youtube_url),
    youtube_id = COALESCE(?, youtube_id)
    WHERE id = ?`;
  
  db.run(sql, [titulo, anime, data, descricao, miniatura, duracao, youtube_url, youtube_id, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Episódio não encontrado' });
    }
    
    // Buscar o episódio atualizado
    db.get('SELECT * FROM episodios WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ success: true, message: 'Episódio atualizado com sucesso!', episodio: row });
    });
  });
});

// DELETE /api/episodios/:id - Remove episódio
app.delete('/api/episodios/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM episodios WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Episódio não encontrado' });
    }
    
    res.json({ success: true, message: 'Episódio removido com sucesso!' });
  });
});

// POST /api/contato - Salva mensagem de contato
app.post('/api/contato', (req, res) => {
  const { nome, email, tipoParceria, mensagem } = req.body;
  
  // Validação básica
  if (!nome || !email || !tipoParceria || !mensagem) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  
  const sql = 'INSERT INTO contatos (nome, email, tipoParceria, mensagem) VALUES (?, ?, ?, ?)';
  db.run(sql, [nome, email, tipoParceria, mensagem], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
  });
});

// GET /api/contatos - Retorna todos os contatos (para admin)
app.get('/api/contatos', (req, res) => {
  db.all('SELECT * FROM contatos ORDER BY id DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// DELETE /api/contatos/:id - Remove contato
app.delete('/api/contatos/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM contatos WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    res.json({ success: true, message: 'Contato removido com sucesso!' });
  });
});

// POST /api/upload - Upload de imagem
app.post('/api/upload', upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

// GET /api/redes-sociais - Retorna todas as redes sociais
app.get('/api/redes-sociais', (req, res) => {
  db.all('SELECT * FROM redes_sociais ORDER BY ordem ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/redes-sociais - Adiciona nova rede social
app.post('/api/redes-sociais', (req, res) => {
  const { plataforma, url, descricao, ordem } = req.body;
  
  if (!plataforma || !url) {
    return res.status(400).json({ error: 'Plataforma e URL são obrigatórios' });
  }
  
  const sql = 'INSERT INTO redes_sociais (plataforma, url, descricao, ordem) VALUES (?, ?, ?, ?)';
  db.run(sql, [plataforma, url, descricao || '', ordem || 0], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM redes_sociais WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Rede social adicionada com sucesso!', rede: row });
    });
  });
});

// PUT /api/redes-sociais/:id - Atualiza rede social
app.put('/api/redes-sociais/:id', (req, res) => {
  const { id } = req.params;
  const { plataforma, url, descricao, ordem } = req.body;
  
  const sql = `UPDATE redes_sociais SET 
    plataforma = COALESCE(?, plataforma),
    url = COALESCE(?, url),
    descricao = COALESCE(?, descricao),
    ordem = COALESCE(?, ordem)
    WHERE id = ?`;
    
  db.run(sql, [plataforma, url, descricao, ordem, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Rede social não encontrada' });
    }
    
    db.get('SELECT * FROM redes_sociais WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Rede social atualizada com sucesso!', rede: row });
    });
  });
});

// DELETE /api/redes-sociais/:id - Remove rede social
app.delete('/api/redes-sociais/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM redes_sociais WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Rede social não encontrada' });
    }
    
    res.json({ success: true, message: 'Rede social removida com sucesso!' });
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor SASUCRILHOS rodando em http://localhost:${PORT}`);
  console.log(`📁 Servindo arquivos estáticos de: ${path.join(__dirname, 'public')}`);
});
