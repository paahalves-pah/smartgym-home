import {
  Dumbbell,
  Wrench,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";

interface CardEquipamentoProps {
  nome: string;
  categoria: string;
  status: string;
  localizacao: string;
  imagem?: string | null;
  isAdmin?: boolean;
  excluindo?: boolean;
  onEditar?: () => void;
  onExcluir?: () => void;
}

export default function CardEquipamento({
  nome,
  categoria,
  status,
  localizacao,
  imagem,
  isAdmin = false,
  excluindo = false,
  onEditar,
  onExcluir,
}: CardEquipamentoProps) {
  const disponivel = status === "Disponível";

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

  const imagemUrl = imagem ? `${API_URL}${imagem}` : null;

  return (
    <div className="card-equipamento">
      <div className="equipamento-icone">
        {imagemUrl ? (
          <img
            src={imagemUrl}
            alt={nome}
            className="equipamento-imagem"
          />
        ) : (
          <Dumbbell size={28} />
        )}
      </div>

      <div className="equipamento-conteudo">
        <h3>{nome}</h3>

        <p>{categoria}</p>

        <span className="equipamento-local">
          {localizacao || "Sem descrição"}
        </span>

        <div
          className={`equipamento-status ${
            disponivel
              ? "status-disponivel"
              : "status-manutencao"
          }`}
        >
          {disponivel ? (
            <CheckCircle2 size={15} />
          ) : (
            <Wrench size={15} />
          )}

          {status}
        </div>

        {isAdmin && (
          <div className="equipamento-acoes">
            <button
              type="button"
              className="botao-acao-editar"
              onClick={onEditar}
              title="Editar equipamento"
              aria-label={`Editar ${nome}`}
            >
              <Pencil size={16} />
              Editar
            </button>

            <button
              type="button"
              className="botao-acao-excluir"
              onClick={onExcluir}
              disabled={excluindo}
              title="Excluir equipamento"
              aria-label={`Excluir ${nome}`}
            >
              <Trash2 size={16} />
              {excluindo ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}