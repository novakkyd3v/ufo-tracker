const avistamentos = [
  {
    id: 1,
    data: "2026-10-14",
    local: "Varginha / MG",
    formato: "disco",
    duracao: 15,
    credibilidade: 5,
    testemunhas: 2,
    status: "ativo"
  },
  {
    id: 2,
    data: "2026-10-14",
    local: "Varginha / MG",
    formato: "disco",
    duracao: 15,
    credibilidade: 4,
    testemunhas: 1,
    status: "ativo"
  },
  {
    id: 3,
    data: "2026-10-14",
    local: "Varginha / MG",
    formato: "disco",
    duracao: 25,
    credibilidade: 5,
    testemunhas: 3,
    status: "ativo"
  },
  {
    id: 4,
    data: "2026-10-14",
    local: "Varginha / MG",
    formato: "esfera",
    duracao: 10,
    credibilidade: 3,
    testemunhas: 0,
    status: "ativo"
  },
  {
    id: 5,
    data: "2026-10-14",
    local: "Varginha / MG",
    formato: "triangulo",
    duracao: 15,
    credibilidade: 5,
    testemunhas: 2,
    status: "arquivado"
  }
];

const ICONES_FORMATO = {
  disco:      "🛸 Disco",
  esfera:     "🔵 Esfera",
  triangulo:  "🔺 Triângulo",
  estranheza: "❓ Estranheza"
};

const BONUS_FORMATO = {
  disco:      2,
  esfera:     1,
  triangulo:  4,
  estranheza: 5
};

const estado = {
  busca:       "",
  formato:     "todos",
  credMinima:  0,
  status:      "ativos"
};

