
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

export default function App() {
  const [autenticado, setAutenticado] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [paginaAtual, setPaginaAtual] = useState("Dashboard");

  const usuarioSalvo = localStorage.getItem("usuario");

  const usuario = usuarioSalvo
    ? JSON.parse(usuarioSalvo)
    : null;

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
        return <Manutencoes />;

      case "Inteligência":
        return <Inteligencia />;

      case "Usuários":
        return <Usuarios />;

      default:
        return <Dashboard onNavegar={setPaginaAtual} />;
    }
  }

  if (!autenticado) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="aplicacao">
      <MenuLateral
        paginaAtual={paginaAtual}
        onNavegar={setPaginaAtual}
        onSair={handleLogout}
      />

      <div className="area-principal">
        <Cabecalho nome={usuario?.nome || "Usuário"} />

        <main className="conteudo-principal">
          {renderizarPagina()}
        </main>
      </div>
    </div>
  );
}
