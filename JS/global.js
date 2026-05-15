/**
 * global.js — Funções reutilizáveis em todas as páginas
 * OBS: Deve ser carregado primeiro!
 * Módulos:
 *  - Utilitários gerais
 *  - Navbar (scroll + menu mobile)
 *  - Busca global com API WordPress
 *  - Animações de entrada via Intersection Observer
 *  - Toast de notificação
 *  - Link ativo na navbar
 *  - Barra de progresso de scroll
 *  - VLibras (acessibilidade em Libras)
 */

'use strict';

/* ==========================================================================
   UTILITÁRIOS
   ========================================================================== */

/**
 * Remove acentos e converte para minúsculas — usado na busca
 * @param {string} texto
 * @returns {string}
 */
const normalizarTexto = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Escapa caracteres HTML para evitar XSS
 * @param {string} texto
 * @returns {string}
 */
const escaparHTML = (texto) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

/**
 * Escapa caracteres especiais para uso em RegExp
 * @param {string} texto
 * @returns {string}
 */
const escaparRegex = (texto) =>
  texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ==========================================================================
   MÓDULO: NAVBAR
   ========================================================================== */

/**
 * Inicializa o comportamento da navbar:
 * — adiciona classe "rolando" quando a página é scrollada
 * — controla abertura/fechamento do menu mobile
 */
function inicializarNavbar() {
  const cabecalho     = document.getElementById('cabecalho');
  const btnMenuMobile = document.getElementById('btnMenuMobile');
  const menuMobile    = document.getElementById('menuMobile');

  if (!cabecalho || !btnMenuMobile || !menuMobile) return;

  const aoRolar = () => {
    cabecalho.classList.toggle('rolando', window.scrollY > 20);
  };

  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  btnMenuMobile.addEventListener('click', () => {
    const estaAberto = btnMenuMobile.classList.toggle('ativo');
    menuMobile.classList.toggle('ativo', estaAberto);
    btnMenuMobile.setAttribute('aria-expanded', String(estaAberto));
    menuMobile.setAttribute('aria-hidden', String(!estaAberto));
  });

  menuMobile.querySelectorAll('.menu-mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      btnMenuMobile.classList.remove('ativo');
      menuMobile.classList.remove('ativo');
      btnMenuMobile.setAttribute('aria-expanded', 'false');
      menuMobile.setAttribute('aria-hidden', 'true');
    });
  });

  document.addEventListener('click', (evento) => {
    if (
      menuMobile.classList.contains('ativo') &&
      !cabecalho.contains(evento.target)
    ) {
      btnMenuMobile.classList.remove('ativo');
      menuMobile.classList.remove('ativo');
      btnMenuMobile.setAttribute('aria-expanded', 'false');
      menuMobile.setAttribute('aria-hidden', 'true');
    }
  });
}

/* ==========================================================================
   MÓDULO: BUSCA GLOBAL (API WordPress)
   ========================================================================== */

/**
 * Inicializa a busca global:
 * — abre/fecha overlay
 * — consulta a API REST do WordPress em tempo real com debounce
 * — suporta atalhos de teclado (Ctrl+K, Escape)
 */
