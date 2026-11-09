import { UserRound } from "lucide-react";

interface CabecalhoProps {
  nome?: string;
  fotoUrl?: string | null;
}

const API_URL = "http://localhost:3000";

export default function Cabecalho({
  nome = "Usuário",
  fotoUrl,
}: CabecalhoProps) {
  const fotoCompleta = fotoUrl
    ? `${API_URL}${fotoUrl}`
    : null;

  return (
    <header className="cabecalho">
      <div className="cabecalho-acoes">
        <div className="usuario-info">
          <div className="usuario-avatar">
            {fotoCompleta ? (
              <img
                src={fotoCompleta}
                alt={`Foto de perfil de ${nome}`}
              />
            ) : (
              <UserRound size={20} />
            )}
          </div>

          <span>{nome}</span>
        </div>
      </div>
    </header>
  );
}