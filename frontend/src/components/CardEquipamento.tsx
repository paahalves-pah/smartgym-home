import {
  Dumbbell,
  Wrench,
  CheckCircle2,
  Pencil,
  Trash2,
  Activity,
  Ban,
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
  onAmpliarImagem?: (url: string, nome: string) => void;
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
  onAmpliarImagem,
}: CardEquipamentoProps) {
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

  const imagemUrl = imagem ? `${API_URL}${imagem}` : null;

  const configuracaoStatus = {
    "Disponível": {
      classe: "status-disponivel",
      Icone: CheckCircle2,
    },
    "Em uso": {
      classe: "status-em-uso",
      Icone: Activity,
    },
    "Em manutenção": {
      classe: "status-manutencao",
      Icone: Wrench,
    },
    "Inativo": {
      classe: "status-inativo",
      Icone: Ban,
    },
  };

  const configuracao =
    configuracaoStatus[status as keyof typeof configuracaoStatus] ||
    configuracaoStatus["Inativo"];

  const IconeStatus = configuracao.Icone;

  return (
    <div className="card-equipamento">
      <div className="equipamento-icone">
        {imagemUrl ? (
          <button
            type="button"
            className="equipamento-imagem-botao"
            onClick={() => onAmpliarImagem?.(imagemUrl, nome)}
            title="Ampliar imagem"
            aria-label={`Ampliar imagem de ${nome}`}
          >
            <img
              src={imagemUrl}
              alt={nome}
              className="equipamento-imagem"
            />
          </button>
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
          className={`equipamento-status ${configuracao.classe}`}
        >
          <IconeStatus size={15} />
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