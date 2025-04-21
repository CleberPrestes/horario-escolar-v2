const horariosManhaInicial = [
  "07:30 - 08:20",
  "08:20 - 09:10",
  "09:10 - 10:00",
  "10:20 - 11:10",
  "11:10 - 12:00",
  "12:00 - 12:50"
];

const horariosTardeInicial = [
  "13:30 - 14:20",
  "14:20 - 15:10",
  "15:30 - 16:20",
  "16:20 - 17:10",
  "17:10 - 18:00"
];

let horariosManha = [...horariosManhaInicial];
let horariosTarde = [...horariosTardeInicial];

function gerarTabela(tabelaId, horarios) {
  const tbody = document.querySelector(`#${tabelaId} tbody`);
  tbody.innerHTML = ''; // Limpa a tabela existente ao regenerar

  horarios.forEach((horario, rowIndex) => {
      const tr = document.createElement('tr');

      const tdHorario = document.createElement('td');
      const inputHorario = document.createElement('input');
      inputHorario.type = 'text';
      inputHorario.value = horario;
      inputHorario.classList.add('horario-input');
      tdHorario.appendChild(inputHorario);
      tr.appendChild(tdHorario);

      for (let i = 0; i < 5; i++) {
          const td = document.createElement('td');
          const inputTexto = document.createElement('input');
          inputTexto.type = "text";
          inputTexto.placeholder = "Turma";
          td.appendChild(inputTexto);

          // Clique com botão direito abre menu de cor
          td.addEventListener('contextmenu', function (e) {
              e.preventDefault();
              abrirMenuCor(e, td);
          });

          tr.appendChild(td);
      }

      tbody.appendChild(tr);
  });
}

gerarTabela('tabela-manha', horariosManha);
gerarTabela('tabela-tarde', horariosTarde);

// Menu de cor (mantém o mesmo)
const menuCor = document.getElementById('color-menu');
let tdSelecionado = null;

function abrirMenuCor(event, td) {
  tdSelecionado = td;
  menuCor.style.top = `${event.pageY}px`;
  menuCor.style.left = `${event.pageX}px`;
  menuCor.style.display = 'flex';
}

function corTextoContraste(corDeFundo) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = corDeFundo;
  const rgb = ctx.fillStyle.match(/\d+/g).map(Number);
  const [r, g, b] = rgb;
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b);
  return luminancia > 150 ? '#000' : '#fff';
}

document.querySelectorAll('.color-option').forEach(opcao => {
  opcao.addEventListener('click', () => {
      const cor = window.getComputedStyle(opcao).backgroundColor;
      if (tdSelecionado) {
          const input = tdSelecionado.querySelector('input');
          tdSelecionado.style.backgroundColor = cor;
          if (input) {
              input.style.backgroundColor = cor;
              input.style.color = corTextoContraste(cor);
          }
      }
      menuCor.style.display = 'none';
  });
});

document.addEventListener('click', (e) => {
  if (!menuCor.contains(e.target)) {
      menuCor.style.display = 'none';
  }
});

// Exportar como imagem (mantém o mesmo)
document.getElementById('exportar').addEventListener('click', () => {
  const container = document.getElementById('agenda-container');

  html2canvas(container).then(canvas => {
      const link = document.createElement('a');
      link.download = 'horario-semanal.jpeg';
      link.href = canvas.toDataURL('image/jpeg');
      link.click();
  });
});

// Salvar Horário (atualizado para salvar os horários dos inputs)
document.getElementById('salvar').addEventListener('click', () => {
  const data = {
      horariosManha: [],
      horariosTarde: [],
      agenda: []
  };

  document.querySelectorAll('#tabela-manha tbody tr td:first-child input').forEach(input => {
      data.horariosManha.push(input.value);
  });

  document.querySelectorAll('#tabela-tarde tbody tr td:first-child input').forEach(input => {
      data.horariosTarde.push(input.value);
  });

  document.querySelectorAll('#agenda-container table tbody tr').forEach((row, rowIndex) => {
      const rowData = [];
      row.querySelectorAll('td').forEach((cell, colIndex) => {
          if (colIndex > 0) { // Ignora a coluna de horários
              const input = cell.querySelector('input');
              rowData.push({
                  text: input ? input.value : '',
                  backgroundColor: cell.style.backgroundColor || '',
                  textColor: input ? input.style.color || '' : ''
              });
          }
      });
      data.agenda.push(rowData);
  });
  localStorage.setItem('agendaData', JSON.stringify(data));
  alert('Horário salvo com sucesso!');
});

// Carregar Horário (atualizado para carregar os horários nos inputs)
document.getElementById('carregar').addEventListener('click', () => {
  const savedData = localStorage.getItem('agendaData');
  if (savedData) {
      const data = JSON.parse(savedData);
      if (data.horariosManha && data.horariosTarde) {
          horariosManha = [...data.horariosManha];
          horariosTarde = [...data.horariosTarde];
          gerarTabela('tabela-manha', horariosManha);
          gerarTabela('tabela-tarde', horariosTarde);
      }
      if (data.agenda) {
          document.querySelectorAll('#agenda-container table tbody tr').forEach((row, rowIndex) => {
              row.querySelectorAll('td').forEach((cell, colIndex) => {
                  if (colIndex > 0 && data.agenda[rowIndex] && data.agenda[rowIndex][colIndex - 1]) {
                      const cellData = data.agenda[rowIndex][colIndex - 1];
                      const input = cell.querySelector('input');
                      if (input) {
                          input.value = cellData.text;
                          input.style.backgroundColor = cellData.backgroundColor;
                          input.style.color = cellData.textColor;
                      }
                      cell.style.backgroundColor = cellData.backgroundColor;
                  } else if (colIndex > 0) {
                      const input = cell.querySelector('input');
                      if (input) {
                          input.value = '';
                          input.style.backgroundColor = '';
                          input.style.color = '';
                      }
                      cell.style.backgroundColor = '';
                  }
              });
          });
      }
      alert('Horário carregado com sucesso!');
  } else {
      alert('Nenhum horário salvo encontrado.');
  }
});