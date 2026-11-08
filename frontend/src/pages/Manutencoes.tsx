import { useState } from "react";
import {
  Wrench,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CalendarDays,
  UserRound,
} from "lucide-react";

interface Manutencao {
  id: number;
  equipamento: string;
  tipo: string;
  responsavel: string;
  data: string;
  prioridade: string;
  status: string;
}

export default function Manutencoes() {
  const [busca, setBusca] = useState("");

  const [manutencoes, setManutencoes] = useState<Manutencao[]>([
    {
      id: 1,
      equipamento: "Bicicleta Ergométrica",
      tipo: "Preventiva",
      responsavel: "Carlos Mendes",
      data: "05/11/2026",
      prioridade: "Alta",
      status: "Pendente",
    },
    {
      id: 2,
      equipamento: "Esteira Elétrica Pro",
      tipo: "Corretiva",
      responsavel: "Roberto Lima",
      data: "04/11/2026",
      prioridade: "Média",
      status: "Em andamento",
    },
    {
      id: 3,
      equipamento: "Leg Press 45°",
      tipo: "Preventiva",
      responsavel: "Carlos Mendes",
      data: "03/11/2026",
      prioridade: "Baixa",
      status: "Concluída",
    },
  ]);

  function concluirManutencao(id: number) {
    setManutencoes((lista) =>
      lista.map((item) =>
        item.id === id
          ? { ...item, status: "Concluída" }
          : item
      )
    );
  }

  const manutencoesFiltradas = manutencoes.filter((item) =>
    `${item.equipamento} ${item.responsavel} ${item.tipo}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const pendentes = manutencoes.filter(
    (item) => item.status === "Pendente"
  ).length;

  const andamento = manutencoes.filter(
    (item) => item.status === "Em andamento"
  ).length;

  const concluidas = manutencoes.filter(
    (item) => item.status === "Concluída"
  ).length;

  return (
    <div className="pagina-conteudo pagina-manutencoes">

      {/* Cabeçalho */}
      <div className="pagina-titulo">
        <div>
          <span className="texto-destaque">GESTÃO PREVENTIVA</span>

          <h1>Manutenções</h1>

          <p>
            Controle reparos e mantenha os equipamentos operacionais.
          </p>
        </div>

        <button className="botao-primario">
          <Wrench size={18} />
          Nova manutenção
        </button>
      </div>

      {/* Indicadores */}
      <div className="manutencao-indicadores">

        <div className="indicador-manutencao">
          <div className="indicador-manutencao-icone indicador-pendente">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Pendentes</span>
            <strong>{pendentes}</strong>
          </div>
        </div>

        <div className="indicador-manutencao">
          <div className="indicador-manutencao-icone indicador-andamento">
            <Clock size={22} />
          </div>

          <div>
            <span>Em andamento</span>
            <strong>{andamento}</strong>
          </div>
        </div>

        <div className="indicador-manutencao">
          <div className="indicador-manutencao-icone indicador-concluido">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Concluídas</span>
            <strong>{concluidas}</strong>
          </div>
        </div>

      </div>

      {/* Busca e quantidade */}
      <div className="manutencao-toolbar">

        <div className="campo-busca">
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar equipamento ou responsável..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <div className="manutencao-contagem">
          <Wrench size={18} />

          <span>
            <strong>{manutencoesFiltradas.length}</strong>{" "}
            manutenções encontradas
          </span>
        </div>

      </div>

      {/* Lista de manutenções */}
      <div className="manutencao-lista">

        {manutencoesFiltradas.map((item) => (
          <div className="manutencao-card" key={item.id}>

            <div className="manutencao-icone">
              <Wrench size={24} />
            </div>

            <div className="manutencao-info">

              <h3>{item.equipamento}</h3>

              <div className="manutencao-tipo">
                <span>{item.tipo}</span>
                <span className="manutencao-separador">•</span>
                <span>{item.status}</span>
              </div>

              <div className="manutencao-responsavel">
                <UserRound size={15} />
                {item.responsavel}
              </div>

              <div className="manutencao-data">
                <CalendarDays size={15} />
                Data: {item.data}
              </div>

            </div>

            <div className="manutencao-detalhes">

              <span
                className={`prioridade-badge prioridade-${item.prioridade.toLowerCase()}`}
              >
                Prioridade {item.prioridade}
              </span>

              <span
                className={`status-badge ${
                  item.status === "Concluída"
                    ? "status-finalizado"
                    : item.status === "Pendente"
                    ? "status-pendente"
                    : "status-ativo"
                }`}
              >
                {item.status}
              </span>

            </div>

            {item.status !== "Concluída" && (
              <button
                className="botao-acao"
                onClick={() => concluirManutencao(item.id)}
              >
                <CheckCircle2 size={16} />
                Concluir
              </button>
            )}

          </div>
        ))}

      </div>

      {/* Estado vazio */}
      {manutencoesFiltradas.length === 0 && (
        <div className="estado-vazio">
          <Wrench size={32} />

          <h3>Nenhuma manutenção encontrada</h3>

          <p>
            Tente alterar sua busca para encontrar uma manutenção.
          </p>
        </div>
      )}

    </div>
  );
}