/**
 * script.js - Lógica principal do site ACBrasil
 * Gerencia a busca de indicadores econômicos e artigos do WordPress com tratamento de erros.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a busca de dados assim que o DOM estiver carregado
    fetchEconomicIndicators();
    fetchArticles();
    
    // Configura o botão de "Voltar ao Topo" para realizar uma rolagem suave até o início da página
    // O uso do "?." evita erros caso o botão não exista na página atual
    document.getElementById('backToTop')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

/**
 * Busca indicadores econômicos das APIs HG Brasil e Banco Central (SGS)
 */
async function fetchEconomicIndicators() {
    const container = document.getElementById('indicators-container');
    if (!container) return; // Sai silenciosamente se o container não estiver na página
    
    try {
        // 1. Busca dados da HG Brasil (Ibovespa, Dólar, Euro)
        const hgResponse = await fetch('https://api.hgbrasil.com/finance?format=json-cors&key=a9410b9f');
        const hgData = await hgResponse.json();
        
        // 2. Busca dados do Banco Central (Selic, CDI, IPCA) via Sistema Gerenciador de Séries Temporais (SGS)
        // Buscamos os últimos 2 registros para calcular a variação recente
        
        // Selic Meta (Série 432)
        const selicResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/2?formato=json');
        const selicData = await selicResponse.json();
        const selicCurrent = parseFloat(selicData[1].valor);
        const selicVariation = selicCurrent - parseFloat(selicData[0].valor);
        
        // CDI Anualizada (Série 4389)
        const cdiResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/2?formato=json');
        const cdiData = await cdiResponse.json();
        const cdiCurrent = parseFloat(cdiData[1].valor);
        const cdiVariation = cdiCurrent - parseFloat(cdiData[0].valor);
        
        // IPCA Acumulado 12 meses (Série 13522)
        const ipcaResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/2?formato=json');
        const ipcaData = await ipcaResponse.json();
        const ipcaCurrent = parseFloat(ipcaData[1].valor);
        const ipcaVariation = ipcaCurrent - parseFloat(ipcaData[0].valor);

        // Processa e organiza os dados para renderização
        const results = hgData.results;
        
        const indicators = [
            {
                name: 'Ibovespa',
                value: formatNumber(results.stocks.IBOVESPA.points),
                variation: results.stocks.IBOVESPA.variation,
                unit: ' pts'
            },
            {
                name: 'Dólar',
                value: formatCurrency(results.currencies.USD.buy),
                variation: results.currencies.USD.variation,
                unit: ''
            },
            {
                name: 'CDI',
                value: formatPercent(cdiCurrent),
                variation: cdiVariation,
                unit:''
            },
            {
                name: 'IPCA (12m)',
                value: formatPercent(ipcaCurrent),
                variation: ipcaVariation,
                unit: ''
            },
            {
                name: 'Selic',
                value: formatPercent(selicCurrent),
                variation: selicVariation,
                unit: ''
            }
        ];

        renderIndicators(container, indicators);

    } catch (error) {
        console.error('Erro ao buscar indicadores:', error);
        container.innerHTML = '<p style="color: red; grid-column: 1/-1;">Erro ao carregar dados do mercado. Tente novamente mais tarde.</p>';
    }
}

/**
 * Renderiza os cards de indicadores na tela
 */
