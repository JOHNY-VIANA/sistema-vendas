let vendas = [];
let caixa = 0;

// 🔥 SALVAR DADOS
function salvarDados() {
  localStorage.setItem("vendas", JSON.stringify(vendas));
  localStorage.setItem("caixa", caixa);
}

// 🔥 CARREGAR DADOS
function carregarDados() {
  const vendasSalvas = localStorage.getItem("vendas");
  const caixaSalvo = localStorage.getItem("caixa");

  if (vendasSalvas) {
    vendas = JSON.parse(vendasSalvas);
  }

  if (caixaSalvo) {
    caixa = parseFloat(caixaSalvo);
  }
}

// REGISTRA PLUGIN
Chart.register(ChartDataLabels);

// CONTEXTOS
const ctxCaixa = document.getElementById('graficoCaixa').getContext('2d');
const ctxVend = document.getElementById('graficoVendedores').getContext('2d');

// 📈 GRÁFICO CAIXA
const graficoCaixa = new Chart(ctxCaixa, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Caixa',
      data: [],
      borderWidth: 2
    }]
  },
  options: {
    plugins: {
      datalabels: {
        color: 'black',
        align: 'top',
        formatter: (value) => 'R$ ' + value.toFixed(2)
      }
    }
  }
});

// 📊 GRÁFICO VENDEDORES
const graficoVendedores = new Chart(ctxVend, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Total por Vendedor',
      data: []
    }]
  },
  options: {
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'start',
        color: 'black',
        formatter: (value) => 'R$ ' + value.toFixed(2)
      }
    }
  }
});

function definirCaixa() {
  const valor = parseFloat(document.getElementById("caixa").value);
  if (isNaN(valor)) return alert("Digite um valor válido");

  caixa = valor;
  salvarDados(); // 🔥 salva
  atualizar();
}

function adicionarVenda() {
  const valor = parseFloat(document.getElementById("valor").value);
  const custo = parseFloat(document.getElementById("custo").value);
  const data = document.getElementById("data").value;
  const vendedor = document.getElementById("vendedor").value;

  if (isNaN(valor) || isNaN(custo) || !data || !vendedor) {
    return alert("Preencha tudo!");
  }

  // REGRA DO CAIXA
  caixa = caixa - custo + valor;

  vendas.push({
    valor,
    custo,
    data,
    vendedor,
    caixaAtual: caixa
  });

  salvarDados(); // 🔥 salva
  atualizar();
}

function atualizar() {

  document.getElementById("caixaAtual").innerText =
    "R$ " + caixa.toFixed(2);

  let labels = [];
  let caixaData = [];
  let porVendedor = {};

  vendas.forEach(v => {
    labels.push(v.data);
    caixaData.push(v.caixaAtual);

    if (!porVendedor[v.vendedor]) {
      porVendedor[v.vendedor] = 0;
    }
    porVendedor[v.vendedor] += v.valor;
  });

  // ATUALIZA GRÁFICO CAIXA
  graficoCaixa.data.labels = labels;
  graficoCaixa.data.datasets[0].data = caixaData;
  graficoCaixa.update();

  // ATUALIZA GRÁFICO VENDEDORES
  graficoVendedores.data.labels = Object.keys(porVendedor);
  graficoVendedores.data.datasets[0].data = Object.values(porVendedor);
  graficoVendedores.update();

  atualizarRanking(porVendedor);
}

function atualizarRanking(dados) {
  let lista = Object.entries(dados)
    .sort((a, b) => b[1] - a[1]);

  const ul = document.getElementById("ranking");
  ul.innerHTML = "";

  lista.forEach((v, i) => {
    const li = document.createElement("li");
    li.innerText = `${i+1}º ${v[0]} - R$ ${v[1].toFixed(2)}`;
    ul.appendChild(li);
  });
}

function resetar() {
  vendas = [];
  caixa = 0;
  salvarDados(); // 🔥 salva reset
  atualizar();
}

// PDF
async function exportarPDF() {
  const { jsPDF } = window.jspdf;

  const elemento = document.getElementById("relatorio");

  const canvas = await html2canvas(elemento, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const largura = 210;
  const altura = (canvas.height * largura) / canvas.width;

  let alturaRestante = altura;
  let posicao = 0;

  pdf.addImage(imgData, "PNG", 0, posicao, largura, altura);
  alturaRestante -= 297;

  while (alturaRestante > 0) {
    posicao -= 297;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, posicao, largura, altura);
    alturaRestante -= 297;
  }

  pdf.save("relatorio_completo.pdf");
}

// SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("App pronto para uso offline 🚀"))
    .catch(err => console.log("Erro:", err));
}

// 🔥 CARREGAR DADOS AO ABRIR
carregarDados();
atualizar();