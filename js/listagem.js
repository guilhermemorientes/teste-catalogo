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

// Carrega dados da planilha e popula bairros
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

// Renderiza os cards
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

    const nome = imovel["Nome do Empreendimento"] || "Empreendimento";
    const imagem = "https://i.imgur.com/uXRSpYB.png"; // fixa por enquanto
    const tag = imovel["Tag Personalizada"] || "-";
    const estagio = imovel["Estágio de Obra"] || "-";
    const metragem = imovel["Metragem"] || "-";
    const bairro = imovel["Bairro"] || "-";
    const dormitorios = imovel["Dormitórios"] || "-";
    const garagem = imovel["Garagem"] || "-";
    const valor = parseFloat(imovel["Valor"] || 0).toLocaleString("pt-BR");
    const pdf = imovel["LinkPDF"];
    const tour = imovel["Tour Virtual"];

    const garagemTexto = garagem > 1 ? `${garagem} Garagens` : `${garagem} Garagem`;

    // Preencher campos
    clone.querySelector(".insta-user").textContent = nome;
    clone.querySelector(".insta-image img").src = imagem;
    clone.querySelector(".insta-likes").textContent = `⭐ ${tag}`;

    const captionHTML = `
      <p style="margin: 10px 0;"></p>
      <i class="fas fa-calendar-alt"></i> Entrega: ${estagio}<br>
      <i class="fas fa-ruler-combined"></i> Metragem: ${metragem} m²<br>
      <i class="fas fa-location-dot"></i> Bairro: ${bairro}<br>
      <i class="fas fa-bed"></i> ${dormitorios} Dormitórios<br>
      <i class="fas fa-car"></i> ${garagemTexto}<br>
      <i class="fas fa-hand-holding-dollar"></i> Valor: R$ ${valor}<br>
      ${pdf ? `<a href="https://drive.google.com/uc?export=view&id=${pdf}" target="_blank">📄 PDF</a><br>` : ''}
      ${tour ? `<a href="${tour}" target="_blank">🎥 Tour Virtual</a>` : ''}
    `;

    clone.querySelector(".insta-caption").innerHTML = captionHTML;

    container.appendChild(clone);
  });
}
