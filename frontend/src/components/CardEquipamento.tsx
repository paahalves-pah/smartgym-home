import { Dumbbell, Wrench, CheckCircle2 } from "lucide-react";

interface CardEquipamentoProps {
  nome: string;
  categoria: string;
  status: string;
  localizacao: string;
}

export default function CardEquipamento({
  nome,
  categoria,
  status,
  localizacao,
}: CardEquipamentoProps) {
  const disponivel = status.toLowerCase() === "disponível";

  return (
    <div className="card-equipamento">
      <div className="equipamento-icone">
        <Dumbbell size={28} />
      </div>

      <div className="equipamento-conteudo">
        <h3>{nome}</h3>
        <p>{categoria}</p>

        <span className="equipamento-local">
          {localizacao}
        </span>

        <div
          className={`equipamento-status ${
            disponivel ? "status-disponivel" : "status-manutencao"
          }`}
        >
          {disponivel ? (
            <CheckCircle2 size={15} />
          ) : (
            <Wrench size={15} />
          )}

          {status}
        </div>
      </div>
    </div>
  );
}