//pupulação da section com perguntas e respostas

import { faqData } from "./faq-data.js";

const faqContainer = document.getElementById("faq-container");

const busca = document.getElementById("campo-busca");

function faqCard(data) {
    return `
        <div class="faq-item">
            <button class="faq-question">
            ${data.pergunta}
            <span class="faq-icon">▼</span>
            </button>

            <div class="faq-answer">
            <p>
                ${data.resposta}
            </p>
            </div>
        </div>
    `
}

function faqSection(data, index) {
    let innerHTML = `<section class="faq-section">`

    innerHTML += `
        <div class="faq-title">
            <span class="faq-number">${String(index).padStart(2, '0')}.</span>
            <h2>${data.categoria}</h2>
        </div>
    `

    data.perguntas.forEach((pergunta) => {
        innerHTML += faqCard(pergunta);
    })

    return innerHTML + `</section>`
}

function faqFiltro(faqData, palavraChave) {
    palavraChave = palavraChave.toLowerCase();

    if (palavraChave === null) {
        return faqData.map((data, index) => faqSection(data, index+1));
    }

    const dataFiltrada = [];
    faqData.forEach((data) => {
        if (data.categoria.includes(palavraChave)) {
            dataFiltrada.push(data);
        } else {
            const novoObjeto = {
                categoria: data.categoria,
                perguntas: []
            }
            data.perguntas.forEach((obj) => {
                if (obj.pergunta.toLowerCase().includes(palavraChave) || obj.resposta.toLowerCase().includes(palavraChave)) {
                    novoObjeto.perguntas.push(obj);
                }
            })
            if (novoObjeto.perguntas.length > 0) {
                dataFiltrada.push(novoObjeto);
            }
        }
    }) ;

    return dataFiltrada.map((data, index) => faqSection(data, index+1));

}

busca.addEventListener("input", (evento) => {
    const faqs = faqFiltro(faqData, evento.target.value)
    faqContainer.innerHTML = faqs.join(" ");
    adicionarAnimacao();
})

faqContainer.innerHTML = faqFiltro(faqData, "").join(" ");
adicionarAnimacao();


// animação dos cards de perguntas

function adicionarAnimacao() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
    
        if(item.classList.contains('active')){
        answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    
        button.addEventListener('click', () => {
    
        item.classList.toggle('active');
    
        if(item.classList.contains('active')){
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }else{
            answer.style.maxHeight = null;
        }
    
        });
    });
}
