// Login do administrador (carregado em todas as páginas)
//
// ATENÇÃO: este login roda só no navegador, então serve para esconder os botões
// de edição de quem visita o site, mas NÃO é segurança de verdade: quem abrir o
// código-fonte consegue ver o usuário e a senha. Para um login real é preciso
// um servidor (ex.: Firebase, Supabase).
const ADMIN_USUARIO = "admin";
const ADMIN_SENHA = "lupita2026"; // troque antes de publicar
const ADMIN_CHAVE = "lupita_admin";

const Auth = {
    estaLogado() {
        try { return sessionStorage.getItem(ADMIN_CHAVE) === "1"; } catch (e) { return false; }
    },
    entrar(usuario, senha) {
        if (usuario.trim() === ADMIN_USUARIO && senha === ADMIN_SENHA) {
            sessionStorage.setItem(ADMIN_CHAVE, "1");
            return true;
        }
        return false;
    },
    sair() {
        sessionStorage.removeItem(ADMIN_CHAVE);
    }
};

// Troca o botão "Login" do menu por "Sair" quando o admin está logado
document.addEventListener("DOMContentLoaded", () => {
    if (!Auth.estaLogado()) return;
    document.querySelectorAll(".navbar-menu .login").forEach((link) => {
        link.innerHTML = "<b>Sair</b>";
        link.setAttribute("href", "#");
        link.addEventListener("click", (e) => {
            e.preventDefault();
            Auth.sair();
            location.reload();
        });
    });
});
