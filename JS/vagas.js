// Página de vagas: usa o array "vagas" definido em JS/main.js
// Quando o administrador está logado (JS/auth.js), os cards ganham botões de editar/excluir.
(function () {
    const grade = document.getElementById("vagasGrade");
    if (!grade || typeof vagas === "undefined") return;

    const admin = typeof Auth !== "undefined" && Auth.estaLogado();

    const vazio = document.getElementById("vagasVazio");
    const contagem = document.getElementById("vagasContagem");
    const busca = document.getElementById("filtroBusca");
    const selEstado = document.getElementById("filtroEstado");
    const selArea = document.getElementById("filtroArea");
    const selModalidade = document.getElementById("filtroModalidade");
    const selOrdem = document.getElementById("filtroOrdem");

    const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ESCAPES[c]);

    // "R$1.142,33" -> 1142.33
    const valor = (v) => parseFloat(String(v.salario).replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    // Remove acentos para a busca
    const norm = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // As fotos são relativas ao index.html; aqui estamos em /html/
    const caminhoFoto = (f) => String(f || "").replace(/^\.\//, "../");

    const card = (v) => `
        <article class="vaga-card">
            <h3 class="vaga-titulo">${esc(v.titulo)}</h3>
            <div class="vaga-foto" role="img" aria-label="Foto de ${esc(v.local)}" style="--foto: url('${esc(caminhoFoto(v.foto))}')">
                <span class="vaga-estado">${esc(v.estado)}</span>
                <div class="vaga-tags">
                    <span class="vaga-tag area">${esc(v.area)}</span>
                    <span class="vaga-tag">${esc(v.modalidade)}</span>
                </div>
            </div>
            <ul class="vaga-info">
                <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>${esc(v.local)}</span></li>
                <li class="destaque"><i class="fa-regular fa-circle-check" aria-hidden="true"></i><span>${esc(v.requisito)}</span></li>
                <li><i class="fa-regular fa-clock" aria-hidden="true"></i><span>${esc(v.idade)}</span></li>
                <li><i class="fa-regular fa-calendar-check" aria-hidden="true"></i><span>${esc(v.horario)}</span></li>
                <li class="salario"><i class="fa-solid fa-sack-dollar" aria-hidden="true"></i><span>${esc(v.salario)}</span></li>
            </ul>
            ${admin ? `
            <div class="vaga-admin">
                <button type="button" class="admin-btn" data-acao="editar" data-i="${vagas.indexOf(v)}"><i class="fa-solid fa-pen" aria-hidden="true"></i> Editar</button>
                <button type="button" class="admin-btn perigo" data-acao="excluir" data-i="${vagas.indexOf(v)}"><i class="fa-solid fa-trash" aria-hidden="true"></i> Excluir</button>
            </div>` : `<a href="#" class="vaga-botao">Saiba Mais</a>`}
        </article>`;

    // Preenche os selects com os valores que existem no array, mantendo a seleção atual
    function opcoes(select, campo, rotuloTodos) {
        const atual = select.value;
        select.innerHTML = `<option value="">${rotuloTodos}</option>`;
        [...new Set(vagas.map((v) => v[campo]))].sort().forEach((valorOpcao) => {
            const o = document.createElement("option");
            o.value = valorOpcao;
            o.textContent = valorOpcao;
            select.appendChild(o);
        });
        select.value = [...select.options].some((o) => o.value === atual) ? atual : "";
    }

    function montarFiltros() {
        opcoes(selEstado, "estado", "Todos");
        opcoes(selArea, "area", "Todas");
        opcoes(selModalidade, "modalidade", "Todas");
    }

    function render() {
        const termo = norm(busca.value.trim());
        let lista = vagas.filter((v) =>
            (!selEstado.value || v.estado === selEstado.value) &&
            (!selArea.value || v.area === selArea.value) &&
            (!selModalidade.value || v.modalidade === selModalidade.value) &&
            (!termo || norm(`${v.titulo} ${v.local} ${v.area}`).includes(termo))
        );

        if (selOrdem.value === "menor") lista = [...lista].sort((a, b) => valor(a) - valor(b));
        if (selOrdem.value === "maior") lista = [...lista].sort((a, b) => valor(b) - valor(a));

        grade.innerHTML = lista.map(card).join("");
        vazio.hidden = lista.length > 0;
        contagem.textContent = lista.length === 1 ? "1 vaga encontrada" : `${lista.length} vagas encontradas`;
    }

    montarFiltros();
    [busca, selEstado, selArea, selModalidade, selOrdem].forEach((el) => {
        el.addEventListener(el === busca ? "input" : "change", render);
    });
    render();

    if (!admin) return;

    // ===== Modo administrador =====
    const barra = document.getElementById("adminBarra");
    const modal = document.getElementById("adminModal");
    const form = document.getElementById("adminForm");
    const tituloModal = document.getElementById("adminModalTitulo");
    const erro = document.getElementById("adminErro");
    const arquivoFoto = document.getElementById("adminFotoArquivo");
    const listaAreas = document.getElementById("listaAreas");
    const listaFotos = document.getElementById("listaFotos");
    let editando = -1; // -1 = nova vaga

    barra.hidden = false;

    function persistir() {
        try {
            salvarVagas(vagas);
        } catch (e) {
            alert("Não foi possível salvar: o armazenamento do navegador está cheio. Tente usar uma imagem menor.");
            return false;
        }
        montarFiltros();
        render();
        return true;
    }

    function abrirModal(i) {
        editando = i;
        form.reset();
        erro.hidden = true;
        tituloModal.textContent = i >= 0 ? "Editar vaga" : "Nova vaga";

        listaAreas.innerHTML = [...new Set(vagas.map((v) => v.area))].map((a) => `<option value="${esc(a)}">`).join("");
        listaFotos.innerHTML = [...new Set(vagas.map((v) => v.foto).filter((f) => f && !f.startsWith("data:")))]
            .map((f) => `<option value="${esc(f)}">`).join("");

        if (i >= 0) {
            const v = vagas[i];
            ["titulo", "estado", "area", "modalidade", "salario", "local", "requisito", "idade", "horario", "foto"].forEach((campo) => {
                if (form.elements[campo]) form.elements[campo].value = v[campo] || "";
            });
            if (v.foto && v.foto.startsWith("data:")) form.elements.foto.value = "(imagem enviada)";
        }
        modal.showModal();
        form.elements.titulo.focus();
    }

    // Reduz a imagem enviada para caber no localStorage
    arquivoFoto.addEventListener("change", () => {
        const arq = arquivoFoto.files[0];
        if (!arq) return;
        const leitor = new FileReader();
        leitor.onload = () => {
            const img = new Image();
            img.onload = () => {
                const max = 800;
                const escala = Math.min(1, max / Math.max(img.width, img.height));
                const c = document.createElement("canvas");
                c.width = Math.round(img.width * escala);
                c.height = Math.round(img.height * escala);
                c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                form.elements.foto.value = c.toDataURL("image/jpeg", 0.8);
            };
            img.src = leitor.result;
        };
        leitor.readAsDataURL(arq);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const dados = {};
        let faltando = null;
        ["titulo", "estado", "area", "modalidade", "salario", "local", "requisito", "idade", "horario"].forEach((campo) => {
            dados[campo] = form.elements[campo].value.trim();
            if (!dados[campo] && !faltando) faltando = form.elements[campo];
        });
        if (faltando) {
            erro.textContent = "Preencha todos os campos obrigatórios.";
            erro.hidden = false;
            faltando.focus();
            return;
        }
        dados.estado = dados.estado.toUpperCase();

        let foto = form.elements.foto.value.trim();
        if (foto === "(imagem enviada)" && editando >= 0) foto = vagas[editando].foto;
        dados.foto = foto;

        if (editando >= 0) vagas[editando] = dados;
        else vagas.push(dados);

        if (persistir()) modal.close();
    });

    document.getElementById("adminCancelar").addEventListener("click", () => modal.close());
    document.getElementById("adminNova").addEventListener("click", () => abrirModal(-1));

    grade.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const i = Number(btn.dataset.i);
        if (btn.dataset.acao === "editar") abrirModal(i);
        if (btn.dataset.acao === "excluir" && confirm(`Excluir a vaga "${vagas[i].titulo}"?`)) {
            vagas.splice(i, 1);
            persistir();
        }
    });

    document.getElementById("adminRestaurar").addEventListener("click", () => {
        if (!confirm("Isso apaga todas as alterações feitas aqui e volta para as vagas originais do site. Continuar?")) return;
        restaurarVagas();
        vagas.splice(0, vagas.length, ...carregarVagas());
        montarFiltros();
        render();
    });

    // Gera o array pronto para colar em JS/main.js (assim as mudanças valem para todos os visitantes)
    document.getElementById("adminExportar").addEventListener("click", async (e) => {
        const codigo = "const VAGAS_PADRAO = " + JSON.stringify(vagas, null, 4) + ";";
        const botao = e.currentTarget;
        try {
            await navigator.clipboard.writeText(codigo);
            botao.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Copiado!';
        } catch (err) {
            window.prompt("Copie o código abaixo (Ctrl+C):", codigo);
        }
        setTimeout(() => {
            botao.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i> Copiar código das vagas';
        }, 2000);
    });
})();
