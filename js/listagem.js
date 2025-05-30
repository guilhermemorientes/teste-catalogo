// ================================
// CONFIGURAÇÃO INICIAL
// ================================
const titulo = document.getElementById("titulo");
let dados = [];

const url = "https://script.google.com/macros/s/AKfycbyy3R4jCXbUcSjjC4bn-ocQwa0S2aro_qnQYSvmaKk85Ovo5MJVDdJ6B0hGnHOCEheUyQ/exec";

// ================================
// TROCA DE ABAS (Apartamentos, Casas, Loteamentos)
// ================================
document.querySelectorAll(".tabs button").forEach(button => {
  button.addEventListener("click", () => {
    const setor = button.getAttribute("data-setor");

    // Ativa aba selecionada
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active", "apartamentos", "casas", "loteamentos"));
    button.classList.add("active", setor);
    titulo.className = setor;

    // Exibe os filtros da aba correspondente
    document.querySelectorAll(".filtros").forEach(f => f.classList.add("hidden"));
    document.querySelector(`.filtros.${setor}`).classList.remove("hidden");
  });
});

// ================================
// CARREGA DADOS DA PLANILHA E POPULA SELECTS DE BAIRROS
// ================================
async function carregarDados() {
  try {
    const res = await fetch(url);
    dados = await res.json();

    ["apartamentos", "casas", "loteamentos"].forEach(tipo => {
      const filtrado = dados.filter(d => d["TIPO"]?.toLowerCase() === tipo);
      const bairros = [...new Set(filtrado.map(d => d["BAIRRO"]).filter(Boolean))];

      const select = document.getElementById(`bairro-${tipo}`);
      if (!select) return;

      bairros.forEach(bairro => {
        const opt = document.createElement("option");
        opt.textContent = bairro;
        select.appendChild(opt);
      });
    });

    aplicarFiltrosDaURL(); // Aplica filtros se tiver parâmetros na URL
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

carregarDados();

// ================================
// APLICA FILTRO AUTOMÁTICO SE A URL TIVER PARÂMETROS
// Ex: ?setor=apartamentos&bairro=Medeiros
// ================================
function aplicarFiltrosDaURL() {
  const params = new URLSearchParams(window.location.search);
  const setorParam = params.get("setor");
  const bairroParam = params.get("bairro");

  if (setorParam && bairroParam) {
    const botaoSetor = document.querySelector(`.tabs button[data-setor="${setorParam}"]`);
    if (botaoSetor) {
      botaoSetor.click(); // Simula clique na aba
      const select = document.getElementById(`bairro-${setorParam}`);
      if (select) {
        select.value = bairroParam;
        const botaoBuscar = select.closest(".filtros").querySelector(".buscar");
        if (botaoBuscar) botaoBuscar.click(); // Dispara a busca
      }
    }
  }
}

// ================================
// BOTÃO "BUSCAR" – FILTRA E MOSTRA OS IMÓVEIS
// ================================
document.querySelectorAll(".filtros .buscar").forEach(botao => {
  botao.addEventListener("click", () => {
    const setor = document.querySelector(".tabs button.active").getAttribute("data-setor");
    const bairroSelecionado = document.getElementById(`bairro-${setor}`).value;

    // Atualiza URL com filtros aplicados
    const novaURL = `${window.location.pathname}?setor=${setor}&bairro=${encodeURIComponent(bairroSelecionado)}`;
    history.pushState({}, "", novaURL);

    // Filtra dados
    const resultado = dados.filter(item =>
      item["TIPO"]?.toLowerCase() === setor &&
      (bairroSelecionado === "Bairro" || item["BAIRRO"] === bairroSelecionado)
    );

    mostrarResultados(resultado);
  });
});

// ================================
// MONTA OS CARDS NA TELA COM OS RESULTADOS FILTRADOS
// ================================
function mostrarResultados(lista) {
  const container = document.querySelector(".resultados");
  container.innerHTML = "";

  if (!lista.length) {
    container.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    return;
  }

  const template = document.getElementById("card-template")?.content;
  if (!template) {
    container.innerHTML = "<p>Erro ao carregar template do card.</p>";
    return;
  }

  lista.forEach(imovel => {
    const clone = template.cloneNode(true);

    // Dados do imóvel
    const nome = imovel["EMPREENDIMENTO"] || "Empreendimento";
    const imagem = "https://i.imgur.com/uXRSpYB.png"; // Ou imovel["IMAGEM"]
    const tag = imovel["DESCRICAO"] || "-";
    const estagio = imovel["ESTAGIO"] || "-";
    const metragem = imovel["METRAGEM"] || "-";
    const bairro = imovel["BAIRRO"] || "-";
    const dormitorios = imovel["DORMITORIOS"] || "-";

    const banheiroNum = parseInt(imovel["BANHEIROS"] || "0") || 0;
    const garagemNum = parseInt(imovel["GARAGEM"] || "0") || 0;

    const valor = parseFloat(imovel["VALOR"] || 0).toLocaleString("pt-BR");
    const apresentacao = imovel["APRESENTACAO"];

    // Preenche os campos no card
    clone.querySelector(".insta-user").textContent = nome;
    clone.querySelector(".insta-image img").src = imagem;
    clone.querySelector(".insta-likes").textContent = `⭐ ${tag}`;

    const captionHTML = `
      <p style="margin: 10px 0;"></p>
      📅 Status: ${estagio}<br>
      📐 Metragem: ${metragem} m²<br>
      📌 Bairro: ${bairro}<br>
      🛌 Dormitórios: ${dormitorios}<br>
      🚻 Banheiro: ${banheiroNum}<br>
      🚙 Garagem: ${garagemNum}<br>
      🏷️ Valor: R$ ${valor}<br>
      ${apresentacao ? `<a href="https://drive.google.com/uc?export=view&id=${apresentacao}" target="_blank">📄 Apresentação</a><br>` : ''}
    `;

    clone.querySelector(".insta-caption").innerHTML = captionHTML;

    container.appendChild(clone);
  });
}
