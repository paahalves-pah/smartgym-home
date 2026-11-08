import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  Wrench,
  BrainCircuit,
  Users,
  LogOut,
} from "lucide-react";

interface MenuLateralProps {
  paginaAtual: string;
  onNavegar: (pagina: string) => void;
  onSair: () => void;
}

const itensMenu = [
  { nome: "Dashboard", icone: LayoutDashboard },
  { nome: "Equipamentos", icone: Dumbbell },
  { nome: "Utilizações", icone: Activity },
  { nome: "Manutenções", icone: Wrench },
  { nome: "Inteligência", icone: BrainCircuit },
  { nome: "Usuários", icone: Users },
];

export default function MenuLateral({
  paginaAtual,
  onNavegar,
  onSair,
}: MenuLateralProps) {
  return (
    <aside className="menu-lateral">
      <div className="menu-logo">
        <Activity size={30} />
        <div>
          SmartGym
          <span>HOME</span>
        </div>
      </div>

      <nav className="menu-navegacao">
        {itensMenu.map((item) => {
          const Icone = item.icone;

          return (
            <button
              key={item.nome}
              className={`menu-item ${
                paginaAtual === item.nome ? "ativo" : ""
              }`}
              onClick={() => onNavegar(item.nome)}
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
  );
}
