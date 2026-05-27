// ===================================
// SASUCRILHOS - Main JavaScript
// ===================================

// Carregar Dubladores da API
async function carregarDubladores() {
    try {
        const response = await fetch('/api/dubladores');
        const dubladores = await response.json();
        
        // Armazenar todos os dubladores para filtragem
        window.allTeamMembers = dubladores;
        
        // Renderizar todos inicialmente
        renderTeamMembers(dubladores);
        
        // Configurar tabs de categoria
        setupCategoryTabs();
        
        // Ativar scroll reveal nos cards carregados
        initScrollReveal();
    } catch (error) {
        console.error('Erro ao carregar dubladores:', error);
        document.getElementById('dubladores-grid').innerHTML = '<p class="loading">Erro ao carregar membros da equipe. Tente novamente mais tarde.</p>';
    }
}

// Renderizar membros da equipe
function renderTeamMembers(members) {
    const grid = document.getElementById('dubladores-grid');
    grid.innerHTML = '';
    
    members.forEach(membro => {
        const card = document.createElement('div');
        card.className = 'dublador-card';
        
        // Determinar os rótulos das categorias
        const categoriaLabels = {
            'dublador': 'Dublador',
            'artista': 'Artista',
            'mixador': 'Mixador',
            'editor': 'Editor',
            'programador': 'Programador'
        };
        
        // Garantir que categorias seja um array
        const categorias = Array.isArray(membro.categorias) ? membro.categorias : (membro.categorias ? JSON.parse(membro.categorias) : ['dublador']);
        
        // Criar badges para cada categoria
        const badgesHTML = categorias.map(cat => {
            const label = categoriaLabels[cat] || cat;
            return `<span class="dublador-categoria-badge">${label}</span>`;
        }).join('');
        
        // Determinar se é dublador
        const isDublador = categorias.includes('dublador');
        
        // Garantir que personagens e especialidades sejam arrays
        const personagens = Array.isArray(membro.personagens) ? membro.personagens : [];
        const especialidades = Array.isArray(membro.especialidades) ? membro.especialidades : [];
        
        // Construir HTML de personagens e especialidades
        let skillsHTML = '';
        
        if (personagens.length > 0) {
            skillsHTML += `
                <div class="dublador-personagens">
                    <h4>Personagens</h4>
                    <ul>
                        ${personagens.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (especialidades.length > 0) {
            skillsHTML += `
                <div class="dublador-especialidades">
                    <h4>Especialidades</h4>
                    <ul>
                        ${especialidades.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        card.innerHTML = `
            <h3 class="dublador-nome">${membro.nome}</h3>
            <div class="dublador-categoria-badges">${badgesHTML}</div>
            ${skillsHTML}
            <div class="dublador-redes">
                <h4>Redes Sociais</h4>
                ${membro.redes_sociais && membro.redes_sociais.length > 0 ? membro.redes_sociais.map(rs => {
                    const icon = getSocialIcon(rs.rede);
                    const url = getSocialUrl(rs.rede, rs.usuario);
                    return `<a href="${url}" target="_blank" class="social-link ${rs.rede.toLowerCase()}-link"><i class="${icon}"></i> ${rs.usuario}</a>`;
                }).join('') : '<p class="no-socials">Nenhuma rede social cadastrada</p>'}
            </div>
            <p class="dublador-curiosidade">"${membro.curiosidade}"</p>
        `;
        grid.appendChild(card);
    });
}

// Função para obter ícone da rede social
function getSocialIcon(rede) {
    const icons = {
        'Discord': 'fab fa-discord',
        'Guns.Lol': 'fas fa-gun',
        'Twitter': 'fab fa-twitter',
        'Instagram': 'fab fa-instagram',
        'Facebook': 'fab fa-facebook',
        'YouTube': 'fab fa-youtube',
        'TikTok': 'fab fa-tiktok',
        'Twitch': 'fab fa-twitch',
        'GitHub': 'fab fa-github',
        'LinkedIn': 'fab fa-linkedin',
        'Telegram': 'fab fa-telegram',
        'WhatsApp': 'fab fa-whatsapp',
        'Snapchat': 'fab fa-snapchat',
        'Reddit': 'fab fa-reddit',
        'Pinterest': 'fab fa-pinterest',
        'Mastodon': 'fab fa-mastodon',
        'Bluesky': 'fas fa-cloud',
        'Threads': 'fab fa-threads',
        'Signal': 'fas fa-signal',
        'WeChat': 'fab fa-weixin',
        'VK': 'fab fa-vk',
        'Tumblr': 'fab fa-tumblr',
        'Medium': 'fab fa-medium',
        'Kick': 'fas fa-k',
        'BeReal': 'fas fa-camera',
        'CashApp': 'fas fa-dollar-sign',
        'Paypal.me': 'fab fa-paypal',
        'Linktree': 'fas fa-link',
        'OnlyFans': 'fas fa-star',
        'Steam': 'fab fa-steam',
        'Xbox': 'fab fa-xbox',
        'PlayStation Network': 'fab fa-playstation',
        'Spotify': 'fab fa-spotify',
        'Rumble': 'fas fa-video',
        'Odysee': 'fas fa-play-circle',
        'Minds': 'fas fa-brain',
        'Gab': 'fas fa-comment',
        'Parler': 'fas fa-comment-dots',
        'Truth Social': 'fas fa-check-circle',
        'Nostr': 'fas fa-fingerprint',
        'Lemmy': 'fas fa-leaf',
        'Kbin': 'fas fa-cube',
        'Matrix': 'fas fa-matrix',
        'Element': 'fas fa-element',
        'Revolt': 'fas fa-revolt',
        'Guilded': 'fas fa-shield-alt',
        'Teamspeak': 'fas fa-headset',
        'Zoom': 'fas fa-video',
        'Google Meet': 'fab fa-google',
        'Skype': 'fab fa-skype',
        'Line': 'fab fa-line',
        'KakaoTalk': 'fas fa-comment',
        'ICQ': 'fas fa-message',
        'IRC': 'fas fa-hashtag',
        'Slack': 'fab fa-slack',
        'Koo': 'fas fa-feather'
    };
    return icons[rede] || 'fas fa-link';
}

// Função para obter URL da rede social
function getSocialUrl(rede, usuario) {
    // Remover @ se presente
    const cleanUser = usuario.replace('@', '');
    
    const urls = {
        'Discord': `https://discord.com/users/${cleanUser}`,
        'Guns.Lol': `https://guns.lol/${cleanUser}`,
        'Twitter': `https://twitter.com/${cleanUser}`,
        'Instagram': `https://instagram.com/${cleanUser}`,
        'Facebook': `https://facebook.com/${cleanUser}`,
        'YouTube': `https://youtube.com/${cleanUser}`,
        'TikTok': `https://tiktok.com/@${cleanUser}`,
        'Twitch': `https://twitch.tv/${cleanUser}`,
        'GitHub': `https://github.com/${cleanUser}`,
        'LinkedIn': `https://linkedin.com/in/${cleanUser}`,
        'Telegram': `https://t.me/${cleanUser}`,
        'WhatsApp': `https://wa.me/${cleanUser}`,
        'Snapchat': `https://snapchat.com/add/${cleanUser}`,
        'Koo': `https://kooapp.com/profile/${cleanUser}`,
        'Reddit': `https://reddit.com/user/${cleanUser}`,
        'Pinterest': `https://pinterest.com/${cleanUser}`,
        'Mastodon': `https://mastodon.social/@${cleanUser}`,
        'Bluesky': `https://bsky.app/profile/${cleanUser}`,
        'Threads': `https://threads.net/${cleanUser}`,
        'Signal': `https://signal.me/#p/${cleanUser}`,
        'WeChat': `https://weixin.qq.com/${cleanUser}`,
        'VK': `https://vk.com/${cleanUser}`,
        'Tumblr': `https://${cleanUser}.tumblr.com`,
        'Medium': `https://medium.com/@${cleanUser}`,
        'Kick': `https://kick.com/${cleanUser}`,
        'BeReal': `https://bereal.com/@${cleanUser}`,
        'CashApp': `https://cash.app/$${cleanUser}`,
        'Paypal.me': `https://paypal.me/${cleanUser}`,
        'Linktree': `https://linktr.ee/${cleanUser}`,
        'OnlyFans': `https://onlyfans.com/${cleanUser}`,
        'Steam': `https://steamcommunity.com/id/${cleanUser}`,
        'Xbox': `https://xbox.com/${cleanUser}`,
        'PlayStation Network': `https://psnprofiles.io/${cleanUser}`,
        'Spotify': `https://open.spotify.com/user/${cleanUser}`,
        'Rumble': `https://rumble.com/user/${cleanUser}`,
        'Odysee': `https://odysee.com/@${cleanUser}`,
        'Minds': `https://minds.com/${cleanUser}`,
        'Gab': `https://gab.com/${cleanUser}`,
        'Parler': `https://parler.com/profile/${cleanUser}`,
        'Truth Social': `https://truthsocial.com/@${cleanUser}`,
        'Nostr': `https://nostr.com/${cleanUser}`,
        'Lemmy': `https://lemmy.ml/u/${cleanUser}`,
        'Kbin': `https://kbin.social/u/${cleanUser}`,
        'Matrix': `https://matrix.to/#/@${cleanUser}`,
        'Element': `https://element.io/#/@${cleanUser}`,
        'Revolt': `https://revolt.chat/@${cleanUser}`,
        'Guilded': `https://guilded.gg/${cleanUser}`,
        'Teamspeak': `https://teamspeak.com/${cleanUser}`,
        'Zoom': `https://zoom.us/j/${cleanUser}`,
        'Google Meet': `https://meet.google.com/${cleanUser}`,
        'Skype': `https://join.skype.com/${cleanUser}`,
        'Line': `https://line.me/${cleanUser}`,
        'KakaoTalk': `https://open.kakao.com/${cleanUser}`,
        'ICQ': `https://icq.com/${cleanUser}`,
        'IRC': `https://irc.libera.chat/${cleanUser}`,
        'Slack': `https://${cleanUser}.slack.com`
    };
    return urls[rede] || cleanUser;
}

// Configurar tabs de categoria
function setupCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover classe active de todas as tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Adicionar classe active à tab clicada
            tab.classList.add('active');
            
            // Filtrar membros por categoria
            const category = tab.dataset.category;
            
            if (category === 'all') {
                renderTeamMembers(window.allTeamMembers);
            } else {
                const filtered = window.allTeamMembers.filter(m => {
                    const categorias = Array.isArray(m.categorias) ? m.categorias : (m.categorias ? JSON.parse(m.categorias) : ['dublador']);
                    return categorias.includes(category);
                });
                renderTeamMembers(filtered);
            }
            
            // Reativar scroll reveal
            initScrollReveal();
        });
    });
}