function inicializarBusca() {
  const btnBusca        = document.getElementById('btnBusca');
  const buscaOverlay    = document.getElementById('buscaOverlay');
  const buscaFechar     = document.getElementById('buscaFechar');
  const buscaInput      = document.getElementById('buscaInput');
  const buscaResultados = document.getElementById('buscaResultados');

  if (!btnBusca || !buscaOverlay || !buscaFechar || !buscaInput || !buscaResultados) return;

  const abrirBusca = () => {
    buscaOverlay.classList.add('ativo');
    buscaOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => buscaInput.focus(), 100);
  };

  const fecharBusca = () => {
    buscaOverlay.classList.remove('ativo');
    buscaOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    buscaInput.value = '';
    renderizarDica();
  };

  btnBusca.addEventListener('click', abrirBusca);
  buscaFechar.addEventListener('click', fecharBusca);

  buscaOverlay.addEventListener('click', (evento) => {
    if (evento.target === buscaOverlay) fecharBusca();
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && buscaOverlay.classList.contains('ativo')) {
      fecharBusca();
    }
    if ((evento.ctrlKey || evento.metaKey) && evento.key === 'k') {
      evento.preventDefault();
      buscaOverlay.classList.contains('ativo') ? fecharBusca() : abrirBusca();
    }
  });

  let debounceTimer = null;

  buscaInput.addEventListener('input', () => {
    const termo = buscaInput.value.trim();
    if (termo.length < 2) { renderizarDica(); return; }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      buscaResultados.innerHTML = '<p class="busca-dica">Buscando...</p>';

      try {
        const parametros = `search=${encodeURIComponent(termo)}&per_page=6&_fields=title,excerpt,link,type`;
        const [posts, paginas] = await Promise.all([
          fetch(`https://acbrasil.org.br/cms/wp-json/wp/v2/posts?${parametros}`).then(r => r.json()),
          fetch(`https://acbrasil.org.br/cms/wp-json/wp/v2/pages?${parametros}`).then(r => r.json()),
        ]);

        const resultados = [...posts, ...paginas].map((item) => ({
          titulo:    item.title.rendered,
          descricao: item.excerpt?.rendered?.replace(/<[^>]*>/g, '').slice(0, 100) + '...' || '',
          url:       item.link,
          icone:     item.type === 'post' ? 'fa-newspaper' : 'fa-file',
          tag:       item.type === 'post' ? 'Notícia' : 'Página',
        }));

        renderizarResultados(resultados, termo);
      } catch (erro) {
        buscaResultados.innerHTML = '<p class="busca-dica">Erro ao buscar. Tente novamente.</p>';
      }
    }, 300);
  });

  const renderizarDica = () => {
    buscaResultados.innerHTML = '<p class="busca-dica">Digite para buscar páginas e conteúdos do site.</p>';
  };

  const renderizarResultados = (resultados, termo) => {
    if (resultados.length === 0) {
      buscaResultados.innerHTML = `
        <div class="busca-sem-resultado">
          <i class="fa-solid fa-circle-question"></i>
          <p>Nenhum resultado encontrado para "<strong>${escaparHTML(termo)}</strong>"</p>
        </div>
      `;
      return;
    }

    buscaResultados.innerHTML = resultados
      .slice(0, 6)
      .map((item, indice) => `
        <a
          href="${item.url}"
          class="busca-resultado-item"
          style="animation-delay: ${indice * 50}ms"
          data-url="${item.url}"
        >
          <div class="busca-resultado-icone">
            <i class="fa-solid ${item.icone}"></i>
          </div>
          <div class="busca-resultado-conteudo">
            <div class="busca-resultado-titulo">${destacarTermo(item.titulo, termo)}</div>
            <div class="busca-resultado-descricao">${destacarTermo(item.descricao, termo)}</div>
          </div>
          <span class="busca-resultado-tag">${item.tag}</span>
        </a>
      `)
      .join('');

    buscaResultados.querySelectorAll('.busca-resultado-item').forEach((item) => {
      item.addEventListener('click', fecharBusca);
    });
  };

  const destacarTermo = (texto, termo) => {
    if (!termo) return escaparHTML(texto);
    const regex = new RegExp(`(${escaparRegex(termo)})`, 'gi');
    return escaparHTML(texto).replace(
      regex,
      '<mark style="background:rgba(200,151,42,0.25);color:inherit;border-radius:2px;">$1</mark>'
    );
  };

  renderizarDica();
}

/* ==========================================================================
   MÓDULO: ANIMAÇÕES DE ENTRADA (Intersection Observer)
   ========================================================================== */

/**
 * Observa elementos com a classe "animacao-entrada" e
 * adiciona "visivel" quando entram na viewport — anima apenas uma vez
 */
function inicializarAnimacoesEntrada() {
  const elementos = document.querySelectorAll('.animacao-entrada');
  if (!elementos.length) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  elementos.forEach((el) => observador.observe(el));
}

/* ==========================================================================
   MÓDULO: TOAST DE NOTIFICAÇÃO
   ========================================================================== */

/** @type {ReturnType<typeof setTimeout>|null} */
let toastTimeout = null;

/**
 * Exibe um toast de notificação temporário
 * @param {string} mensagem
 * @param {'sucesso'|'erro'|'info'} tipo
 * @param {number} duracao - em milissegundos
 */
