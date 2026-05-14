/**
 * Newsletter.js
 * Consome a API WordPress REST da ACBrasil para popular a página de notícias.
 * Endpoint base: https://acbrasil.org.br/cms/wp-json/wp/v2/
 */

const API_BASE = 'https://acbrasil.org.br/cms/wp-json/wp/v2';
const PER_PAGE = 6;

// Estado global
const state = {
  currentPage: 1,
  totalPages: 1,
  totalPosts: 0,
  searchQuery: '',
  cache: new Map(),
};

// ─── UTILS ───────────────────────────────────────────────
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function stripTags(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getImageUrl(post) {
  // Tenta várias fontes de imagem
  if (post.uagb_featured_image_src?.medium?.[0]) {
    return post.uagb_featured_image_src.medium[0];
  }
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  return null;
}

function getCategoryNames(post) {
  if (post._embedded?.['wp:term']?.[0]) {
    return post._embedded['wp:term'][0].map(t => t.name);
  }
  return [];
}

function getAuthorName(post) {
  if (post._embedded?.author?.[0]?.name) {
    return post._embedded.author[0].name;
  }
  return 'ACBrasil';
}

function getExcerpt(post, maxLen = 160) {
  const raw = stripTags(decodeHTML(post.excerpt?.rendered || ''));
  return raw.length > maxLen ? raw.substring(0, maxLen).trim() + '…' : raw;
}

// ─── API ─────────────────────────────────────────────────
async function fetchPosts(page = 1, perPage = PER_PAGE, search = '') {
  const cacheKey = `${page}-${perPage}-${search}`;
  if (state.cache.has(cacheKey)) return state.cache.get(cacheKey);

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    _embed: 'true',
    orderby: 'date',
    order: 'desc',
  });

  if (search) params.set('search', search);

  try {
    const res = await fetch(`${API_BASE}/posts?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const posts = await res.json();
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    const totalPosts = parseInt(res.headers.get('X-WP-Total') || '0', 10);

    const result = { posts, totalPages, totalPosts };
    state.cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Erro ao carregar posts:', err);
    return { posts: [], totalPages: 1, totalPosts: 0 };
  }
}

// ─── RENDER: SEÇÃO CURADA (DESTAQUES) ────────────────────
async function renderCuratedSection() {
  const container = document.querySelector('.curated__container');
  if (!container) return;

  // Busca os 4 posts mais recentes para os destaques
  const { posts } = await fetchPosts(1, 4);
  if (posts.length === 0) return;

  // 3 cards top
  const gridTopHTML = posts.slice(0, 3).map((post, i) => {
    const title = decodeHTML(post.title.rendered);
    const categories = getCategoryNames(post);
    const tag = categories[0] || 'NOTÍCIA';
    const isHighlight = i === 2;

    if (isHighlight) {
      return `
        <div class="curated__card curated__card--highlight">
          <h3 class="curated__card-title curated__card-title--dark">${title}</h3>
          <a href="${post.link}" target="_blank" rel="noopener" class="curated__card-link curated__card-link--dark">LER MATÉRIA &rarr;</a>
        </div>
      `;
    }

    return `
      <div class="curated__card">
        <span class="curated__tag">${tag.toUpperCase()}</span>
        <h3 class="curated__card-title">${title}</h3>
        <a href="${post.link}" target="_blank" rel="noopener" class="curated__card-link">LER MATÉRIA &rarr;</a>
      </div>
    `;
  }).join('');

  // Feature principal (4º post, ou o 1º se só tiver 3)
  const featurePost = posts[3] || posts[0];
  const featureImg = getImageUrl(featurePost);
  const featureTitle = decodeHTML(featurePost.title.rendered);
  const featureDesc = getExcerpt(featurePost, 200);
  const featureCategories = getCategoryNames(featurePost);

  const featureHTML = `
    <div class="curated__feature">
      <div class="curated__feature-image">
        ${featureImg
          ? `<img src="${featureImg}" alt="${featureTitle}" class="curated__feature-img" loading="lazy" />`
          : '<div class="curated__feature-placeholder"></div>'
        }
      </div>
      <div class="curated__feature-content">
        <h3 class="curated__feature-title">${featureTitle}</h3>
        <p class="curated__feature-desc">${featureDesc}</p>
        <div class="curated__feature-tags">
          ${featureCategories.map(c => `<span class="curated__feature-tag">${c.toUpperCase()}</span>`).join('')}
        </div>
        <a href="${featurePost.link}" target="_blank" rel="noopener" class="curated__card-link" style="margin-top:12px;display:inline-block;">LER MATÉRIA &rarr;</a>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="curated__grid-top">${gridTopHTML}</div>
    ${featureHTML}
  `;
}

// ─── RENDER: GRID DE ARQUIVO ─────────────────────────────
function renderArchiveGrid(posts) {
  const grid = document.getElementById('archiveGrid');
  if (!grid) return;

  if (posts.length === 0) {
    grid.innerHTML = `
      <div class="archive__empty" style="grid-column:1/-1;text-align:center;padding:60px 20px;">
        <i class="fa-solid fa-newspaper" style="font-size:2.5rem;color:var(--cor-cinza-texto);opacity:0.4;margin-bottom:16px;display:block;"></i>
        <p style="color:var(--cor-cinza-texto);font-size:var(--texto-base);">Nenhuma publicação encontrada.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = posts.map((post, i) => {
    const title = decodeHTML(post.title.rendered);
    const date = formatDate(post.date);
    const img = getImageUrl(post);
    const edition = state.totalPosts - ((state.currentPage - 1) * PER_PAGE + i);

    return `
      <article class="archive__card" data-edition="${edition}">
        <a href="${post.link}" target="_blank" rel="noopener" class="archive__card-link-wrapper">
          <div class="archive__card-info">
            <span class="archive__edition">ED. #${edition > 0 ? edition : i + 1}</span>
            <h3 class="archive__card-title">${title}</h3>
            <span class="archive__date">${date}</span>
          </div>
          <div class="archive__card-image">
            ${img
              ? `<img src="${img}" alt="${title}" class="archive__card-img" loading="lazy" />`
              : '<div class="archive__card-placeholder"></div>'
            }
          </div>
        </a>
      </article>
    `;
  }).join('');

  // Animação de entrada
  grid.querySelectorAll('.archive__card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      
      // Remove o transform inline após a animação para não conflitar com o hover do CSS
      setTimeout(() => {
        card.style.transform = '';
      }, 500);
    }, i * 80);
  });
}