function renderIndicators(container, indicators) {
    if (!container) return;
    container.innerHTML = ''; // Limpa os skeletons de carregamento

    indicators.forEach(ind => {
        const card = document.createElement('div');
        card.className = 'indicator-card';
        
        let variationHtml = '';
        if (ind.variation !== null && ind.variation !== undefined) {
            const isPositive = ind.variation > 0;
            const isNegative = ind.variation < 0;
            const sign = isPositive ? '+' : '';
            const colorClass = isPositive ? 'variation-positive' : (isNegative ? 'variation-negative' : '');
            const icon = isPositive ? '<i class="fas fa-caret-up"></i>' : (isNegative ? '<i class="fas fa-caret-down"></i>' : '-');
            
            variationHtml = `<div class="indicator-variation ${colorClass}">
                                ${icon} ${sign}${ind.variation.toFixed(2).replace('.', ',')}%
                             </div>`;
        } else {
            variationHtml = `<div class="indicator-variation" style="color: #999;">--</div>`;
        }

        card.innerHTML = `
            <div class="indicator-name">${ind.name}</div>
            <div class="indicator-value">${ind.value}${ind.unit}</div>
            ${variationHtml}
        `;
        
        container.appendChild(card);
    });

    // Atualiza o texto de "última atualização"
    const updateText = document.getElementById('update-rate-text');
    if (updateText) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        updateText.innerHTML = `Atualizado hoje às ${timeString}`;
    }
}

/**
 * Funções auxiliares de formatação
 */
function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function formatPercent(num) {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + '%';
}

// ==========================================================================
//   WordPress API - Artigos da ACBrasil
// ==========================================================================

const WP_API_BASE = 'https://acbrasil.org.br/cms/wp-json/wp/v2';

/**
 * Busca os últimos 3 posts do WordPress da ACBrasil
 */
async function fetchArticles() {
    const container = document.getElementById('articles-container');
    if (!container) return; // Proteção: evita erro se o elemento não existir na página
    
    try {
        const response = await fetch(`${WP_API_BASE}/posts?_embed&per_page=10&categories=20`);
        const posts = await response.json();

        if (!posts || posts.length === 0) {
            container.innerHTML = '<p style="grid-column:1/-1;color:var(--text-muted);">Nenhum artigo encontrado.</p>';
            return;
        }

        renderArticles(container, posts);

    } catch (error) {
        console.error('Erro ao buscar artigos:', error);
        container.innerHTML = '<p style="grid-column:1/-1;color:var(--danger-color);">Erro ao carregar artigos. Tente novamente mais tarde.</p>';
    }
}

/**
 * Renderiza os artigos no grid
 */
function renderArticles(container, posts) {
    if (!container) return;
    container.innerHTML = '';

    posts.forEach(post => {
        const card = document.createElement('article');
        card.className = 'article-card';
        
        const imgUrl = getFeaturedImage(post, 'medium_large');
        const category = getCategory(post);
        const excerpt = stripHtml(post.excerpt.rendered).substring(0, 150) + '...';
        const dateStr = formatDatePtBR(post.date);

        card.innerHTML = `
            <a href="${post.link}" target="_blank" class="article-image">
                <img src="${imgUrl}" alt="${decodeHtml(post.title.rendered)}" loading="lazy">
            </a>
            <div class="article-content">
                <span class="category">${category}</span>
                <a href="${post.link}" target="_blank"><h3>${decodeHtml(post.title.rendered)}</h3></a>
                <p>${excerpt}</p>
                <span class="date">${dateStr}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Helpers para a WP-API
 */

function getFeaturedImage(post, size) {
    try {
        const media = post._embedded['wp:featuredmedia'];
        if (media && media[0]) {
            const sizes = media[0].media_details?.sizes;
            if (sizes && sizes[size]) {
                return sizes[size].source_url;
            }
            return media[0].source_url;
        }
    } catch (e) { }
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%2364748b%22 font-family=%22sans-serif%22 font-size=%2216%22%3ESem imagem%3C/text%3E%3C/svg%3E';
}

function getCategory(post) {
    try {
        const terms = post._embedded['wp:term'];
        if (terms && terms[0] && terms[0].length > 0) {
            return terms[0][0].name;
        }
    } catch (e) { }
    return 'Artigo';
}

// Remove tags HTML de strings (ex: excerpts)
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Decodifica entidades HTML em texto comum (ex: &nbsp;, &aacute;)
function decodeHtml(html) {
    const tmp = document.createElement('textarea');
    tmp.innerHTML = html;
    return tmp.value;
}

// Formata data do WordPress para o padrão brasileiro
function formatDatePtBR(dateString) {
    const date = new Date(dateString);
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${date.getDate().toString().padStart(2, '0')} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}
