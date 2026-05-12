document.addEventListener('DOMContentLoaded', () => {
    fetchEconomicIndicators();
    fetchArticles();
    
    // Back to top smooth scroll
    document.getElementById('backToTop').addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

async function fetchEconomicIndicators() {
    const container = document.getElementById('indicators-container');
    
    try {
        // Fetch HG Brasil Data (Ibovespa, Dolar, Euro)
        // Using json-cors to bypass CORS on the free tier if accessed from browser directly
        const hgResponse = await fetch('https://api.hgbrasil.com/finance?format=json-cors');
        const hgData = await hgResponse.json();
        
        // Fetch Banco Central Data (Selic, CDI, IPCA)
        // Fetching last 2 periods to calculate variation
        // Selic Meta
        const selicResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/2?formato=json');
        const selicData = await selicResponse.json();
        const selicCurrent = parseFloat(selicData[1].valor);
        const selicVariation = selicCurrent - parseFloat(selicData[0].valor);
        
        // CDI (Anualizada)
        const cdiResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/2?formato=json');
        const cdiData = await cdiResponse.json();
        const cdiCurrent = parseFloat(cdiData[1].valor);
        const cdiVariation = cdiCurrent - parseFloat(cdiData[0].valor);
        
        // IPCA (Acumulado 12 meses)
        const ipcaResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/2?formato=json');
        const ipcaData = await ipcaResponse.json();
        const ipcaCurrent = parseFloat(ipcaData[1].valor);
        const ipcaVariation = ipcaCurrent - parseFloat(ipcaData[0].valor);

        // Process HG Data
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

function renderIndicators(container, indicators) {
    container.innerHTML = ''; // Clear skeletons

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
            // For rates that don't have a daily variation available
            variationHtml = `<div class="indicator-variation" style="color: #999;">--</div>`;
        }

        card.innerHTML = `
            <div class="indicator-name">${ind.name}</div>
            <div class="indicator-value">${ind.value}${ind.unit}</div>
            ${variationHtml}
        `;
        
        
        container.appendChild(card);
    });

    const updateText = document.getElementById('update-rate-text');
    if (updateText) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        updateText.innerHTML = `Atualizado hoje às ${timeString}`;
    }
}

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

async function fetchArticles() {
    const container = document.getElementById('articles-container');
    
    try {
        const response = await fetch(`${WP_API_BASE}/posts?per_page=3&_embed`);
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

function renderArticles(container, posts) {
    container.innerHTML = '';

    const featuredPost = posts[0];
    const sidePosts = posts.slice(1);

    // --- Artigo Destaque ---
    const featuredCard = document.createElement('article');
    featuredCard.className = 'article-card featured';
    
    const featuredImgUrl = getFeaturedImage(featuredPost, 'large');
    const featuredCategory = getCategory(featuredPost);
    const featuredExcerpt = stripHtml(featuredPost.excerpt.rendered).substring(0, 200) + '...';
    const featuredAuthor = getAuthorName(featuredPost);
    const featuredAvatar = getAuthorAvatar(featuredPost);

    featuredCard.innerHTML = `
        <a href="${featuredPost.link}" target="_blank" class="article-image">
            <img src="${featuredImgUrl}" alt="${decodeHtml(featuredPost.title.rendered)}" loading="lazy">
        </a>
        <div class="article-content">
            <span class="category">${featuredCategory}</span>
            <a href="${featuredPost.link}" target="_blank"><h3>${decodeHtml(featuredPost.title.rendered)}</h3></a>
            <p>${featuredExcerpt}</p>
            <div class="author">
                <img src="${featuredAvatar}" alt="${featuredAuthor}" class="author-avatar">
                <span>${featuredAuthor}</span>
            </div>
        </div>
    `;
    container.appendChild(featuredCard);

    // --- Artigos Laterais ---
    if (sidePosts.length > 0) {
        const listDiv = document.createElement('div');
        listDiv.className = 'articles-list';

        sidePosts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'article-card small';

            const imgUrl = getFeaturedImage(post, 'medium');
            const dateStr = formatDatePtBR(post.date);
            const excerpt = stripHtml(post.excerpt.rendered).substring(0, 120) + '...';

            card.innerHTML = `
                <a href="${post.link}" target="_blank" class="article-image">
                    <img src="${imgUrl}" alt="${decodeHtml(post.title.rendered)}" loading="lazy">
                </a>
                <div class="article-content">
                    <span class="date">${dateStr}</span>
                    <a href="${post.link}" target="_blank"><h3>${decodeHtml(post.title.rendered)}</h3></a>
                    <p>${excerpt}</p>
                </div>
            `;
            listDiv.appendChild(card);
        });

        container.appendChild(listDiv);
    }
}

// --- Helpers para WordPress ---

function getFeaturedImage(post, size) {
    try {
        const media = post._embedded['wp:featuredmedia'];
        if (media && media[0]) {
            // Tenta pegar o tamanho desejado primeiro
            const sizes = media[0].media_details?.sizes;
            if (sizes && sizes[size]) {
                return sizes[size].source_url;
            }
            // Fallback para source_url geral
            return media[0].source_url;
        }
    } catch (e) { /* ignora */ }
    // Fallback placeholder
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%2364748b%22 font-family=%22sans-serif%22 font-size=%2216%22%3ESem imagem%3C/text%3E%3C/svg%3E';
}

function getCategory(post) {
    try {
        const terms = post._embedded['wp:term'];
        if (terms && terms[0] && terms[0].length > 0) {
            return terms[0][0].name;
        }
    } catch (e) { /* ignora */ }
    return 'Artigo';
}

function getAuthorName(post) {
    try {
        if (post.uagb_author_info?.display_name) {
            return post.uagb_author_info.display_name;
        }
        const author = post._embedded?.author;
        if (author && author[0]) {
            return author[0].name;
        }
    } catch (e) { /* ignora */ }
    return 'ACBrasil';
}

function getAuthorAvatar(post) {
    try {
        const author = post._embedded?.author;
        if (author && author[0]?.avatar_urls) {
            return author[0].avatar_urls['96'] || author[0].avatar_urls['48'];
        }
    } catch (e) { /* ignora */ }
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Ccircle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23e2e8f0%22/%3E%3C/svg%3E';
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function decodeHtml(html) {
    const tmp = document.createElement('textarea');
    tmp.innerHTML = html;
    return tmp.value;
}

function formatDatePtBR(dateString) {
    const date = new Date(dateString);
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${date.getDate().toString().padStart(2, '0')} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}
