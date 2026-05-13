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