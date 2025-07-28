// Código JS futuro (por enquanto vazio)
const endpoint = 'https://script.google.com/macros/s/AKfycbwafJ5hprI3LTW00LVeoMVfhb6PxYhydvpb-8QfDJTP69DR7fso3E-F12X-1I1akS7w/exec';

async function carregarDados() {
  try {
    const resposta = await fetch(endpoint);
    const dados = await resposta.json();
    dadosOriginais = dados;
    mostrarTabela(dadosOriginais);
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

  dados.forEach(item => {
    const precoBase = comDesconto(item['Preço Tabela 2022'], 'ajusteFerroplast');
    const precoFersil = comDesconto(item['Preço Tabela Fersil'], 'ajusteFersil');
    const precoPolitejo = comDesconto(item['Preço tabela Politejo'], 'ajustePolitejo');
    const precoSival = comDesconto(item['Preço Tabela Sival'], 'ajusteSival');

    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${item['Código Artigo']}</td>
      <td>${item['Familia desconto']}</td>
      <td>${item['Descrição Artigo']}</td>
      <td>${item['UN/CX - MTS']}</td>
      <td>${item['Espessuras (mm)']}</td>
      <td>${formatarPreco(precoBase)}</td>
      <td>${formatarPreco(precoFersil)} ${comIndicadores ? comparar(precoFersil, precoBase) : ''}</td>
      <td>${formatarPreco(precoPolitejo)} ${comIndicadores ? comparar(precoPolitejo, precoBase) : ''}</td>
      <td>${formatarPreco(precoSival)} ${comIndicadores ? comparar(precoSival, precoBase) : ''}</td>
      <td>${formatarKg(item['Kg/mt ou Kg/un'])}</td>
    `;
    tbody.appendChild(linha);
  });
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
  const ids = ['ajusteFerroplast', 'ajusteFersil', 'ajustePolitejo', 'ajusteSival'];
  ids.forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  mostrarTabela(dadosOriginais, false); // sem indicadores
  filterTable();
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
  mostrarTabela(dadosOriginais, true); // mostra com indicadores
  document.getElementById('searchInput').value = ''; // limpa campo
  filterTable(); // reaplica filtro (agora limpo)
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
  const input = document.getElementById('searchInput');
  const filter = input.value.toLowerCase();
  const rows = document.querySelectorAll('#articlesTable tbody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const keywords = filter.split(" ").filter(word => word);
    const isMatch = keywords.every(word => text.includes(word));
    row.style.display = isMatch ? '' : 'none';
  });
}

window.addEventListener('DOMContentLoaded', carregarDados);

/*
function filterTable() {
        let input = document.getElementById('searchInput');
        let filter = input.value.toLowerCase();
        let table = document.getElementById('articlesTable');
        let tr = table.getElementsByTagName('tr');

        for (let i = 1; i < tr.length; i++) {
            let rowText = tr[i].textContent.toLowerCase();
            let keywords = filter.split(" ").filter(word => word);

            // Verifica se todas as palavras-chave estão na linha
            let isMatch = keywords.every(keyword => rowText.includes(keyword));

            tr[i].style.display = isMatch ? '' : 'none';
        }
    }
*/