function formatarData(iso) {
  if (!iso) return "-";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function gerarEstrelas(n) {
  const cheias = "★".repeat(n);
  const vazias = "☆".repeat(5 - n);
  return `<span class="estrelas">${cheias}<span class="vazia">${vazias}</span></span>`;
}

function calcularEstranheza(caso) {
  const bonusDuracao =
    caso.duracao >= 15 ? 3 : caso.duracao >= 5 ? 1 : 0;
  const bonusTest =
    caso.testemunhas >= 2 ? 3 : caso.testemunhas >= 1 ? 2 : 0;

  return (
    caso.credibilidade * 2 +
    (BONUS_FORMATO[caso.formato] || 0) +
    bonusDuracao +
    bonusTest
  );
}

function classificarEstranheza(pontos) {
  if (pontos >= 16) return { texto: "Alta (H)", classe: "alta"  };
  if (pontos >= 11) return { texto: "Média (M)", classe: "media" };
  return               { texto: "Baixa (L)", classe: "baixa" };
}

const corpoTabela   = document.getElementById("corpoTabela");
const contador      = document.getElementById("contador");
const mensagemVazia = document.getElementById("mensagemVazia");

const statTotal      = document.getElementById("statTotal");
const statAlta       = document.getElementById("statAlta");
const statMediaCred  = document.getElementById("statMediaCred");

function atualizarEstatisticas() {
  statTotal.textContent = avistamentos.length;

  const altastCount = avistamentos.filter(c => {
    const pts = calcularEstranheza(c);
    return classificarEstranheza(pts).classe === "alta";
  }).length;
  statAlta.textContent = altastCount;

  if (avistamentos.length > 0) {
    const somaCred = avistamentos.reduce((acc, c) => acc + Number(c.credibilidade), 0);
    const media = (somaCred / avistamentos.length).toFixed(1);
    statMediaCred.textContent = `${media} ★`;
  } else {
    statMediaCred.textContent = "0.0 ★";
  }
}

function renderizar() {
  atualizarEstatisticas();

  const filtrados = avistamentos.filter(caso => {
    if (estado.busca && !caso.local.toLowerCase().includes(estado.busca.toLowerCase()))
      return false;
    if (estado.formato !== "todos" && caso.formato !== estado.formato)
      return false;
    if (caso.credibilidade < estado.credMinima)
      return false;
    if (estado.status === "ativos" && caso.status !== "ativo")
      return false;
    if (estado.status === "arquivados" && caso.status !== "arquivado")
      return false;
    return true;
  });

  filtrados.sort(
    (a, b) => calcularEstranheza(b) - calcularEstranheza(a)
  );

  contador.textContent = filtrados.length;

  corpoTabela.innerHTML = "";

  if (filtrados.length === 0) {
    mensagemVazia.hidden = false;
    return;
  }
  mensagemVazia.hidden = true;

  filtrados.forEach(caso => {
    const pontos = calcularEstranheza(caso);
    const selo   = classificarEstranheza(pontos);

    const tr = document.createElement("tr");
    if (caso.status === "arquivado") tr.classList.add("arquivado");

    tr.innerHTML = `
      <td>${formatarData(caso.data)}</td>
      <td>${caso.local}</td>
      <td>${ICONES_FORMATO[caso.formato] || caso.formato}</td>
      <td>${caso.duracao} min</td>
      <td>${gerarEstrelas(caso.credibilidade)}</td>
      <td><span class="selo ${selo.classe}">${selo.texto}</span></td>
      <td>
        <div class="acoes">
          <button class="btn-acao" data-acao="detalhes" data-id="${caso.id}" title="Ver Detalhes">
            👁 Detalhes
          </button>
          <button class="btn-acao arquivar" data-acao="arquivar" data-id="${caso.id}" title="Arquivar">
            📦 ${caso.status === "arquivado" ? "Desarquivar" : "Arquivar"}
          </button>
        </div>
      </td>
    `;
    corpoTabela.appendChild(tr);
  });

  corpoTabela.querySelectorAll(".btn-acao").forEach(btn => {
    btn.addEventListener("click", tratarAcaoLinha);
  });
}

const modalDetalhes = document.getElementById("modalDetalhes");
const modalDetalhesCorpo = document.getElementById("modalDetalhesCorpo");

function abrirDetalhes(caso) {
  const pontos = calcularEstranheza(caso);
  const selo   = classificarEstranheza(pontos);

  modalDetalhesCorpo.innerHTML = `
    <div class="detalhes-lista">
      <div class="detalhes-item"><span>Código do Caso</span>#${caso.id}</div>
      <div class="detalhes-item"><span>Data do Ocorrido</span>${formatarData(caso.data)}</div>
      <div class="detalhes-item"><span>Localização</span>${caso.local}</div>
      <div class="detalhes-item"><span>Formato</span>${ICONES_FORMATO[caso.formato]}</div>
      <div class="detalhes-item"><span>Duração Estimada</span>${caso.duracao} minutos</div>
      <div class="detalhes-item"><span>Credibilidade</span>${gerarEstrelas(caso.credibilidade)}</div>
      <div class="detalhes-item"><span>Testemunhas</span>${caso.testemunhas} envolvida(s)</div>
      <div class="detalhes-item"><span>Status</span>${caso.status.toUpperCase()}</div>
      <div class="detalhes-item"><span>Estranheza</span><strong class="selo ${selo.classe}">${selo.texto}</strong></div>
      <div class="detalhes-item"><span>Pontos Calculados</span>${pontos} pontos</div>
    </div>
  `;
  modalDetalhes.hidden = false;
}

function fecharDetalhes() {
  modalDetalhes.hidden = true;
}

document.getElementById("btnFecharDetalhes").addEventListener("click", fecharDetalhes);
document.getElementById("btnFecharDetalhesRodape").addEventListener("click", fecharDetalhes);

function tratarAcaoLinha(evento) {
  const botao = evento.currentTarget;
  const acao  = botao.dataset.acao;
  const id    = Number(botao.dataset.id);
  const caso  = avistamentos.find(c => c.id === id);
  if (!caso) return;

  if (acao === "detalhes") {
    abrirDetalhes(caso);
  }

  if (acao === "arquivar") {
    caso.status = caso.status === "arquivado" ? "ativo" : "arquivado";
    renderizar();
  }
}

const modalNovoRegistro = document.getElementById("modalNovoRegistro");
const formNovoAvistamento = document.getElementById("formNovoAvistamento");
const previewSelo = document.getElementById("previewSelo");
const previewPontos = document.getElementById("previewPontos");

function atualizarPreviewEstranheza() {
  const f = {
    formato: document.getElementById("novoFormato").value,
    duracao: Number(document.getElementById("novoDuracao").value) || 0,
    credibilidade: Number(document.getElementById("novoCredibilidade").value) || 1,
    testemunhas: Number(document.getElementById("novoTestemunhas").value) || 0
  };

  const pts = calcularEstranheza(f);
  const selo = classificarEstranheza(pts);

  previewPontos.textContent = `${pts} pts`;
  previewSelo.textContent = selo.texto;
  previewSelo.className = `selo ${selo.classe}`;
}

document.getElementById("novoFormato").addEventListener("change", atualizarPreviewEstranheza);
document.getElementById("novoDuracao").addEventListener("input", atualizarPreviewEstranheza);
document.getElementById("novoCredibilidade").addEventListener("change", atualizarPreviewEstranheza);
document.getElementById("novoTestemunhas").addEventListener("input", atualizarPreviewEstranheza);

document.getElementById("btnAbrirModalNovo").addEventListener("click", () => {
  document.getElementById("novoData").value = new Date().toISOString().slice(0, 10);
  atualizarPreviewEstranheza();
  modalNovoRegistro.hidden = false;
});

function fecharNovoModal() {
  modalNovoRegistro.hidden = true;
  formNovoAvistamento.reset();
}

document.getElementById("btnFecharNovo").addEventListener("click", fecharNovoModal);
document.getElementById("btnCancelarNovo").addEventListener("click", fecharNovoModal);

modalNovoRegistro.addEventListener("click", (e) => {
  if (e.target === modalNovoRegistro) {
    fecharNovoModal();
  }
});

formNovoAvistamento.addEventListener("submit", (e) => {
  e.preventDefault();

  const novoCaso = {
    id: Date.now(),
    data: document.getElementById("novoData").value,
    local: document.getElementById("novoLocal").value,
    formato: document.getElementById("novoFormato").value,
    duracao: Number(document.getElementById("novoDuracao").value),
    credibilidade: Number(document.getElementById("novoCredibilidade").value),
    testemunhas: Number(document.getElementById("novoTestemunhas").value),
    status: "ativo"
  };

  avistamentos.push(novoCaso);
  fecharNovoModal();
  renderizar();
});

document.getElementById("inputBusca").addEventListener("input", e => {
  estado.busca = e.target.value;
  renderizar();
});

document.getElementById("filtroFormato").addEventListener("change", e => {
  estado.formato = e.target.value;
  renderizar();
});

document.getElementById("filtroCred").addEventListener("change", e => {
  estado.credMinima = Number(e.target.value);
  renderizar();
});

document.getElementById("filtroStatus").addEventListener("change", e => {
  estado.status = e.target.value;
  renderizar();
});

renderizar();
