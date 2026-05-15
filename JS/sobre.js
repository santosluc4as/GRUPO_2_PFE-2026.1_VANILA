document.addEventListener('DOMContentLoaded', () => {
  // Dados do Carrossel
  const partnerQuotes = [
    {
      name: "ALEXANDRE REIS",
      quote: "A preservação da verdade institucional não é apenas um serviço, é um dever cívico que assumimos com o mais alto rigor técnico.",
      img: "../images/conselheiros/alexandre-reis.jpg"
    },
    {
      name: "AMÉRICO OLIVEIRA",
      quote: "Nossa missão é transformar a governança corporativa em um pilar de sustentabilidade e crescimento para as empresas brasileiras.",
      img: "../images/conselheiros/americo-oliveira.png"
    },
    {
      name: "ANTONIO ALMEIDA",
      quote: "A ética e a transparência são os alicerces sobre os quais construímos o futuro das organizações que servimos.",
      img: "../images/conselheiros/antonio-almeida.png"
    }
  ];

  const dots = document.querySelectorAll('.dot');
  const quoteAvatar = document.getElementById('quote-avatar');
  const quoteText = document.getElementById('quote-text');
  const quoteAuthorName = document.getElementById('quote-author-name');
  const quoteCard = document.querySelector('.quote-card');
  
  let currentQuoteIndex = 0;
  let autoPlayInterval;
  const AUTO_PLAY_TIME = 10000; // 10 segundos para a troca do carrossel

  const updateCarousel = (index) => {
    currentQuoteIndex = index;
    const data = partnerQuotes[index];
    if (quoteAvatar) quoteAvatar.innerHTML = `<img src="${data.img}" alt="${data.name}" loading="lazy">`;
    if (quoteText) quoteText.textContent = `"${data.quote}"`;
    if (quoteAuthorName) quoteAuthorName.textContent = data.name;

    // Sincronizar indicadores (dots)
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };

  const animateChange = (index) => {
    if (quoteCard) {
      quoteCard.style.opacity = '0';
      setTimeout(() => {
        updateCarousel(index);
        quoteCard.style.opacity = '1';
      }, 300);
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay(); // Evita múltiplos timers
    autoPlayInterval = setInterval(() => {
      const nextIndex = (currentQuoteIndex + 1) % partnerQuotes.length;
      animateChange(nextIndex);
    }, AUTO_PLAY_TIME);
  };

  const stopAutoPlay = () => {
    clearInterval(autoPlayInterval);
  };

  // Inicialização
  updateCarousel(0);
  startAutoPlay();

  // Eventos de clique nos dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (currentQuoteIndex === index) return;
      animateChange(index);
      startAutoPlay(); // Reinicia o timer após interação manual
    });
  });

  // Pausar ao passar o mouse para facilitar a leitura
  if (quoteCard) {
    quoteCard.addEventListener('mouseenter', stopAutoPlay);
    quoteCard.addEventListener('mouseleave', startAutoPlay);
    quoteCard.style.transition = 'opacity 0.3s ease';
  }
});

const founders = [
  { nome: "ALEXANDRE REIS", img: "../images/conselheiros/alexandre-reis.jpg" },
  { nome: "AMÉRICO OLIVEIRA", img: "../images/conselheiros/americo-oliveira.png" },
  { nome: "ANTONIO ALMEIDA", img: "../images/conselheiros/antonio-almeida.png" },
  { nome: "CARLOS ALBERTO", img: "../images/conselheiros/carlos-alberto.png" },
  { nome: "CLAUDIA LEITE", img: "../images/conselheiros/claudia-leite.png" },
  { nome: "GILBERTO BUENO", img: "../images/conselheiros/gilberto-bueno.png" },
  { nome: "HENRIQUE BRAVO", img: "../images/conselheiros/henrique-bravo.png" },
  { nome: "ÍTALO MARTINS", img: "../images/conselheiros/italo-martins.png" },
  { nome: "MANOEL CARBAÚBA", img: "../images/conselheiros/manoel-carnauba.png" },
  { nome: "PAULO SARDINHA", img: "../images/conselheiros/paulo-sardinha.png" },
  { nome: "RICARDO PEIXOTO", img: "../images/conselheiros/ricardo-gentil.png" },
  { nome: "ROQUE MARTINS", img: "../images/conselheiros/roque-martins.png" },
  { nome: "SÉRGIO ARAUJO", img: "../images/conselheiros/sergio-araujo.png" },
  { nome: "TELMO BAULER", img: "../images/conselheiros/telmo-bauler.png" }
];

const foundersCards = document.getElementById('fundadores-card');

const loadGallery = () => {
  const cardsHTML = founders.map(({ nome, img }) => `
    <div class="fundador-card">
      <img src=${img} alt="Imagem do conselheiro ${nome}" />
      <h3 class="name">${nome}</h3>
      <p class="role">SÓCIO FUNDADOR</p>
    </div>
  `);

  foundersCards.innerHTML = cardsHTML.join('');
};

loadGallery();