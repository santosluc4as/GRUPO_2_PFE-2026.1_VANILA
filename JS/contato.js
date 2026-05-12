/*
=========================================================
  CONTATO.JS
  Script inicial da página de contato.

  Objetivos:
  1. Validar o formulário no front-end
  2. Exibir mensagens acessíveis de erro
  3. Simular envio bem-sucedido
  4. Manter o JS isolado desta página
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario-contato");

  // Se o formulário não existir, o script não continua.
  if (!formulario) return;

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const assunto = document.getElementById("assunto");
  const mensagem = document.getElementById("mensagem");

  const erroNome = document.getElementById("erro-nome");
  const erroEmail = document.getElementById("erro-email");
  const erroAssunto = document.getElementById("erro-assunto");
  const erroMensagem = document.getElementById("erro-mensagem");

  const mensagemSucesso = document.getElementById("mensagem-sucesso");

  /*
    Função utilitária para limpar mensagens de erro.
  */
  function limparErros() {
    erroNome.textContent = "";
    erroEmail.textContent = "";
    erroAssunto.textContent = "";
    erroMensagem.textContent = "";
    mensagemSucesso.textContent = "";

    nome.removeAttribute("aria-invalid");
    email.removeAttribute("aria-invalid");
    assunto.removeAttribute("aria-invalid");
    mensagem.removeAttribute("aria-invalid");
  }

  /*
    Validação simples de e-mail.
    Não é perfeita para todos os casos do mundo real,
    mas atende bem ao front-end inicial.
  */
  function emailValido(valor) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(valor);
  }

  /*
    Validação principal do formulário.
    Retorna true se estiver tudo ok e false se houver erro.
  */
  function validarFormulario() {
    limparErros();

    let formularioValido = true;

    if (nome.value.trim().length < 3) {
      erroNome.textContent = "Informe um nome completo válido.";
      nome.setAttribute("aria-invalid", "true");
      formularioValido = false;
    }

    if (!emailValido(email.value.trim())) {
      erroEmail.textContent = "Informe um e-mail válido.";
      email.setAttribute("aria-invalid", "true");
      formularioValido = false;
    }

    if (assunto.value.trim() === "") {
      erroAssunto.textContent = "Selecione um assunto.";
      assunto.setAttribute("aria-invalid", "true");
      formularioValido = false;
    }

    if (mensagem.value.trim().length < 10) {
      erroMensagem.textContent = "Escreva uma mensagem com pelo menos 10 caracteres.";
      mensagem.setAttribute("aria-invalid", "true");
      formularioValido = false;
    }

    return formularioValido;
  }

  /*
    Evento de envio do formulário.
    Aqui estamos simulando um envio.
    No futuro, isso pode ser trocado por fetch() para API/back-end.
  */
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const valido = validarFormulario();

    if (!valido) return;

    mensagemSucesso.textContent = "Mensagem enviada com sucesso! Em breve entraremos em contato.";

    formulario.reset();
  });

  /*
    Limpeza progressiva das mensagens enquanto o usuário digita.
    Isso melhora a experiência.
  */
  nome.addEventListener("input", () => {
    if (nome.value.trim().length >= 3) {
      erroNome.textContent = "";
      nome.removeAttribute("aria-invalid");
    }
  });

  email.addEventListener("input", () => {
    if (emailValido(email.value.trim())) {
      erroEmail.textContent = "";
      email.removeAttribute("aria-invalid");
    }
  });

  assunto.addEventListener("change", () => {
    if (assunto.value.trim() !== "") {
      erroAssunto.textContent = "";
      assunto.removeAttribute("aria-invalid");
    }
  });

  mensagem.addEventListener("input", () => {
    if (mensagem.value.trim().length >= 10) {
      erroMensagem.textContent = "";
      mensagem.removeAttribute("aria-invalid");
    }
  });
});
