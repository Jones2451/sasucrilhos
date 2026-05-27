// ===================================
// SASUCRILHOS - Admin Panel JavaScript
// ===================================

// Senha do admin (em produção, usar autenticação real)
const ADMIN_PASSWORD = 'sasucrilhos';

// Estado da aplicação
let currentTab = 'dashboard';
let editingItem = null;
let editingType = null;
let logoutTimer = null;
const LOGOUT_TIMEOUT = 15 * 60 * 1000; // 15 minutos em milissegundos

// Elementos DOM (serão inicializados após DOMContentLoaded)
let loginScreen, adminDashboard, loginForm, loginError, modal, modalTitle, modalBody, modalClose;

// ===================================
// INICIALIZAÇÃO
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos DOM
    loginScreen = document.getElementById('login-screen');
    adminDashboard = document.getElementById('admin-dashboard');
    loginForm = document.getElementById('login-form');
    loginError = document.getElementById('login-error');
    modal = document.getElementById('modal');
    modalTitle = document.getElementById('modal-title');
    modalBody = document.getElementById('modal-body');
    modalClose = document.getElementById('modal-close');

    // Verificar se já está logado
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        loginScreen.style.display = 'none';
        adminDashboard.style.display = 'flex';
        loadDashboard();
        loadDubladores();
        loadEpisodios();
        loadContatos();
        startLogoutTimer();
    }

    // Configurar eventos
    setupLogin();
    setupLogout();
    setupNavigation();
    setupModal();
    setupDubladoresButtons();
    setupEpisodiosButtons();
    setupRedesSociaisButtons();
});

// ===================================
// LOGIN
// ===================================
function setupLogin() {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            loginScreen.style.display = 'none';
            adminDashboard.style.display = 'flex';
            loadDashboard();
            loadDubladores();
            loadEpisodios();
            loadContatos();
            startLogoutTimer();
        } else {
            loginError.textContent = 'Senha incorreta!';
            loginError.style.display = 'block';
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    });
}

// Logout
function setupLogout() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        performLogout();
    });

    // Resetar timer em qualquer atividade do usuário
    document.addEventListener('click', resetLogoutTimer);
    document.addEventListener('keypress', resetLogoutTimer);
    document.addEventListener('scroll', resetLogoutTimer);
}

// Funções de Logout Timer
function startLogoutTimer() {
    resetLogoutTimer();
    logoutTimer = setTimeout(() => {
        alert('Sessão expirada por inatividade. Você será deslogado.');
        performLogout();
    }, LOGOUT_TIMEOUT);
}

function resetLogoutTimer() {
    if (logoutTimer) {
        clearTimeout(logoutTimer);
    }
}

function performLogout() {
    resetLogoutTimer();
    localStorage.removeItem('adminLoggedIn');
    adminDashboard.style.display = 'none';
    loginScreen.style.display = 'flex';
    document.getElementById('password').value = '';
}

// ===================================
// NAVEGAÇÃO
// ===================================
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    currentTab = tab;
    
    // Atualizar botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    // Atualizar conteúdo das abas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    // Atualizar título da página
    const titles = {
        dashboard: 'Dashboard',
        dubladores: 'Gerenciar Dubladores',
        episodios: 'Gerenciar Episódios',
        contatos: 'Mensagens Recebidas',
        'redes-sociais': 'Gerenciar Redes Sociais'
    };
    document.getElementById('page-title').textContent = titles[tab];
    
    // Carregar dados da aba
    if (tab === 'dubladores') loadDubladores();
    else if (tab === 'episodios') loadEpisodios();
    else if (tab === 'contatos') loadContatos();
    else if (tab === 'redes-sociais') loadRedesSociais();
}