// Carregar Episódios da API
async function carregarEpisodios() {
    try {
        const response = await fetch('/api/episodios');
        const episodios = await response.json();
        
        const grid = document.getElementById('episodios-grid');
        grid.innerHTML = '';
        
        episodios.forEach(episodio => {
            const card = document.createElement('div');
            card.className = 'episodio-card';
            
            // Usar thumbnail do YouTube ou ícone padrão
            const thumbnail = episodio.miniatura || '';
            const thumbnailHTML = thumbnail 
                ? `<div class="episodio-miniatura" style="background-image: url('${thumbnail}'); background-size: cover; background-position: center;"></div>`
                : `<div class="episodio-miniatura"><i class="fas fa-film"></i></div>`;
            
            // Link para o YouTube se disponível
            const watchButton = episodio.youtube_url 
                ? `<a href="${episodio.youtube_url}" target="_blank" class="episodio-btn">ASSISTIR NO YOUTUBE</a>`
                : `<a href="#" class="episodio-btn">ASSISTIR</a>`;
            
            card.innerHTML = `
                ${thumbnailHTML}
                <div class="episodio-info">
                    <h3 class="episodio-titulo">${episodio.titulo}</h3>
                    <p class="episodio-anime">${episodio.anime}</p>
                    <p class="episodio-data"><i class="far fa-calendar"></i> ${episodio.data} • <i class="far fa-clock"></i> ${episodio.duracao}</p>
                    <p class="episodio-descricao">${episodio.descricao}</p>
                    ${watchButton}
                </div>
            `;
            grid.appendChild(card);
        });
        
        // Ativar scroll reveal nos cards carregados
        initScrollReveal();
    } catch (error) {
        console.error('Erro ao carregar episódios:', error);
        document.getElementById('episodios-grid').innerHTML = '<p class="loading">Erro ao carregar episódios. Tente novamente mais tarde.</p>';
    }
}