function exibirToast(mensagem, tipo = 'info', duracao = 4000) {
  const toast   = document.getElementById('toast');
  if (!toast) return;

  const icone   = toast.querySelector('.toast-icone');
  const textoEl = toast.querySelector('.toast-mensagem');

  const mapaIcones = {
    sucesso: 'fa-circle-check',
    erro:    'fa-circle-exclamation',
    info:    'fa-circle-info',
  };

  toast.classList.remove('toast--sucesso', 'toast--erro', 'visivel');

  if (icone)   icone.className = `toast-icone fa-solid ${mapaIcones[tipo] || mapaIcones.info}`;
  if (textoEl) textoEl.textContent = mensagem;
  if (tipo !== 'info') toast.classList.add(`toast--${tipo}`);

  requestAnimationFrame(() => {
    toast.classList.add('visivel');
    toast.setAttribute('aria-hidden', 'false');
  });

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visivel');
    toast.setAttribute('aria-hidden', 'true');
  }, duracao);
}

/* ==========================================================================
   MÓDULO: LINK ATIVO NA NAVBAR
   ========================================================================== */

/**
 * Marca o link da navbar correspondente à página atual como ativo
 */
function inicializarLinkAtivo() {
  const caminho = window.location.pathname;

  document.querySelectorAll('.menu-link, .menu-mobile-link').forEach((link) => {
    const href = link.getAttribute('href');

    const eAtivo =
      caminho.endsWith(href) ||
      (href === 'index.html' && (caminho === '/' || caminho.endsWith('/')));

    link.classList.toggle('menu-link--ativo', eAtivo);
  });
}

/* ==========================================================================
   MÓDULO: BARRA DE PROGRESSO DE SCROLL
   ========================================================================== */

/**
 * Cria e atualiza a barra de progresso de scroll no topo da página
 */
function inicializarBarraProgresso() {
  const barra = document.createElement('div');
  barra.className = 'barra-progresso-scroll';
  barra.setAttribute('role', 'progressbar');
  barra.setAttribute('aria-label', 'Progresso de leitura da página');
  document.body.prepend(barra);

  const atualizarBarra = () => {
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso   = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    barra.style.width = `${Math.min(progresso, 100)}%`;
  };

  window.addEventListener('scroll', atualizarBarra, { passive: true });
  atualizarBarra();
}

/* ==========================================================================
   MÓDULO: VLIBRAS
   ========================================================================== */

/**
 * Carrega o script do VLibras dinamicamente e inicializa o widget
 */
function inicializarVLibras() {
  const script  = document.createElement('script');
  script.src    = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.onload = () => new window.VLibras.Widget('https://vlibras.gov.br/app');
  document.head.appendChild(script);
}

/* ==========================================================================
   INICIALIZAÇÃO GERAL — roda em todas as páginas
   ========================================================================== */

function injetarComponentesGlobais() {
  if (!document.getElementById('toast')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="toast" id="toast" role="alert" aria-live="assertive" aria-hidden="true">
        <i class="toast-icone fa-solid fa-circle-check"></i>
        <span class="toast-mensagem"></span>
      </div>
    `);
  }
  if (!document.querySelector('[vw]')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div vw class="enabled">
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>
      </div>
    `);
  }
  if (!document.querySelector('.back-to-top')) {
    document.body.insertAdjacentHTML('beforeend', `
      <button class="back-to-top" aria-label="Voltar ao topo">
        <i class="fa-solid fa-arrow-up"></i>
      </button>
    `);
  }
}

/* ==========================================================================
   MÓDULO: BOTÃO VOLTAR AO TOPO
   ========================================================================== */

/**
 * Controla a visibilidade do botão "voltar ao topo" e o scroll suave
 */
function inicializarBotaoTopo() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.style.opacity = '1';
      backToTopBtn.style.visibility = 'visible';
    } else {
      backToTopBtn.style.opacity = '0';
      backToTopBtn.style.visibility = 'hidden';
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injetarComponentesGlobais();
  inicializarNavbar();
  inicializarBusca();
  inicializarAnimacoesEntrada();
  inicializarLinkAtivo();
  inicializarBarraProgresso();
  inicializarBotaoTopo();
  inicializarVLibras();
});