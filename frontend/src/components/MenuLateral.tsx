
import { useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  Wrench,
  BrainCircuit,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface MenuLateralProps {
  paginaAtual: string;
  tipoUsuario: "ADMIN" | "USER";
  onNavegar: (pagina: string) => void;
  onSair: () => void;
}

const itensMenu = [
  { nome: "Dashboard", icone: LayoutDashboard },
  { nome: "Equipamentos", icone: Dumbbell },
  { nome: "Utilizações", icone: Activity },
  { nome: "Manutenções", icone: Wrench, apenasAdmin: true },
  { nome: "Inteligência", icone: BrainCircuit },
  { nome: "Usuários", icone: Users },
];

export default function MenuLateral({
  paginaAtual,
  tipoUsuario,
  onNavegar,
  onSair,
}: MenuLateralProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  function navegar(pagina: string) {
    onNavegar(pagina);
    setMenuAberto(false);
  }

  const itensVisiveis = itensMenu.filter(
    (item) => !item.apenasAdmin || tipoUsuario === "ADMIN"
  );

  return (
    <>
      <button
        className="botao-menu-mobile"
        onClick={() => setMenuAberto(!menuAberto)}
        aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
      >
        {menuAberto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {menuAberto && (
        <div
          className="menu-overlay"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside className={`menu-lateral ${menuAberto ? "menu-aberto" : ""}`}>
        <div className="menu-logo">
          <Activity size={30} />
          <div>
            SmartGym
            <span>HOME</span>
          </div>
        </div>

        <nav className="menu-navegacao">
          {itensVisiveis.map((item) => {
            const Icone = item.icone;

            return (
              <button
                key={item.nome}
                className={`menu-item ${
                  paginaAtual === item.nome ? "ativo" : ""
                }`}
                onClick={() => navegar(item.nome)}
              >
                <Icone size={20} />
                <span>{item.nome}</span>
              </button>
            );
          })}
        </nav>

        <div className="menu-rodape">
          <button
            className="menu-item menu-sair"
            onClick={onSair}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>

          <div className="menu-versao">
            <strong>SmartGym Home</strong>
            <span>Inteligência para sua academia</span>
          </div>
        </div>
      </aside>
    </>
  );
}
