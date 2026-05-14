/* ==========================================
  CONTATO.JS
  Script da página de contato.

  Responsabilidades deste arquivo:
  1. Validar os campos do formulário no front-end
  2. Exibir mensagens de erro acessíveis
  3. Simular o envio bem-sucedido do formulário
  4. Limpar erros dinamicamente durante a digitação
  5. Manter toda a lógica isolada da página de contato
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* Garante que o script só rode depois que toda a estrutura HTML da página estiver carregada no navegador. */

  const formulario = document.getElementById("formulario-contato");

  /* Se o formulário não existir nesta página, o script é encerrado.
  Isso evita erros caso o arquivo JS seja carregado por engano em outra página do projeto. */
  if (!formulario) return;

  /* ==================================================
     CAMPOS PRINCIPAIS DO FORMULÁRIO
     Cada constante referencia um input/textarea/select
     que será validado antes do envio.
  ================================================== */
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const assunto = document.getElementById("assunto");
  const mensagem = document.getElementById("mensagem");

  /* ==================================================
     ELEMENTOS DE FEEDBACK DE ERRO
     Esses spans recebem mensagens específicas de erro
     para cada campo, melhorando a clareza para o usuário.
  ================================================== */
  const erroNome = document.getElementById("erro-nome");
  const erroEmail = document.getElementById("erro-email");
  const erroAssunto = document.getElementById("erro-assunto");
  const erroMensagem = document.getElementById("erro-mensagem");

  /* Elemento responsável por mostrar o feedback positivo quando o formulário é considerado válido e "enviado". */
  const mensagemSucesso = document.getElementById("mensagem-sucesso");

  /* Limpa todas as mensagens de erro e sucesso da interface e remove o atributo aria-invalid dos campos.
  Isso garante que a validação sempre recomece do zero a cada nova tentativa de envio. */
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

  /*============================================================
    Faz uma validação simples de e-mail usando regex.

    Objetivo:
    verificar se o valor digitado segue um formato básico como:
    texto@dominio.com 
    ============================================================ */
  function emailValido(valor) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(valor);
  }

  /*==========================================
    Executa a validação completa do formulário.

    Regras atuais:
    - nome: pelo menos 3 caracteres
    - e-mail: formato válido
    - assunto: precisa ser selecionado
    - mensagem: pelo menos 10 caracteres

    Retorno:
    - true  => formulário válido
    - false => existe pelo menos um erro 
    ========================================== */
  function validarFormulario() {
    limparErros();

    let formularioValido = true;

    /* Validação do nome: remove espaços extras das pontas e exige ao menos 3 caracteres. */
    if (nome.value.trim().length < 3) {
      erroNome.textContent = "Informe um nome completo válido.";
      nome.setAttribute("aria-invalid", "true");
      formularioValido = false;
    }

    /* Validação do e-mail: usa a função emailValido para verificar o formato. */
    if (!emailValido(email.value.trim())) {
      erroEmail.textContent = "Informe um e-mail válido.";
      email.setAttribute("aria-invalid", "true");
      formularioValido = false;
    }

    /* Validação do assunto: impede que o usuário envie o formulário sem escolher uma opção. */
    if (assunto.value.trim() === "") {
      erroAssunto.textContent = "Selecione um assunto.";
      assunto.setAttribute("aria-invalid", "true");
      formularioValido = false;
    }

    /* Validação da mensagem: exige pelo menos 10 caracteres para evitar envios vazios ou curtos demais. */
    if (mensagem.value.trim().length < 10) {
      erroMensagem.textContent = "Escreva uma mensagem com pelo menos 10 caracteres.";
      mensagem.setAttribute("aria-invalid", "true");
      formularioValido = false;
    }

    return formularioValido;
  }

  /* =============================================================
    Evento principal de envio do formulário.

    - preventDefault() impede o recarregamento da página
    - validarFormulario() verifica todos os campos
    - se tudo estiver correto, uma mensagem de sucesso é exibida
    - depois o formulário é limpo com reset()
  ================================================================ */
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const valido = validarFormulario();

    if (!valido) return;

    mensagemSucesso.textContent = "Mensagem enviada com sucesso! Em breve entraremos em contato.";

    formulario.reset();
  });

  /* ===============================================================
    VALIDAÇÃO EM TEMPO REAL

    Os listeners abaixo melhoram a experiência do usuário:
    conforme ele corrige um campo, a mensagem de erro daquele
    campo específico desaparece sem precisar reenviar o formulário. 
    ================================================================ */

  /* Limpa o erro do nome assim que ele atingir o mínimo válido. */
  nome.addEventListener("input", () => {
    if (nome.value.trim().length >= 3) {
      erroNome.textContent = "";
      nome.removeAttribute("aria-invalid");
    }
  });

  /* Limpa o erro do e-mail quando o formato se torna válido. */
  email.addEventListener("input", () => {
    if (emailValido(email.value.trim())) {
      erroEmail.textContent = "";
      email.removeAttribute("aria-invalid");
    }
  });

  /* Limpa o erro do assunto assim que uma opção válida é selecionada. */
  assunto.addEventListener("change", () => {
    if (assunto.value.trim() !== "") {
      erroAssunto.textContent = "";
      assunto.removeAttribute("aria-invalid");
    }
  });

  /* Limpa o erro da mensagem quando o texto atinge o tamanho mínimo. */
  mensagem.addEventListener("input", () => {
    if (mensagem.value.trim().length >= 10) {
      erroMensagem.textContent = "";
      mensagem.removeAttribute("aria-invalid");
    }
  });
});