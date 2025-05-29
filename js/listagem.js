const titulo = document.getElementById("titulo");
let dados = [];

const url = "https://script.google.com/macros/s/AKfycbyy3R4jCXbUcSjjC4bn-ocQwa0S2aro_qnQYSvmaKk85Ovo5MJVDdJ6B0hGnHOCEheUyQ/exec";

// Troca de abas (Apartamentos, Casas, Loteamentos)
document.querySelectorAll(".tabs button").forEach(button => {
  button.addEventListener("click", () => {
    const setor = button.getAttribute("data-setor");

    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active", "apartamentos", "casas", "loteamentos"));
    button.classList.add("active", setor);
    titulo.className = setor;

    document.querySelectorAll(".filtros").forEach(f => f.classList.add("hidden"));
    document.querySelector(`.filtros.${setor}`).classList.remove("hidden");
  });
});

// Carrega os dados da planilha e popula os bairros
async function carregarDados() {
  try {
    const res = await fetch(url);
    dados = await res.json();

    ["apartamentos", "casas", "loteamentos"].forEach(tipo => {
      const filtrado = dados.filter(d => d["Tipo"]?.toLowerCase() === tipo);
      const bairros = [...new Set(filtrado.map(d => d["Bairro"]).filter(Boolean))];

      const select = document.getElementById(`bairro-${tipo}`);
      if (!select) return;

      bairros.forEach(bairro => {
        const opt = document.createElement("option");
        opt.textContent = bairro;
        select.appendChild(opt);
      });
    });
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

carregarDados();

// Busca filtrada por setor e bairro
document.querySelectorAll(".filtros .buscar").forEach(botao => {
  botao.addEventListener("click", () => {
    const setor = document.querySelector(".tabs button.active").getAttribute("data-setor");
    const bairroSelecionado = document.getElementById(`bairro-${setor}`).value;

    const resultado = dados.filter(item =>
      item["Tipo"]?.toLowerCase() === setor &&
      (bairroSelecionado === "Bairro" || item["Bairro"] === bairroSelecionado)
    );

    mostrarResultados(resultado);
  });
});

// Renderiza os cards com base no template
function mostrarResultados(lista) {
  const container = document.querySelector(".resultados");
  container.innerHTML = "";

  if (!lista.length) {
    container.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    return;
  }

  const template = document.getElementById("card-template")?.innerHTML;
  if (!template) {
    container.innerHTML = "<p>Erro ao carregar template do card.</p>";
    return;
  }

lista.forEach(imovel => {
  const imagemURL = "https://i.imgur.com/uXRSpYB.png"; // NOVA IMAGEM TESTE

  const pdfLink = imovel["LinkPDF"]
    ? `<a href="https://drive.google.com/uc?export=view&id=${imovel["LinkPDF"]}" target="_blank">📄 PDF</a>`
    : "";

  const tourLink = imovel["Tour Virtual"]
    ? `<a href="${imovel["Tour Virtual"]}" target="_blank">🎥 Tour Virtual</a>`
    : "";

  let html = template
    .replace(/__NOME__/g, imovel["Nome do Empreendimento"] || "Empreendimento")
    .replace(/__IMAGEM__/g, imagemURL)
    .replace(/__DORMS__/g, imovel["Dormitórios"] || "-")
    .replace(/__BAIRRO__/g, imovel["Bairro"] || "-")
    .replace(/__ESTAGIO__/g, imovel["Estágio de Obra"] || "-")
    .replace(/__VALOR__/g, parseFloat(imovel["Valor"] || 0).toLocaleString("pt-BR"))
    .replace(/__LINKPDF__/g, pdfLink)
    .replace(/__TOURVIRTUAL__/g, tourLink);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();
  container.appendChild(wrapper.firstChild);
});

}