// Carregar Redes Sociais da API
async function carregarRedesSociais() {
    try {
        const response = await fetch('/api/redes-sociais');
        const redes = await response.json();
        
        const grid = document.getElementById('redes-grid');
        grid.innerHTML = '';
        
        // Mapeamento de ícones Font Awesome para plataformas
        const iconMap = {
            'Discord': 'fab fa-discord',
            'Guns.Lol': 'fas fa-crosshairs',
            'Instagram': 'fab fa-instagram',
            'Facebook': 'fab fa-facebook',
            'Twitter': 'fab fa-twitter',
            'TikTok': 'fab fa-tiktok',
            'GitHub': 'fab fa-github',
            'LinkedIn': 'fab fa-linkedin',
            'YouTube': 'fab fa-youtube',
            'Twitch': 'fab fa-twitch',
            'Telegram': 'fab fa-telegram',
            'WhatsApp': 'fab fa-whatsapp',
            'Snapchat': 'fab fa-snapchat',
            'Reddit': 'fab fa-reddit',
            'Pinterest': 'fab fa-pinterest',
            'Mastodon': 'fab fa-mastodon',
            'Bluesky': 'fas fa-cloud',
            'Threads': 'fab fa-meta',
            'Signal': 'fab fa-signal',
            'WeChat': 'fab fa-weixin',
            'VK': 'fab fa-vk',
            'Tumblr': 'fab fa-tumblr',
            'Medium': 'fab fa-medium',
            'Kick': 'fas fa-bolt',
            'BeReal': 'fas fa-camera',
            'CashApp': 'fas fa-dollar-sign',
            'Paypal.me': 'fab fa-paypal',
            'Linktree': 'fas fa-tree',
            'OnlyFans': 'fas fa-star',
            'Steam': 'fab fa-steam',
            'Xbox': 'fab fa-xbox',
            'PlayStation Network': 'fab fa-playstation',
            'Spotify': 'fab fa-spotify',
            'Rumble': 'fas fa-video',
            'Odysee': 'fas fa-eye',
            'Minds': 'fas fa-brain',
            'Gab': 'fas fa-comment',
            'Parler': 'fas fa-comments',
            'Truth Social': 'fas fa-balance-scale',
            'Nostr': 'fas fa-fingerprint',
            'Lemmy': 'fab fa-linux',
            'Kbin': 'fas fa-cube',
            'Matrix': 'fas fa-matrix',
            'Element': 'fas fa-element',
            'Revolt': 'fas fa-revolt',
            'Guilded': 'fas fa-shield-alt',
            'Teamspeak': 'fas fa-headset',
            'Zoom': 'fas fa-video',
            'Google Meet': 'fab fa-google',
            'Skype': 'fab fa-skype',
            'Line': 'fab fa-line',
            'KakaoTalk': 'fas fa-comment-dots',
            'ICQ': 'fas fa-comment',
            'IRC': 'fas fa-hashtag',
            'Slack': 'fab fa-slack'
        };
        
        redes.forEach(rede => {
            const iconClass = iconMap[rede.plataforma] || 'fas fa-link';
            const card = document.createElement('a');
            card.href = rede.url;
            card.target = '_blank';
            card.className = 'rede-card';
            card.innerHTML = `
                <div class="rede-icon"><i class="${iconClass}"></i></div>
                <h3 class="rede-title">${rede.plataforma}</h3>
                <p class="rede-desc">${rede.descricao || ''}</p>
            `;
            grid.appendChild(card);
        });
        
        // Ativar scroll reveal nos cards carregados
        initScrollReveal();
    } catch (error) {
        console.error('Erro ao carregar redes sociais:', error);
        document.getElementById('redes-grid').innerHTML = '<p class="loading">Erro ao carregar redes sociais. Tente novamente mais tarde.</p>';
    }
}