// ===================================
// DASHBOARD
// ===================================
async function loadDashboard() {
    try {
        const [dubladores, episodios, contatos] = await Promise.all([
            fetch('/api/dubladores').then(r => r.json()),
            fetch('/api/episodios').then(r => r.json()),
            fetch('/api/contatos').then(r => r.json())
        ]);
        
        document.getElementById('stat-dubladores').textContent = dubladores.length;
        document.getElementById('stat-episodios').textContent = episodios.length;
        document.getElementById('stat-contatos').textContent = contatos.length;
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// ===================================
// DUBLADORES
// ===================================
async function loadDubladores() {
    const list = document.getElementById('dubladores-list');
    list.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const response = await fetch('/api/dubladores');
        const dubladores = await response.json();
        
        if (dubladores.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-microphone"></i></div>
                    <h3>Nenhum dublador cadastrado</h3>
                    <p>Clique em "Adicionar Dublador" para começar</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = dubladores.map(d => `
            <div class="item-card">
                <div class="item-info">
                    <h3>${d.nome}</h3>
                    <p><strong>Personagens:</strong> ${d.personagens.join(', ')}</p>
                    <p><strong>Curiosidade:</strong> ${d.curiosidade}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-action btn-edit" onclick="editDublador(${d.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteDublador(${d.id})">Excluir</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar dubladores:', error);
        list.innerHTML = '<div class="loading">Erro ao carregar dubladores</div>';
    }
}

function setupDubladoresButtons() {
    document.getElementById('add-dublador-btn').addEventListener('click', () => {
        editingItem = null;
        editingType = 'dublador';
        openModal('Adicionar Dublador', renderDubladorForm());
    });
}

async function editDublador(id) {
    try {
        const response = await fetch('/api/dubladores');
        const dubladores = await response.json();
        const dublador = dubladores.find(d => d.id === id);
        
        if (dublador) {
            editingItem = dublador;
            editingType = 'dublador';
            openModal('Editar Dublador', renderDubladorForm(dublador));
        }
    } catch (error) {
        console.error('Erro ao carregar dublador:', error);
    }
}

async function deleteDublador(id) {
    if (!confirm('Tem certeza que deseja excluir este dublador?')) return;
    
    try {
        const response = await fetch(`/api/dubladores/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            loadDubladores();
            loadDashboard();
        } else {
            alert('Erro ao excluir dublador');
        }
    } catch (error) {
        console.error('Erro ao excluir dublador:', error);
        alert('Erro ao excluir dublador');
    }
}

function renderDubladorForm(dublador = null) {
    const currentCategorias = dublador?.categorias || ['dublador'];
    const categoriasArray = Array.isArray(currentCategorias) ? currentCategorias : (currentCategorias ? JSON.parse(currentCategorias) : ['dublador']);
    
    // Lista de redes sociais disponíveis
    const socialNetworks = [
        'Discord', 'Guns.Lol', 'Instagram', 'Facebook', 'Twitter', 'TikTok', 'GitHub', 'LinkedIn', 'YouTube', 'Twitch', 'Telegram', 'WhatsApp', 'Snapchat', 'Reddit', 'Pinterest', 'Mastodon', 'Bluesky', 'Threads', 'Signal', 'WeChat', 'VK', 'Tumblr', 'Medium', 'Kick', 'BeReal', 'CashApp', 'Paypal.me', 'Linktree', 'OnlyFans', 'Steam', 'Xbox', 'PlayStation Network', 'Spotify', 'Rumble', 'Odysee', 'Minds', 'Gab', 'Parler', 'Truth Social', 'Nostr', 'Lemmy', 'Kbin', 'Matrix', 'Element', 'Revolt', 'Guilded', 'Teamspeak', 'Zoom', 'Google Meet', 'Skype', 'Line', 'KakaoTalk', 'ICQ', 'IRC', 'Slack'
    ];
    
    // Redes sociais atuais
    const currentRedesSociais = dublador?.redes_sociais || [];
    const redesArray = Array.isArray(currentRedesSociais) ? currentRedesSociais : (currentRedesSociais ? JSON.parse(currentRedesSociais) : []);
    
    // Gerar HTML das redes sociais
    const redesHTML = redesArray.map((rs, index) => `
        <div class="social-network-row" data-index="${index}">
            <select class="social-network-select">
                ${socialNetworks.map(rede => `<option value="${rede}" ${rs.rede === rede ? 'selected' : ''}>${rede}</option>`).join('')}
            </select>
            <input type="text" class="social-network-input" value="${rs.usuario}" placeholder="URL ou username">
            <button type="button" class="btn btn-remove-social" onclick="removeSocialNetwork(${index})">Remover</button>
        </div>
    `).join('');
    
    return `
        <div class="form-group">
            <label>Nome</label>
            <input type="text" id="dublador-nome" value="${dublador?.nome || ''}" placeholder="Nome do membro">
        </div>
        <div class="form-group">
            <label>Categorias (selecione uma ou mais)</label>
            <div class="checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="cat-dublador" value="dublador" ${categoriasArray.includes('dublador') ? 'checked' : ''}>
                    <span>Dublador</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="cat-artista" value="artista" ${categoriasArray.includes('artista') ? 'checked' : ''}>
                    <span>Artista</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="cat-mixador" value="mixador" ${categoriasArray.includes('mixador') ? 'checked' : ''}>
                    <span>Mixador</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="cat-editor" value="editor" ${categoriasArray.includes('editor') ? 'checked' : ''}>
                    <span>Editor</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="cat-programador" value="programador" ${categoriasArray.includes('programador') ? 'checked' : ''}>
                    <span>Programador</span>
                </label>
            </div>
        </div>
        <div class="form-group">
            <label>Personagens (separados por vírgula - apenas para dubladores)</label>
            <input type="text" id="dublador-personagens" value="${dublador?.personagens?.join(', ') || ''}" placeholder="Goku, Naruto, Luffy">
        </div>
        <div class="form-group">
            <label>Especialidades (separados por vírgula - para outras categorias)</label>
            <input type="text" id="dublador-especialidades" value="${dublador?.especialidades?.join(', ') || ''}" placeholder="Mixagem, Masterização, Efeitos sonoros">
        </div>
        <div class="form-group">
            <label>Redes Sociais</label>
            <div id="social-networks-container">
                ${redesHTML}
            </div>
            <button type="button" class="btn btn-outline" onclick="addSocialNetwork()">+ Adicionar Rede</button>
        </div>
        <div class="form-group">
            <label>Curiosidade</label>
            <textarea id="dublador-curiosidade" placeholder="Uma curiosidade sobre o membro">${dublador?.curiosidade || ''}</textarea>
        </div>
        <div class="modal-actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveDublador()">Salvar</button>
        </div>
    `;
}

function initializeSocialNetworkListeners() {
    const container = document.getElementById('social-networks-container');
    if (!container) return;
    
    const rows = container.querySelectorAll('.social-network-row');
    rows.forEach(row => {
        const input = row.querySelector('.social-network-input');
        const select = row.querySelector('.social-network-select');
        
        if (input && select) {
            // Se o valor atual começa com @, marcar como preenchido automaticamente
            if (input.value.startsWith('@')) {
                input.dataset.autoFilled = 'true';
                input.dataset.detectedNetwork = select.value;
                input.dataset.lastValue = input.value;
            } else {
                input.dataset.autoFilled = 'false';
                input.dataset.detectedNetwork = '';
                input.dataset.lastValue = input.value;
            }
            
            // Remover event listeners existentes para evitar duplicação
            input.removeEventListener('paste', handleSocialNetworkPaste);
            input.removeEventListener('blur', handleSocialNetworkBlur);
            input.removeEventListener('input', handleSocialNetworkInput);
            select.removeEventListener('change', handleSocialNetworkSelectChange);
            
            // Adicionar event listeners
            input.addEventListener('paste', (e) => handleSocialNetworkPaste(e, select, input));
            input.addEventListener('blur', () => handleSocialNetworkBlur(select, input));
            input.addEventListener('input', (e) => handleSocialNetworkInput(e, select, input));
            select.addEventListener('change', (e) => handleSocialNetworkSelectChange(e, select, input));
        }
    });
}

function handleSocialNetworkSelectChange(e, select, input) {
    // Se o input foi preenchido automaticamente, impedir mudança no select
    if (input.dataset.autoFilled === 'true') {
        // Reverter para a rede social detectada
        e.preventDefault();
        select.value = input.dataset.detectedNetwork || select.value;
        return;
    }
    
    // Se não foi preenchido automaticamente, permitir mudança
    input.dataset.autoFilled = 'false';
}

async function saveDublador() {
    const nome = document.getElementById('dublador-nome').value;
    
    // Coletar categorias dos checkboxes
    const categorias = [];
    if (document.getElementById('cat-dublador').checked) categorias.push('dublador');
    if (document.getElementById('cat-artista').checked) categorias.push('artista');
    if (document.getElementById('cat-mixador').checked) categorias.push('mixador');
    if (document.getElementById('cat-editor').checked) categorias.push('editor');
    if (document.getElementById('cat-programador').checked) categorias.push('programador');
    
    // Se nenhuma categoria foi selecionada, usar 'dublador' como padrão
    if (categorias.length === 0) {
        categorias.push('dublador');
    }
    
    const personagens = document.getElementById('dublador-personagens').value.split(',').map(p => p.trim()).filter(p => p);
    const especialidades = document.getElementById('dublador-especialidades').value.split(',').map(p => p.trim()).filter(p => p);
    
    // Coletar redes sociais dinâmicas
    const redes_sociais = [];
    const socialRows = document.querySelectorAll('.social-network-row');
    socialRows.forEach(row => {
        const select = row.querySelector('.social-network-select');
        const input = row.querySelector('.social-network-input');
        if (select && input && input.value.trim()) {
            redes_sociais.push({
                rede: select.value,
                usuario: input.value.trim()
            });
        }
    });
    
    const curiosidade = document.getElementById('dublador-curiosidade').value;
    
    if (!nome || !curiosidade) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    const data = {
        nome,
        categorias,
        personagens,
        especialidades,
        redes_sociais,
        curiosidade
    };
    
    try {
        let response;
        if (editingItem) {
            response = await fetch(`/api/dubladores/${editingItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/dubladores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            closeModal();
            loadDubladores();
            loadDashboard();
        } else {
            alert('Erro ao salvar dublador');
        }
    } catch (error) {
        console.error('Erro ao salvar dublador:', error);
        alert('Erro ao salvar dublador');
    }
}

// ===================================
// EPISÓDIOS
// ===================================
async function loadEpisodios() {
    const list = document.getElementById('episodios-list');
    list.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const response = await fetch('/api/episodios');
        const episodios = await response.json();
        
        if (episodios.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-film"></i></div>
                    <h3>Nenhum episódio cadastrado</h3>
                    <p>Clique em "Adicionar Episódio" para começar</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = episodios.map(e => `
            <div class="item-card">
                <div class="item-info">
                    <h3>${e.titulo}</h3>
                    <p><strong>Anime:</strong> ${e.anime}</p>
                    <p><strong>Data:</strong> ${e.data} | <strong>Duração:</strong> ${e.duracao}</p>
                    <p><strong>Descrição:</strong> ${e.descricao}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-action btn-edit" onclick="editEpisodio(${e.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteEpisodio(${e.id})">Excluir</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar episódios:', error);
        list.innerHTML = '<div class="loading">Erro ao carregar episódios</div>';
    }
}

function setupEpisodiosButtons() {
    document.getElementById('add-episodio-btn').addEventListener('click', () => {
        editingItem = null;
        editingType = 'episodio';
        openModal('Adicionar Episódio', renderEpisodioForm());
    });
}

async function editEpisodio(id) {
    try {
        const response = await fetch('/api/episodios');
        const episodios = await response.json();
        const episodio = episodios.find(e => e.id === id);
        
        if (episodio) {
            editingItem = episodio;
            editingType = 'episodio';
            openModal('Editar Episódio', renderEpisodioForm(episodio));
        }
    } catch (error) {
        console.error('Erro ao carregar episódio:', error);
    }
}

async function deleteEpisodio(id) {
    if (!confirm('Tem certeza que deseja excluir este episódio?')) return;
    
    try {
        const response = await fetch(`/api/episodios/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            loadEpisodios();
            loadDashboard();
        } else {
            alert('Erro ao excluir episódio');
        }
    } catch (error) {
        console.error('Erro ao excluir episódio:', error);
        alert('Erro ao excluir episódio');
    }
}

function renderEpisodioForm(episodio = null) {
    const currentMiniatura = episodio?.miniatura || '';
    return `
        <div class="form-group">
            <label>Link do YouTube (opcional - preenche automaticamente)</label>
            <input type="text" id="episodio-youtube-url" value="${episodio?.youtube_url || ''}" placeholder="https://www.youtube.com/watch?v=...">
        </div>
        <div class="form-group">
            <label>Título</label>
            <input type="text" id="episodio-titulo" value="${episodio?.titulo || ''}" placeholder="Título do episódio">
        </div>
        <div class="form-group">
            <label>Anime</label>
            <input type="text" id="episodio-anime" value="${episodio?.anime || ''}" placeholder="Nome do anime">
        </div>
        <div class="form-group">
            <label>Data</label>
            <input type="text" id="episodio-data" value="${episodio?.data || ''}" placeholder="DD/MM/AAAA">
        </div>
        <div class="form-group">
            <label>Duração</label>
            <input type="text" id="episodio-duracao" value="${episodio?.duracao || ''}" placeholder="MM:SS">
        </div>
        <div class="form-group">
            <label>Miniatura (Upload de Imagem ou automática do YouTube)</label>
            <div class="file-upload-container">
                <input type="file" id="episodio-imagem" accept="image/*" onchange="previewImage(this)">
                <div class="file-upload-label">
                    <span class="upload-icon">📁</span>
                    <span id="upload-text">Clique para selecionar uma imagem</span>
                </div>
            </div>
            <input type="hidden" id="episodio-miniatura" value="${currentMiniatura}">
            <input type="hidden" id="episodio-youtube-id" value="${episodio?.youtube_id || ''}">
            ${currentMiniatura ? `
                <div class="image-preview-container">
                    <img src="${currentMiniatura}" alt="Miniatura atual" class="image-preview">
                    <button type="button" class="btn-remove-image" onclick="removeImage()">Remover</button>
                </div>
            ` : ''}
            <div id="new-image-preview" class="image-preview-container" style="display: none;">
                <img src="" alt="Nova miniatura" class="image-preview">
                <button type="button" class="btn-remove-image" onclick="removeNewImage()">Remover</button>
            </div>
        </div>
        <div class="form-group">
            <label>Descrição</label>
            <textarea id="episodio-descricao" placeholder="Descrição do episódio">${episodio?.descricao || ''}</textarea>
        </div>
        <div class="modal-actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveEpisodio()">Salvar</button>
        </div>
    `;
}

// Função para extrair ID do YouTube da URL
function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Função para buscar metadados do YouTube
async function fetchYouTubeMetadata(videoId) {
    try {
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        
        return {
            title: data.title,
            description: data.author_name,
            thumbnail: data.thumbnail_url
        };
    } catch (error) {
        console.error('Erro ao buscar metadados do YouTube:', error);
        return null;
    }
}

// Função para inicializar event listener do YouTube URL
function initializeYouTubeUrlListener() {
    const youtubeUrlInput = document.getElementById('episodio-youtube-url');
    if (!youtubeUrlInput) return;
    
    youtubeUrlInput.addEventListener('paste', async (e) => {
        setTimeout(async () => {
            const url = youtubeUrlInput.value.trim();
            if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                const videoId = extractYouTubeId(url);
                if (videoId) {
                    const metadata = await fetchYouTubeMetadata(videoId);
                    if (metadata) {
                        // Preencher campos automaticamente
                        document.getElementById('episodio-titulo').value = metadata.title;
                        document.getElementById('episodio-descricao').value = metadata.description;
                        document.getElementById('episodio-miniatura').value = metadata.thumbnail;
                        document.getElementById('episodio-youtube-id').value = videoId;
                        
                        // Mostrar preview da thumbnail
                        const previewContainer = document.getElementById('new-image-preview');
                        if (previewContainer) {
                            previewContainer.style.display = 'block';
                            previewContainer.querySelector('img').src = metadata.thumbnail;
                        }
                    }
                }
            }
        }, 100);
    });
    
    youtubeUrlInput.addEventListener('blur', async () => {
        const url = youtubeUrlInput.value.trim();
        if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
            const videoId = extractYouTubeId(url);
            if (videoId) {
                const metadata = await fetchYouTubeMetadata(videoId);
                if (metadata) {
                    // Preencher campos automaticamente
                    document.getElementById('episodio-titulo').value = metadata.title;
                    document.getElementById('episodio-descricao').value = metadata.description;
                    document.getElementById('episodio-miniatura').value = metadata.thumbnail;
                    document.getElementById('episodio-youtube-id').value = videoId;
                    
                    // Mostrar preview da thumbnail
                    const previewContainer = document.getElementById('new-image-preview');
                    if (previewContainer) {
                        previewContainer.style.display = 'block';
                        previewContainer.querySelector('img').src = metadata.thumbnail;
                    }
                }
            }
        }
    });
}

async function saveEpisodio() {
    const titulo = document.getElementById('episodio-titulo').value;
    const anime = document.getElementById('episodio-anime').value;
    const data = document.getElementById('episodio-data').value;
    const duracao = document.getElementById('episodio-duracao').value;
    const descricao = document.getElementById('episodio-descricao').value;
    const youtubeUrl = document.getElementById('episodio-youtube-url').value;
    const youtubeId = document.getElementById('episodio-youtube-id').value;
    const imagemInput = document.getElementById('episodio-imagem');
    
    if (!titulo || !anime || !data || !descricao) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    let miniatura = document.getElementById('episodio-miniatura').value;
    
    // Se houver uma nova imagem, fazer upload
    if (imagemInput.files.length > 0) {
        try {
            const formData = new FormData();
            formData.append('imagem', imagemInput.files[0]);
            
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const uploadData = await uploadResponse.json();
            
            if (uploadData.success) {
                miniatura = uploadData.imageUrl;
            } else {
                alert('Erro ao fazer upload da imagem');
                return;
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao fazer upload da imagem');
            return;
        }
    }
    
    const episodioData = {
        titulo,
        anime,
        data,
        duracao,
        miniatura,
        descricao,
        youtube_url: youtubeUrl,
        youtube_id: youtubeId
    };
    
    try {
        let response;
        if (editingItem) {
            response = await fetch(`/api/episodios/${editingItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(episodioData)
            });
        } else {
            response = await fetch('/api/episodios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(episodioData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            closeModal();
            loadEpisodios();
            loadDashboard();
        } else {
            alert('Erro ao salvar episódio');
        }
    } catch (error) {
        console.error('Erro ao salvar episódio:', error);
        alert('Erro ao salvar episódio');
    }
}

// Funções de preview de imagem
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewContainer = document.getElementById('new-image-preview');
            const previewImage = previewContainer.querySelector('img');
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
            
            // Atualizar texto do upload
            document.getElementById('upload-text').textContent = input.files[0].name;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

function removeImage() {
    document.getElementById('episodio-miniatura').value = '';
    const currentPreview = document.querySelector('.image-preview-container:not(#new-image-preview)');
    if (currentPreview) {
        currentPreview.style.display = 'none';
    }
}

function removeNewImage() {
    const input = document.getElementById('episodio-imagem');
    input.value = '';
    document.getElementById('new-image-preview').style.display = 'none';
    document.getElementById('upload-text').textContent = 'Clique para selecionar uma imagem';
}

// ===================================
// CONTATOS
// ===================================
async function loadContatos() {
    const list = document.getElementById('contatos-list');
    list.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const response = await fetch('/api/contatos');
        const contatos = await response.json();
        
        if (contatos.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-envelope"></i></div>
                    <h3>Nenhuma mensagem recebida</h3>
                    <p>As mensagens de contato aparecerão aqui</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = contatos.map(c => `
            <div class="item-card">
                <div class="item-info">
                    <h3>${c.nome}</h3>
                    <p><strong>Email:</strong> ${c.email}</p>
                    <p><strong>Tipo:</strong> ${c.tipoParceria}</p>
                    <p><strong>Mensagem:</strong> ${c.mensagem}</p>
                    <p><strong>Data:</strong> ${new Date(c.data).toLocaleString('pt-BR')}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        list.innerHTML = '<div class="loading">Erro ao carregar contatos</div>';
    }
}

// ===================================
// MODAL
// ===================================
function openModal(title, content) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.add('active');
    
    // Inicializar event listeners para redes sociais após o modal ser aberto
    setTimeout(() => {
        initializeSocialNetworkListeners();
        initializeYouTubeUrlListener();
    }, 50);
}

function closeModal() {
    modal.classList.remove('active');
    editingItem = null;
    editingType = null;
}

function setupModal() {
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Funções para redes sociais dinâmicas
function addSocialNetwork() {
    const container = document.getElementById('social-networks-container');
    const socialNetworks = [
        'Discord', 'Guns.Lol', 'Instagram', 'Facebook', 'Twitter', 'TikTok', 'GitHub', 'LinkedIn', 'YouTube', 'Twitch', 'Telegram', 'WhatsApp', 'Snapchat', 'Koo', 'Reddit', 'Pinterest', 'Mastodon', 'Bluesky', 'Threads', 'Signal', 'WeChat', 'VK', 'Tumblr', 'Medium', 'Kick', 'BeReal', 'CashApp', 'Paypal.me', 'Linktree', 'OnlyFans', 'Steam', 'Xbox', 'PlayStation Network', 'Spotify', 'Rumble', 'Odysee', 'Minds', 'Gab', 'Parler', 'Truth Social', 'Nostr', 'Lemmy', 'Kbin', 'Matrix', 'Element', 'Revolt', 'Guilded', 'Teamspeak', 'Zoom', 'Google Meet', 'Skype', 'Line', 'KakaoTalk', 'ICQ', 'IRC', 'Slack'
    ];
    
    const index = container.children.length;
    const newRow = document.createElement('div');
    newRow.className = 'social-network-row';
    newRow.dataset.index = index;
    newRow.innerHTML = `
        <select class="social-network-select">
            ${socialNetworks.map(rede => `<option value="${rede}">${rede}</option>`).join('')}
        </select>
        <input type="text" class="social-network-input" placeholder="URL ou username">
        <button type="button" class="btn btn-remove-social" onclick="removeSocialNetwork(${index})">Remover</button>
    `;
    container.appendChild(newRow);
    
    // Adicionar event listeners para detecção automática de URL
    const input = newRow.querySelector('.social-network-input');
    const select = newRow.querySelector('.social-network-select');
    
    input.addEventListener('paste', (e) => handleSocialNetworkPaste(e, select, input));
    input.addEventListener('blur', () => handleSocialNetworkBlur(select, input));
    input.addEventListener('input', (e) => handleSocialNetworkInput(e, select, input));
    select.addEventListener('change', (e) => handleSocialNetworkSelectChange(e, select, input));
}

// Mapeamento de padrões de URL para redes sociais
const socialNetworkPatterns = {
    'Discord': [/discord\.com\/users\/(\w+)/, /discord\.gg\/(\w+)/, /discord\.com\/invite\/(\w+)/],
    'Guns.Lol': [/guns\.lol\/(\w+)/],
    'Instagram': [/instagram\.com\/(\w+)/, /instagram\.com\/@(\w+)/],
    'Facebook': [/facebook\.com\/(\w+)/, /fb\.com\/(\w+)/, /facebook\.com\/profile\.php\?id=(\d+)/],
    'Twitter': [/twitter\.com\/(\w+)/, /x\.com\/(\w+)/, /twitter\.com\/@(\w+)/, /x\.com\/@(\w+)/],
    'TikTok': [/tiktok\.com\/@?(\w+)/, /tiktok\.com\/@(\w+)/],
    'GitHub': [/github\.com\/(\w+)/],
    'LinkedIn': [/linkedin\.com\/in\/(\w+)/, /linkedin\.com\/company\/(\w+)/],
    'YouTube': [/youtube\.com\/@?(\w+)/, /youtube\.com\/c\/(\w+)/, /youtube\.com\/channel\/(\w+)/, /youtube\.com\/user\/(\w+)/],
    'Twitch': [/twitch\.tv\/(\w+)/],
    'Telegram': [/t\.me\/(\w+)/, /telegram\.me\/(\w+)/, /telegram\.org\/(\w+)/],
    'WhatsApp': [/wa\.me\/(\d+)/, /whatsapp\.com\/(\d+)/],
    'Snapchat': [/snapchat\.com\/add\/(\w+)/, /snapchat\.com\/(\w+)/],
    'Koo': [/kooapp\.com\/profile\/(\w+)/],
    'Reddit': [/reddit\.com\/user\/(\w+)/, /reddit\.com\/r\/(\w+)/],
    'Pinterest': [/pinterest\.com\/(\w+)/, /pinterest\.com\/@(\w+)/],
    'Mastodon': [/mastodon\.social\/@(\w+)/, /mastodon\.online\/@(\w+)/],
    'Bluesky': [/bsky\.app\/profile\/(\w+)/, /bsky\.app\/@(\w+)/],
    'Threads': [/threads\.net\/@?(\w+)/, /threads\.net\/@(\w+)/],
    'Signal': [/signal\.me\/#p\/(\w+)/],
    'WeChat': [/weixin\.qq\.com\/(\w+)/],
    'VK': [/vk\.com\/(\w+)/, /vk\.com\/id(\d+)/],
    'Tumblr': [/(\w+)\.tumblr\.com/, /tumblr\.com\/blog\/(\w+)/],
    'Medium': [/medium\.com\/@?(\w+)/],
    'Kick': [/kick\.com\/(\w+)/],
    'BeReal': [/bereal\.com\/@?(\w+)/],
    'CashApp': [/cash\.app\/\$?(\w+)/],
    'Paypal.me': [/paypal\.me\/(\w+)/],
    'Linktree': [/linktr\.ee\/(\w+)/],
    'OnlyFans': [/onlyfans\.com\/(\w+)/],
    'Steam': [/steamcommunity\.com\/id\/(\w+)/, /steamcommunity\.com\/profiles\/(\w+)/],
    'Xbox': [/xbox\.com\/(\w+)/],
    'PlayStation Network': [/psn\.profiles\.io\/(\w+)/],
    'Spotify': [/open\.spotify\.com\/user\/(\w+)/],
    'Rumble': [/rumble\.com\/user\/(\w+)/, /rumble\.com\/c\/(\w+)/],
    'Odysee': [/odysee\.com\/@?(\w+)/],
    'Minds': [/minds\.com\/(\w+)/],
    'Gab': [/gab\.com\/(\w+)/],
    'Parler': [/parler\.com\/profile\/(\w+)/],
    'Truth Social': [/truthsocial\.com\/@?(\w+)/],
    'Nostr': [/nostr\.npub1(\w+)/],
    'Lemmy': [/lemmy\.ml\/u\/(\w+)/],
    'Kbin': [/kbin\.social\/u\/(\w+)/],
    'Matrix': [/matrix\.to\/#\/@(\w+)/],
    'Element': [/element\.io\/#\/@(\w+)/],
    'Revolt': [/revolt\.chat\/@?(\w+)/],
    'Guilded': [/guilded\.gg\/(\w+)/],
    'Teamspeak': [/teamspeak\.com\/(\w+)/],
    'Zoom': [/zoom\.us\/j\/(\w+)/],
    'Google Meet': [/meet\.google\.com\/([a-z0-9-]+)/],
    'Skype': [/join\.skype\.com\/(\w+)/],
    'Line': [/line\.me\/(\w+)/],
    'KakaoTalk': [/open\.kakao\.com\/(\w+)/],
    'ICQ': [/icq\.com\/(\w+)/],
    'IRC': [/irc\.libera\.chat\/(\w+)/],
    'Slack': [/slack\.com\/(\w+)/]
};

function detectSocialNetwork(url) {
    // Normalizar URL para minúsculas
    const normalizedUrl = url.toLowerCase();
    
    for (const [network, patterns] of Object.entries(socialNetworkPatterns)) {
        for (const pattern of patterns) {
            const match = normalizedUrl.match(pattern);
            if (match) {
                return { network, username: match[1] };
            }
        }
    }
    return null;
}

function extractUsername(url) {
    const result = detectSocialNetwork(url);
    return result ? result.username : null;
}

function handleSocialNetworkPaste(e, select, input) {
    setTimeout(() => {
        const url = input.value.trim();
        if (url && (url.includes('://') || url.includes('.'))) {
            const result = detectSocialNetwork(url);
            if (result) {
                // Selecionar automaticamente a rede social detectada
                select.value = result.network;
                // Preencher com o username extraído
                input.value = '@' + result.username;
                // Marcar como preenchido automaticamente e armazenar rede detectada
                input.dataset.autoFilled = 'true';
                input.dataset.detectedNetwork = result.network;
                input.dataset.lastValue = input.value;
            }
        }
    }, 100);
}

function handleSocialNetworkBlur(select, input) {
    const value = input.value.trim();
    if (value && (value.includes('://') || value.includes('.'))) {
        const result = detectSocialNetwork(value);
        if (result) {
            // Selecionar automaticamente a rede social detectada
            select.value = result.network;
            // Preencher com o username extraído
            input.value = '@' + result.username;
            // Marcar como preenchido automaticamente e armazenar rede detectada
            input.dataset.autoFilled = 'true';
            input.dataset.detectedNetwork = result.network;
            input.dataset.lastValue = input.value;
        }
    }
}

function handleSocialNetworkInput(e, select, input) {
    const value = input.value.trim();
    
    // Se já foi preenchido automaticamente e o usuário está tentando editar manualmente (não é paste)
    if (input.dataset.autoFilled === 'true' && !e.clipboardData && !e.inputType?.includes('insertFromPaste')) {
        // Reverter para o valor anterior
        e.preventDefault();
        input.value = input.dataset.lastValue || '';
        return;
    }
    
    if (value && (value.includes('://') || value.includes('.'))) {
        const result = detectSocialNetwork(value);
        if (result) {
            // Selecionar automaticamente a rede social detectada
            select.value = result.network;
            // Preencher com o username extraído
            input.value = '@' + result.username;
            // Marcar como preenchido automaticamente e armazenar rede detectada
            input.dataset.autoFilled = 'true';
            input.dataset.detectedNetwork = result.network;
            input.dataset.lastValue = input.value;
        }
    } else {
        // Se não é URL, permitir edição manual
        input.dataset.autoFilled = 'false';
        input.dataset.detectedNetwork = '';
        input.dataset.lastValue = input.value;
    }
}

function removeSocialNetwork(index) {
    const container = document.getElementById('social-networks-container');
    const row = container.querySelector(`[data-index="${index}"]`);
    if (row) {
        row.remove();
    }
}

// ===================================
// REDES SOCIAIS
// ===================================
async function loadRedesSociais() {
    const list = document.getElementById('redes-sociais-list');
    list.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const response = await fetch('/api/redes-sociais');
        const redes = await response.json();
        
        if (redes.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-share-alt"></i></div>
                    <h3>Nenhuma rede social cadastrada</h3>
                    <p>Clique em "Adicionar Rede" para começar</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = redes.map(r => `
            <div class="item-card">
                <div class="item-info">
                    <h3>${r.plataforma}</h3>
                    <p><strong>URL:</strong> ${r.url}</p>
                    <p><strong>Descrição:</strong> ${r.descricao || 'Sem descrição'}</p>
                    <p><strong>Ordem:</strong> ${r.ordem}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-action btn-edit" onclick="editRede(${r.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteRede(${r.id})">Excluir</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar redes sociais:', error);
        list.innerHTML = '<div class="loading">Erro ao carregar redes sociais</div>';
    }
}

function setupRedesSociaisButtons() {
    document.getElementById('add-rede-btn').addEventListener('click', () => {
        editingItem = null;
        editingType = 'rede-social';
        openModal('Adicionar Rede Social', renderRedeForm());
    });
}

async function editRede(id) {
    try {
        const response = await fetch('/api/redes-sociais');
        const redes = await response.json();
        const rede = redes.find(r => r.id === id);
        
        if (rede) {
            editingItem = rede;
            editingType = 'rede-social';
            openModal('Editar Rede Social', renderRedeForm(rede));
        }
    } catch (error) {
        console.error('Erro ao carregar rede social:', error);
    }
}

async function deleteRede(id) {
    if (!confirm('Tem certeza que deseja excluir esta rede social?')) return;
    
    try {
        const response = await fetch(`/api/redes-sociais/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            loadRedesSociais();
        } else {
            alert('Erro ao excluir rede social');
        }
    } catch (error) {
        console.error('Erro ao excluir rede social:', error);
        alert('Erro ao excluir rede social');
    }
}

function renderRedeForm(rede = null) {
    const plataformas = [
        'Discord', 'Guns.Lol', 'Instagram', 'Facebook', 'Twitter', 'TikTok', 
        'GitHub', 'LinkedIn', 'YouTube', 'Twitch', 'Telegram', 'WhatsApp', 
        'Snapchat', 'Reddit', 'Pinterest', 'Mastodon', 'Bluesky', 'Threads', 
        'Signal', 'WeChat', 'VK', 'Tumblr', 'Medium', 'Kick', 'BeReal', 
        'CashApp', 'Paypal.me', 'Linktree', 'OnlyFans', 'Steam', 'Xbox', 
        'PlayStation Network', 'Spotify', 'Rumble', 'Odysee', 'Minds', 
        'Gab', 'Parler', 'Truth Social', 'Nostr', 'Lemmy', 'Kbin', 
        'Matrix', 'Element', 'Revolt', 'Guilded', 'Teamspeak', 'Zoom', 
        'Google Meet', 'Skype', 'Line', 'KakaoTalk', 'ICQ', 'IRC', 'Slack'
    ];
    
    const plataformaOptions = plataformas.map(p => 
        `<option value="${p}" ${rede?.plataforma === p ? 'selected' : ''}>${p}</option>`
    ).join('');
    
    return `
        <div class="form-group">
            <label>Plataforma</label>
            <select id="rede-plataforma">
                <option value="">Selecione uma plataforma</option>
                ${plataformaOptions}
            </select>
        </div>
        <div class="form-group">
            <label>URL</label>
            <input type="text" id="rede-url" value="${rede?.url || ''}" placeholder="https://...">
        </div>
        <div class="form-group">
            <label>Descrição</label>
            <input type="text" id="rede-descricao" value="${rede?.descricao || ''}" placeholder="Descrição da rede social">
        </div>
        <div class="form-group">
            <label>Ordem (para ordenação na página)</label>
            <input type="number" id="rede-ordem" value="${rede?.ordem || 0}" placeholder="0">
        </div>
        <div class="modal-actions">
            <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveRede()">Salvar</button>
        </div>
    `;
}

async function saveRede() {
    const plataforma = document.getElementById('rede-plataforma').value;
    const url = document.getElementById('rede-url').value;
    const descricao = document.getElementById('rede-descricao').value;
    const ordem = parseInt(document.getElementById('rede-ordem').value) || 0;
    
    if (!plataforma || !url) {
        alert('Plataforma e URL são obrigatórios');
        return;
    }
    
    const data = { plataforma, url, descricao, ordem };
    
    try {
        let response;
        if (editingItem) {
            response = await fetch(`/api/redes-sociais/${editingItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/redes-sociais', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            closeModal();
            loadRedesSociais();
        } else {
            alert('Erro ao salvar rede social');
        }
    } catch (error) {
        console.error('Erro ao salvar rede social:', error);
        alert('Erro ao salvar rede social');
    }
}
