const mapaFrame = document.getElementById("mapaFrame");
const botoesEstado = document.querySelectorAll(".estado-btn");
const botoesUnidade = document.querySelectorAll(".unidade-btn");

function mostrarUnidade(botao) {
    const busca = encodeURIComponent(botao.dataset.busca);
    mapaFrame.src = "https://www.google.com/maps?q=" + busca + "&z=" + botao.dataset.zoom + "&output=embed";
    mapaFrame.title = "Mapa da unidade " + botao.dataset.nome;
    botoesUnidade.forEach((outro) => {
        outro.setAttribute("aria-pressed", outro === botao ? "true" : "false");
    });
}

function filtrarPorEstado(estado) {
    let primeira = null;

    botoesEstado.forEach((botao) => {
        botao.setAttribute("aria-pressed", botao.dataset.estado === estado ? "true" : "false");
    });

    botoesUnidade.forEach((unidade) => {
        const visivel = estado === "todos" || unidade.dataset.estado === estado;
        unidade.parentElement.hidden = !visivel;
        if (visivel && !primeira) primeira = unidade;
    });

    if (estado !== "todos" && primeira) mostrarUnidade(primeira);
}

if (mapaFrame) {
    botoesUnidade.forEach((botao) => {
        botao.addEventListener("click", () => mostrarUnidade(botao));
    });

    botoesEstado.forEach((botao) => {
        botao.addEventListener("click", () => filtrarPorEstado(botao.dataset.estado));
    });
}