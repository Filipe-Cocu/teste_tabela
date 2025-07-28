// Código JS futuro (por enquanto vazio)
const endpoint = 'https://script.google.com/macros/s/AKfycbwafJ5hprI3LTW00LVeoMVfhb6PxYhydvpb-8QfDJTP69DR7fso3E-F12X-1I1akS7w/exec';
let dadosOriginais = [];
let dadosFiltrados = [];
let paginaAtual = 1;
const linhasPorPagina = 20;
let indicadoresAtivos = false; // mostra ⇧⇩ só quando aplicas os ajustes



async function carregarDados() {
  try {
    const resposta = await fetch(endpoint);
    const dados = await resposta.json();
    dadosOriginais = dados;
    dadosFiltrados = dadosOriginais.slice(); // começa sem filtro
    mostrarTabela(dadosFiltrados, indicadoresAtivos);
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    const tbody = document.querySelector('#articlesTable tbody');
    tbody.innerHTML = '<tr><td colspan="10">❌ Erro ao carregar dados</td></tr>';
  }
}



// Função para gerar dinamicamente a tabela HTML
function mostrarTabela(dados, comIndicadores = false) {
  const tbody = document.querySelector('#articlesTable tbody');
  tbody.innerHTML = '';

  const inicio = (paginaAtual - 1) * linhasPorPagina;
  const fim = inicio + linhasPorPagina;
  const dadosPaginados = dados.slice(inicio, fim);

  dadosPaginados.forEach(item => {
    const precoBase    = comDesconto(item['Preço Tabela 2022'],     'ajusteFerroplast');
    const precoFersil  = comDesconto(item['Preço Tabela Fersil'],   'ajusteFersil');
    const precoPolitejo= comDesconto(item['Preço tabela Politejo'], 'ajustePolitejo');
    const precoSival   = comDesconto(item['Preço Tabela Sival'],    'ajusteSival');

    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${item['Código Artigo']}</td>
      <td>${item['Familia desconto']}</td>
      <td>${item['Descrição Artigo']}</td>
      <td>${item['UN/CX - MTS']}</td>
      <td>${item['Espessuras (mm)']}</td>
      <td>${formatarPreco(precoBase)}</td>
      <td>${formatarPreco(precoFersil)}   ${comIndicadores ? comparar(precoFersil,  precoBase) : ''}</td>
      <td>${formatarPreco(precoPolitejo)} ${comIndicadores ? comparar(precoPolitejo,precoBase) : ''}</td>
      <td>${formatarPreco(precoSival)}    ${comIndicadores ? comparar(precoSival,   precoBase) : ''}</td>
      <td>${formatarKg(item['Kg/mt ou Kg/un'])}</td>
    `;
    tbody.appendChild(linha);
  });

  criarPaginacao(dados.length); // total do conjunto filtrado
}


function mostrarPaginacao(dados) {
  const paginacaoDiv = document.getElementById('paginacao');
  if (!paginacaoDiv) return;

  const totalPaginas = Math.ceil(dados.length / linhasPorPagina);
  paginacaoDiv.innerHTML = '';

  if (totalPaginas <= 1) return;

  if (paginaAtual > 1) {
    const btnAnterior = document.createElement('button');
    btnAnterior.textContent = 'Anterior';
    btnAnterior.className = 'btn-small';
    btnAnterior.onclick = () => {
      paginaAtual--;
      mostrarTabela(dados, true);
      filterTable();
    };
    paginacaoDiv.appendChild(btnAnterior);
  }

  if (paginaAtual < totalPaginas) {
    const btnProxima = document.createElement('button');
    btnProxima.textContent = 'Próxima';
    btnProxima.className = 'btn-small';
    btnProxima.style.marginLeft = '10px';
    btnProxima.onclick = () => {
      paginaAtual++;
      mostrarTabela(dados, true);
      filterTable();
    };
    paginacaoDiv.appendChild(btnProxima);
  }
}


// Aplica desconto percentual com base no input correspondente
function comDesconto(valor, inputId) {
  const input = document.getElementById(inputId);
  const percentagem = parseFloat(input.value) || 0;
  const preco = parseFloat(valor.toString().replace(',', '.'));

  if (isNaN(preco)) return valor;

  const ajustado = preco * (1 - percentagem / 100);
  return ajustado;
}
//Limpar descontos
function resetAjustes() {
  ['ajusteFerroplast','ajusteFersil','ajustePolitejo','ajusteSival'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  indicadoresAtivos = false;
  mostrarTabela(dadosFiltrados, false);
}


// Formata valor como 0,00 €
function formatarPreco(valor) {
  if (typeof valor !== 'number' || isNaN(valor)) return '-';
  return valor.toFixed(2).replace('.', ',') + ' €';
}
//Formatar com 3 casas decimais 
function formatarKg(valor) {
  const num = parseFloat(valor.toString().replace(',', '.'));
  if (isNaN(num)) return valor;
  return num.toFixed(3).replace('.', ',');
}


// Ligar eventos aos inputs de ajuste
function ligarEventosAjustes() {
  ['ajusteFerroplast', 'ajusteFersil', 'ajustePolitejo', 'ajusteSival'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        mostrarTabela(dadosOriginais);
        filterTable(); // se quiseres manter filtragem ao aplicar
      });
    }
  });
}

function aplicarAjustes() {
  indicadoresAtivos = true;
  mostrarTabela(dadosFiltrados, true);
}

// Comparar preços com a concorrência
function comparar(valor, base) {
  if (isNaN(valor) || isNaN(base)) return '';
  if (valor < base) {
    return '<i class="material-icons tiny red-text" style="vertical-align: middle;">arrow_downward</i>';
  }
  if (valor > base) {
    return '<i class="material-icons tiny green-text" style="vertical-align: middle;">arrow_upward</i>';
  }
  return '<i class="material-icons tiny grey-text" style="vertical-align: middle;">trending_flat</i>';
}

// Filtro por palavras-chave
function filterTable() {
  const termo = document.getElementById('searchInput').value.toLowerCase().trim();
  const keywords = termo.split(/\s+/).filter(Boolean);

  if (keywords.length === 0) {
    dadosFiltrados = dadosOriginais.slice();
  } else {
    dadosFiltrados = dadosOriginais.filter(item => {
      const rowText = [
        item['Código Artigo'],
        item['Familia desconto'],
        item['Descrição Artigo'],
        item['UN/CX - MTS'],
        item['Espessuras (mm)'],
        item['Preço Tabela 2022'],
        item['Preço Tabela Fersil'],
        item['Preço tabela Politejo'],
        item['Preço Tabela Sival'],
        item['Kg/mt ou Kg/un']
      ].join(' ').toString().toLowerCase();

      return keywords.every(k => rowText.includes(k));
    });
  }

  paginaAtual = 1; // sempre que mudas o filtro, volta à 1ª página
  mostrarTabela(dadosFiltrados, indicadoresAtivos);
}
function criarPaginacao(total) {
  const pagDiv = document.getElementById('paginacao');
  if (!pagDiv) return;

  const totalPaginas = Math.max(1, Math.ceil(total / linhasPorPagina));
  pagDiv.innerHTML = '';

  const info = document.createElement('span');
  info.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  info.style.marginRight = '12px';
  pagDiv.appendChild(info);

  const btnPrev = document.createElement('button');
  btnPrev.textContent = 'Anterior';
  btnPrev.className = 'btn-small';
  btnPrev.disabled = paginaAtual <= 1;
  btnPrev.onclick = () => { paginaAtual--; mostrarTabela(dadosFiltrados, indicadoresAtivos); };
  pagDiv.appendChild(btnPrev);

  const btnNext = document.createElement('button');
  btnNext.textContent = 'Próxima';
  btnNext.className = 'btn-small';
  btnNext.style.marginLeft = '8px';
  btnNext.disabled = paginaAtual >= totalPaginas;
  btnNext.onclick = () => { paginaAtual++; mostrarTabela(dadosFiltrados, indicadoresAtivos); };
  pagDiv.appendChild(btnNext);
}


window.addEventListener('DOMContentLoaded', carregarDados);

