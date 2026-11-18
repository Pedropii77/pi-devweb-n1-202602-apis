(function () {
    const form = document.getElementById("formLogin");
    if (!form) return;

    // Já está logado: vai direto para a página de vagas
    if (Auth.estaLogado()) {
        location.replace("./vagas.html");
        return;
    }

    const usuario = document.getElementById("loginUsuario");
    const senha = document.getElementById("loginSenha");
    const erro = document.getElementById("loginErro");
    const esqueci = document.getElementById("loginEsqueci");
    const aviso = document.getElementById("loginAviso");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        erro.hidden = true;
        if (Auth.entrar(usuario.value, senha.value)) {
            location.href = "./vagas.html";
            return;
        }
        erro.hidden = false;
        senha.value = "";
        senha.focus();
    });

    esqueci.addEventListener("click", (e) => {
        e.preventDefault();
        aviso.hidden = !aviso.hidden;
    });
})();
