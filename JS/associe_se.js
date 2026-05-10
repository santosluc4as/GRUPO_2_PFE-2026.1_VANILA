/**
 * associe-se.js — Script exclusivo da página Associe-se
 * Depende de: global.js (deve ser carregado antes)
 *
 * Módulos:
 *  - Máscaras de input (CPF, celular, data, CEP)
 *  - Validação de campos em tempo real
 *  - Submissão do formulário com tremedeira e feedback visual
 */

'use strict';

/* ==========================================================================
   MÓDULO: MÁSCARAS DE INPUT
   ========================================================================== */

/**
 * Aplica máscara de CPF: 000.000.000-00
 * @param {HTMLInputElement} campo
 */
function mascaraCPF(campo) {
  campo.addEventListener('input', () => {
    let valor = campo.value.replace(/\D/g, '').slice(0, 11);
    if (valor.length > 9) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (valor.length > 6) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (valor.length > 3) {
      valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    campo.value = valor;
  });
}

/**
 * Aplica máscara de celular: (00) 00000-0000
 * @param {HTMLInputElement} campo
 */
function mascaraCelular(campo) {
  campo.addEventListener('input', () => {
    let valor = campo.value.replace(/\D/g, '').slice(0, 11);
    if (valor.length > 7) {
      valor = valor.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    } else if (valor.length > 0) {
      valor = valor.replace(/(\d{1,2})/, '($1');
    }
    campo.value = valor;
  });
}

/**
 * Aplica máscara de data: dd/mm/aaaa
 * @param {HTMLInputElement} campo
 */
function mascaraData(campo) {
  campo.addEventListener('input', () => {
    let valor = campo.value.replace(/\D/g, '').slice(0, 8);
    if (valor.length > 4) {
      valor = valor.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }
    campo.value = valor;
  });
}

/**
 * Aplica máscara de CEP: 00000-000
 * @param {HTMLInputElement} campo
 */
function mascaraCEP(campo) {
  campo.addEventListener('input', () => {
    let valor = campo.value.replace(/\D/g, '').slice(0, 8);
    if (valor.length > 5) {
      valor = valor.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    campo.value = valor;
  });
}

/* ==========================================================================
   MÓDULO: VALIDAÇÃO DE CAMPOS
   Cada função retorna null se válido ou uma string de erro
   ========================================================================== */

/**
 * Valida nome completo (mínimo nome + sobrenome)
 * @param {string} valor
 * @returns {string|null}
 */
const validarNome = (valor) => {
  if (!valor.trim()) return 'O nome completo é obrigatório.';
  if (valor.trim().split(' ').length < 2) return 'Informe nome e sobrenome.';
  if (valor.trim().length < 5) return 'Nome muito curto.';
  return null;
};

/**
 * Valida formato de e-mail
 * @param {string} valor
 * @returns {string|null}
 */
const validarEmail = (valor) => {
  if (!valor.trim()) return 'O e-mail é obrigatório.';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(valor)) return 'Informe um e-mail válido.';
  return null;
};

/**
 * Valida CPF incluindo os dígitos verificadores
 * @param {string} valor
 * @returns {string|null}
 */
const validarCPF = (valor) => {
  const apenasDigitos = valor.replace(/\D/g, '');
  if (!apenasDigitos) return 'O CPF é obrigatório.';
  if (apenasDigitos.length !== 11) return 'CPF deve ter 11 dígitos.';
  if (/^(\d)\1{10}$/.test(apenasDigitos)) return 'CPF inválido.';

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(apenasDigitos[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(apenasDigitos[9])) return 'CPF inválido.';

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(apenasDigitos[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(apenasDigitos[10])) return 'CPF inválido.';

  return null;
};

/**
 * Valida número de celular (10 ou 11 dígitos)
 * @param {string} valor
 * @returns {string|null}
 */
const validarCelular = (valor) => {
  const apenasDigitos = valor.replace(/\D/g, '');
  if (!apenasDigitos) return 'O celular é obrigatório.';
  if (apenasDigitos.length < 10 || apenasDigitos.length > 11) return 'Celular inválido.';
  return null;
};

/**
 * Valida data de nascimento no formato dd/mm/aaaa (18 a 120 anos)
 * @param {string} valor
 * @returns {string|null}
 */
const validarData = (valor) => {
  if (!valor.trim()) return 'A data de nascimento é obrigatória.';
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = valor.match(regex);
  if (!match) return 'Formato inválido. Use dd/mm/aaaa.';

  const [, dia, mes, ano] = match;
  const data = new Date(`${ano}-${mes}-${dia}`);
  if (isNaN(data.getTime())) return 'Data inválida.';

  const idade = new Date().getFullYear() - parseInt(ano);
  if (idade < 18 || idade > 120) return 'Idade inválida.';

  return null;
};

/**
 * Valida CEP (8 dígitos)
 * @param {string} valor
 * @returns {string|null}
 */
const validarCEP = (valor) => {
  const apenasDigitos = valor.replace(/\D/g, '');
  if (!apenasDigitos) return 'O CEP é obrigatório.';
  if (apenasDigitos.length !== 8) return 'CEP deve ter 8 dígitos.';
  return null;
};

/**
 * Valida nome de cidade (mínimo 2 caracteres)
 * @param {string} valor
 * @returns {string|null}
 */
const validarCidade = (valor) => {
  if (!valor.trim()) return 'A cidade é obrigatória.';
  if (valor.trim().length < 2) return 'Nome de cidade inválido.';
  return null;
};

/* ==========================================================================
   MÓDULO: FEEDBACK DE ERRO POR CAMPO
   ========================================================================== */

/**
 * Aplica ou remove estado de erro em um campo do formulário
 * @param {HTMLElement} campo
 * @param {string|null} mensagem - Mensagem de erro ou null para limpar
 */
function definirErro(campo, mensagem) {
  const grupoParent = campo.closest('.campo-grupo') || campo.closest('.campo-termos');
  const spanErro    = grupoParent ? grupoParent.querySelector('.campo-erro') : null;

  if (mensagem) {
    campo.classList.add('invalido');
    campo.classList.remove('valido');
    if (spanErro) {
      spanErro.textContent = mensagem;
      spanErro.classList.add('visivel');
    }
  } else {
    campo.classList.remove('invalido');
    campo.classList.add('valido');
    if (spanErro) {
      spanErro.textContent = '';
      spanErro.classList.remove('visivel');
    }
  }
}

/* ==========================================================================
   MÓDULO: VALIDAÇÃO COMPLETA DO FORMULÁRIO
   ========================================================================== */

/**
 * Valida todos os campos do formulário de uma vez
 * @returns {boolean} true se todos os campos são válidos
 */
function validarFormulario() {
  const campos = {
    nomeCompleto:   { validador: validarNome,    campo: document.getElementById('nomeCompleto') },
    email:          { validador: validarEmail,   campo: document.getElementById('email') },
    cpf:            { validador: validarCPF,     campo: document.getElementById('cpf') },
    celular:        { validador: validarCelular, campo: document.getElementById('celular') },
    dataNascimento: { validador: validarData,    campo: document.getElementById('dataNascimento') },
    cep:            { validador: validarCEP,     campo: document.getElementById('cep') },
    cidade:         { validador: validarCidade,  campo: document.getElementById('cidade') },
  };

  let formularioValido = true;

  Object.values(campos).forEach(({ validador, campo }) => {
    if (!campo) return;
    const erro = validador(campo.value);
    definirErro(campo, erro);
    if (erro) formularioValido = false;
  });

  const termos   = document.getElementById('aceitaTermos');
  const spanErro = document.querySelector('.campo-erro--termos');

  if (termos && !termos.checked) {
    if (spanErro) {
      spanErro.textContent = 'Você deve aceitar os termos para prosseguir.';
      spanErro.classList.add('visivel');
    }
    formularioValido = false;
  } else if (termos && spanErro) {
    spanErro.textContent = '';
    spanErro.classList.remove('visivel');
  }

  return formularioValido;
}

/* ==========================================================================
   MÓDULO: FORMULÁRIO DE ADESÃO
   ========================================================================== */

/**
 * Inicializa o formulário de adesão:
 * — aplica máscaras nos campos
 * — valida ao sair de cada campo (blur)
 * — anima tremedeira ao submeter com erros
 * — simula envio com feedback visual
 */
function inicializarFormulario() {
  const formulario = document.getElementById('formularioAdesao');
  if (!formulario) return;

  const campoCPF     = document.getElementById('cpf');
  const campoCelular = document.getElementById('celular');
  const campoData    = document.getElementById('dataNascimento');
  const campoCEP     = document.getElementById('cep');

  if (campoCPF)     mascaraCPF(campoCPF);
  if (campoCelular) mascaraCelular(campoCelular);
  if (campoData)    mascaraData(campoData);
  if (campoCEP)     mascaraCEP(campoCEP);

  const mapaValidadores = {
    nomeCompleto:   validarNome,
    email:          validarEmail,
    cpf:            validarCPF,
    celular:        validarCelular,
    dataNascimento: validarData,
    cep:            validarCEP,
    cidade:         validarCidade,
  };

  Object.entries(mapaValidadores).forEach(([id, validador]) => {
    const campo = document.getElementById(id);
    if (!campo) return;

    campo.addEventListener('blur', () => {
      definirErro(campo, validador(campo.value));
    });

    campo.addEventListener('input', () => {
      if (campo.classList.contains('invalido') && campo.value.length > 0) {
        definirErro(campo, validador(campo.value));
      }
    });
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      const card = formulario.closest('.formulario-card');
      if (card) {
        card.classList.remove('tremendo');
        void card.offsetWidth;
        card.classList.add('tremendo');
        card.addEventListener('animationend', () => card.classList.remove('tremendo'), { once: true });
      }

      const primeiroInvalido = formulario.querySelector('.invalido');
      if (primeiroInvalido) {
        primeiroInvalido.focus();
        primeiroInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      exibirToast('Verifique os campos antes de enviar.', 'erro');
      return;
    }

    const btnEnviar = document.getElementById('btnEnviar');
    if (btnEnviar) {
      btnEnviar.disabled = true;
      btnEnviar.querySelector('.btn-enviar-texto').textContent = 'Enviando...';
      btnEnviar.querySelector('.btn-enviar-icone').className = 'fa-solid fa-spinner fa-spin btn-enviar-icone';
    }

    setTimeout(() => {
      exibirToast('Dados enviados com sucesso! Em breve entraremos em contato.', 'sucesso');
      formulario.reset();

      formulario.querySelectorAll('.campo-input').forEach((campo) => {
        campo.classList.remove('valido', 'invalido');
      });
      formulario.querySelectorAll('.campo-erro').forEach((span) => {
        span.textContent = '';
        span.classList.remove('visivel');
      });

      if (btnEnviar) {
        btnEnviar.disabled = false;
        btnEnviar.querySelector('.btn-enviar-texto').textContent = 'Enviar dados de adesão';
        btnEnviar.querySelector('.btn-enviar-icone').className = 'fa-solid fa-arrow-right btn-enviar-icone';
      }
    }, 1800);
  });
}

/* ==========================================================================
   INICIALIZAÇÃO DA PÁGINA ASSOCIE-SE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  inicializarFormulario();
});