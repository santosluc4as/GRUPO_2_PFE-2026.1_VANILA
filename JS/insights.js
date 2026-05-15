/**
 * insights.js — Funcionalidades dinâmicas da página de Insights
 * - Busca dados da API do WordPress da ACB Brasil
 * - Renderiza cards e post de destaque
 * - Filtros e busca local
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'https://acbrasil.org.br/cms/wp-json/wp/v2';
  
  const gridArtigos = document.getElementById('gridInsights');
  const featuredContainer = document.getElementById('featuredContainer');
  const botoesFiltro = document.querySelectorAll('.btn-filtro');
  const inputBuscaLocal = document.querySelector('.busca-arquivo input');
  const formNewsletter = document.querySelector('.newsletter-form');

  let todosArtigos = [];

  /**
   * Busca artigos na API do WordPress
   */
  async function buscarPosts() {
    try {
      const response = await fetch(`${API_BASE}/posts?_embed&per_page=10&categories=20`);
      if (!response.ok) throw new Error('Falha ao buscar posts');
      
      const posts = await response.json();
      todosArtigos = posts.map(post => ({
        id: post.id,
        titulo: post.title.rendered,
        resumo: post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
        data: new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        link: post.link,
        imagem: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800',
        categoria: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Geral'
      }));

      renderizarConteudo();
    } catch (error) {
      console.error('Erro:', error);
      if (gridArtigos) gridArtigos.innerHTML = '<p class="erro-api">Não foi possível carregar os artigos no momento.</p>';
    }
  }

  /**
   * Renderiza o post de destaque e o grid
   */
  function renderizarConteudo(artigosFiltrados = todosArtigos) {
    if (artigosFiltrados.length === 0) {
      gridArtigos.innerHTML = '<p class="sem-resultados">Nenhum artigo encontrado.</p>';
      return;
    }

    // Post de Destaque (sempre o primeiro da lista geral no hero)
    if (featuredContainer && artigosFiltrados === todosArtigos) {
      const destaque = todosArtigos[0];
      featuredContainer.innerHTML = `
        <div class="featured-grid">
          <div class="featured-imagem-wrapper">
            <img src="${destaque.imagem}" alt="${destaque.titulo}" class="featured-imagem">
          </div>
          <div class="featured-card">
            <div class="featured-header">
              <span class="tag-destaque">Destaque</span>
              <span class="featured-data">${destaque.data}</span>
            </div>
            <h2 class="featured-titulo">${destaque.titulo}</h2>
            <p class="featured-snippet">${destaque.resumo}</p>
            <a href="${destaque.link}" class="featured-link">Ler Artigo Completo <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      `;
    }

    // Grid de Artigos (do segundo em diante ou conforme filtro)
    const artigosParaGrid = artigosFiltrados === todosArtigos ? todosArtigos.slice(1) : artigosFiltrados;
    
    if (gridArtigos) {
      gridArtigos.innerHTML = artigosParaGrid.map((artigo, index) => `
        <article class="card-insight animacao-entrada visivel" data-categoria="${artigo.categoria}">
          <div class="card-imagem-wrapper">
            <img src="${artigo.imagem}" alt="${artigo.titulo}" class="card-imagem">
          </div>
          <div class="card-conteudo">
            <span class="card-tag">${artigo.categoria.toUpperCase()}</span>
            <h3 class="card-titulo">${artigo.titulo}</h3>
            <p class="card-snippet">${artigo.resumo}</p>
            <span class="card-data">${artigo.data}</span>
          </div>
        </article>
      `).join('');
    }
  }

  /**
   * Filtros e Busca
   */
  const filtrar = (categoria) => {
    const filtrados = categoria === 'Todos' 
      ? todosArtigos 
      : todosArtigos.filter(a => a.categoria === categoria);
    renderizarConteudo(filtrados);
  };

  botoesFiltro.forEach(botao => {
    botao.addEventListener('click', () => {
      botoesFiltro.forEach(b => b.classList.remove('btn-filtro--ativo'));
      botao.classList.add('btn-filtro--ativo');
      filtrar(botao.textContent.trim());
    });
  });

  if (inputBuscaLocal) {
    inputBuscaLocal.addEventListener('input', (e) => {
      const termo = e.target.value.toLowerCase();
      const filtrados = todosArtigos.filter(a => 
        a.titulo.toLowerCase().includes(termo) || 
        a.resumo.toLowerCase().includes(termo)
      );
      renderizarConteudo(filtrados);
    });
  }

  // Newsletter
  if (formNewsletter) {
    formNewsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = formNewsletter.querySelector('input').value;
      if (typeof window.exibirToast === 'function') {
        window.exibirToast(`Sucesso! ${email} cadastrado.`, 'sucesso');
      }
      formNewsletter.reset();
    });
  }

  // Iniciar busca
  buscarPosts();
});
