import { UserRound } from "lucide-react";

interface CabecalhoProps {
  nome?: string;
}

export default function Cabecalho({
  nome = "Usuário",
}: CabecalhoProps) {
  return (
    <header className="cabecalho">
      <div className="cabecalho-acoes">
        <div className="usuario-info">
          <div className="usuario-avatar">
            <UserRound size={20} />
          </div>

          <span>{nome}</span>
        </div>
      </div>
    </header>
  );
}