// Scroll Reveal Animation
function initScrollReveal() {
    const elements = document.querySelectorAll('.dublador-card, .episodio-card, .rede-card, .timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Fechar menu ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Scroll to Top
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scroll-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.pointerEvents = 'auto';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.pointerEvents = 'none';
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Navbar Background on Scroll
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            navbar.style.backgroundColor = 'rgba(47, 56, 68, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.2)';
        } else {
            navbar.style.backgroundColor = 'rgba(47, 56, 68, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Formulário de Contato
function initContatoForm() {
    const form = document.getElementById('contato-form');
    const formMessage = document.getElementById('form-message');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            tipoParceria: document.getElementById('tipoParceria').value,
            mensagem: document.getElementById('mensagem').value
        };
        
        try {
            const response = await fetch('/api/contato', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                formMessage.className = 'form-message success';
                formMessage.textContent = data.message;
                form.reset();
            } else {
                formMessage.className = 'form-message error';
                formMessage.textContent = data.error || 'Erro ao enviar mensagem. Tente novamente.';
            }
            
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Erro ao enviar mensagem. Verifique sua conexão.';
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    });
}

// Smooth Scroll para Links de Âncora
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarDubladores();
    carregarEpisodios();
    carregarRedesSociais();
    initMobileMenu();
    initScrollToTop();
    initNavbarScroll();
    initContatoForm();
    initSmoothScroll();
});
