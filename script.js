// Código JS futuro (por enquanto vazio)
const endpoint = 'https://script.google.com/macros/s/AKfycbwafJ5hprI3LTW00LVeoMVfhb6PxYhydvpb-8QfDJTP69DR7fso3E-F12X-1I1akS7w/exec';
async function carregarDados() {
  const resposta = await fetch(endpoint);
  const dados = await resposta.json();
  mostrarTabela(dados);
}

function mostrarTabela(dados) {
  const tbody = document.querySelector('#produtos tbody');
  tbody.innerHTML = '';

  dados.forEach(item => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${item['Código Artigo']}</td>
      <td>${item['Familia desconto']}</td>
      <td>${item['Descrição Artigo']}</td>
      <td>${item['UN/CX - MTS']}</td>
      <td>${item['Espessuras (mm)']}</td>
      <td>${item['Preço Tabela 2022']}</td>
      <td>${item['Preço Tabela Fersil']}</td>
      <td>${item['Preço tabela Politejo']}</td>
      <td>${item['Preço Tabela Sival']}</td>
      <td>${item['Kg/mt ou Kg/un']}</td>
    `;
    tbody.appendChild(linha);
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