// ─── RENDER: PAGINAÇÃO ───────────────────────────────────
function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;

  const { currentPage, totalPages } = state;
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let pages = [];

  // Lógica de páginas visíveis
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  container.innerHTML = pages.map(p => {
    if (p === '...') {
      return '<span class="archive__page-ellipsis">...</span>';
    }
    const active = p === currentPage ? ' archive__page-btn--active' : '';
    return `<button class="archive__page-btn${active}" data-page="${p}">${p}</button>`;
  }).join('') + `
    <button class="archive__page-btn archive__page-btn--arrow" data-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>&rarr;</button>
  `;

  // Event listeners
  container.querySelectorAll('.archive__page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.page;
      if (val === 'next') {
        if (state.currentPage < state.totalPages) loadArchive(state.currentPage + 1);
      } else {
        loadArchive(parseInt(val, 10));
      }
    });
  });
}

// ─── LOAD ARCHIVE (página + render) ──────────────────────
async function loadArchive(page = 1) {
  state.currentPage = page;

  // Scroll suave até o archive
  const archiveSection = document.getElementById('archive');
  if (archiveSection && page > 1) {
    archiveSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Loading state
  const grid = document.getElementById('archiveGrid');
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
        <div class="archive__loading-spinner"></div>
        <p style="color:var(--cor-cinza-texto);margin-top:16px;">Carregando publicações...</p>
      </div>
    `;
  }

  const { posts, totalPages, totalPosts } = await fetchPosts(page, PER_PAGE, state.searchQuery);

  state.totalPages = totalPages;
  state.totalPosts = totalPosts;

  renderArchiveGrid(posts);
  renderPagination();
}

// ─── BUSCA ───────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.searchQuery = input.value.trim();
      state.cache.clear(); // Limpa cache ao buscar
      loadArchive(1);
    }, 400);
  });
}

// ─── INIT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Renderiza seções em paralelo
  await Promise.all([
    renderCuratedSection(),
    loadArchive(1),
  ]);

  initSearch();
});
