# ACBrasil — Site Institucional

Repositório do site institucional da **Associação de Conselheiros do Brasil (ACBrasil)**, desenvolvido em HTML, CSS e JavaScript puro, sem dependência de frameworks ou etapa de build.

## Stack / Tecnologias

- HTML5
- CSS3
- JavaScript (vanilla)
- APIs REST externas

---

## Estrutura do Projeto

```
.
├── index.html
├── HTML/ # Páginas
│   ├── associe-se.html
│   ├── contato.html
│   ├── faq.html
│   ├── insights.html
│   ├── newsletter.html
│   └── sobre.html
├── CSS/ # Estilo da Página
│   ├── global.css
│   ├── style.css
│   ├── associe-se.css
│   ├── contato.css
│   ├── faq.css
│   ├── insights.css
│   ├── newsletter.css
│   └── sobre.css
├── JS/ # Scripts
│   ├── global.js
│   ├── script.js
│   ├── associe_se.js
│   ├── contato.js
│   ├── faq-data.js
│   ├── faq.js
│   ├── insights.js
│   ├── newsletter.js
│   └── sobre.js
└── images/
```

## Como Atualizar o Conteúdo

### Páginas (HTML)

Edite ou adicione o arquivo `.html` da página desejada dentro da pasta `HTML/`. Mantenha a estrutura de `<head>`, navegação e rodapé consistente com as demais páginas.

### CSS

- Para alterações globais (cores, tipografia, espaçamentos base), edite `CSS/global.css`.
- Para alterações específicas de uma página, edite o arquivo `.css` de mesmo nome localizado em `CSS/`.

### Scripts (JavaScript)

- Para lógica compartilhada entre todas as páginas, edite `CSS/global.js`.
- Para lógica específica de uma página, edite o arquivo `.js` correspondente em `JS/`.

### Imagens

- Adicione ou substitua imagens na pasta `images/`.
- Fotos de conselheiros devem ser salvas em `images/conselheiros/`.

## Licença

Propriedade intelectual da Associação de Conselheiros do Brasil (ACBrasil). Todos os direitos reservados.