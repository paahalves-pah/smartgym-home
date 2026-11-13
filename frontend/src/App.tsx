
import { useState } from "react";

import Cabecalho from "./components/Cabecalho";
import MenuLateral from "./components/MenuLateral";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Equipamentos from "./pages/Equipamentos";
import Utilizacoes from "./pages/Utilizacoes";
import Manutencoes from "./pages/Manutencoes";
import Inteligencia from "./pages/Inteligencia";
import Usuarios from "./pages/Usuarios";

import { login as realizarLogin, logout } from "./services/auth";

interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: "ADMIN" | "USER";
  fotoUrl: string | null;
}

export default function App() {
  const [autenticado, setAutenticado] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [paginaAtual, setPaginaAtual] = useState("Dashboard");

  function obterUsuario(): UsuarioAutenticado | null {
    try {
      const usuarioSalvo = localStorage.getItem("usuario");

      return usuarioSalvo
        ? JSON.parse(usuarioSalvo)
        : null;
    } catch {
      return null;
    }
  }

  const usuario = obterUsuario();

  function navegarPagina(pagina: string) {
    if (
      pagina === "Manutenções" &&
      usuario?.tipoUsuario !== "ADMIN"
    ) {
      setPaginaAtual("Dashboard");
      return;
    }

    setPaginaAtual(pagina);
  }

  async function handleLogin(email: string, senha: string) {
    await realizarLogin(email, senha);

    setAutenticado(true);
    setPaginaAtual("Dashboard");
  }

  function handleLogout() {
    logout();

    setAutenticado(false);
    setPaginaAtual("Dashboard");
  }

  function renderizarPagina() {
    switch (paginaAtual) {
      case "Equipamentos":
        return <Equipamentos />;

      case "Utilizações":
        return <Utilizacoes />;

      case "Manutenções":
        return usuario?.tipoUsuario === "ADMIN"
          ? <Manutencoes />
          : <Dashboard usuario={usuario} onNavegar={navegarPagina} />;

      case "Inteligência":
        return <Inteligencia />;

      case "Usuários":
        return usuario?.tipoUsuario === "ADMIN"
          ? <Usuarios />
          : <Dashboard usuario={usuario} onNavegar={navegarPagina} />;

      default:
        return (
          <Dashboard
            usuario={usuario}
            onNavegar={navegarPagina}
          />
        );
    }
  }

  if (!autenticado) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="aplicacao">
      <MenuLateral
        paginaAtual={paginaAtual}
        tipoUsuario={usuario?.tipoUsuario || "USER"}
        onNavegar={navegarPagina}
        onSair={handleLogout}
      />

      <div className="area-principal">
        <Cabecalho
          nome={usuario?.nome || "Usuário"}
          fotoUrl={usuario?.fotoUrl || null}
        />

        <main className="conteudo-principal">
          {renderizarPagina()}
        </main>
      </div>
    </div>
  );
}
