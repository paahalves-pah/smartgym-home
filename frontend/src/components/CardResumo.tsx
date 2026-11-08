import type { LucideIcon } from "lucide-react";

interface CardResumoProps {
  titulo: string;
  valor: string | number;
  descricao: string;
  icone: LucideIcon;
  cor: string;
}

export default function CardResumo({
  titulo,
  valor,
  descricao,
  icone: Icone,
  cor,
}: CardResumoProps) {
  return (
    <div className="card-resumo">
      <div className="card-resumo-topo">
        <span>{titulo}</span>

        <div className={`card-resumo-icone ${cor}`}>
          <Icone size={22} />
        </div>
      </div>

      <h2>{valor}</h2>

      <p>{descricao}</p>
    </div>
  );
}