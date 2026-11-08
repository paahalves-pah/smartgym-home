import { useState } from "react";
import {
  Activity,
  Search,
  Play,
  Square,
  Clock,
  UserRound,
  Dumbbell,
} from "lucide-react";

interface Utilizacao {
  id: number;
  aluno: string;
  equipamento: string;
  inicio: string;
  duracao: string;
  status: string;
}

export default function Utilizacoes() {
  const [busca, setBusca] = useState("");

  const [utilizacoes, setUtilizacoes] = useState<Utilizacao[]>([
    {
      id: 1,
      aluno: "Mariana Oliveira",
      equipamento: "Esteira Elétrica Pro",
      inicio: "08:30",
      duracao: "25 min",
      status: "Em andamento",
    },
    {
      id: 2,
      aluno: "Lucas Santos",
      equipamento: "Leg Press 45°",
      inicio: "09:00",
      duracao: "35 min",
      status: "Finalizada",
    },
    {
      id: 3,
      aluno: "Ana Costa",
      equipamento: "Bicicleta Ergométrica",
      inicio: "09:15",
      duracao: "18 min",
      status: "Em andamento",
    },
  ]);

  function finalizarUtilizacao(id: number) {
    setUtilizacoes((lista) =>
      lista.map((item) =>
        item.id === id
          ? { ...item, status: "Finalizada" }
          : item
      )
    );
  }

  const utilizacoesFiltradas = utilizacoes.filter((item) =>
    `${item.aluno} ${item.equipamento}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const utilizacoesEmAndamento = utilizacoes.filter(
    (item) => item.status === "Em andamento"
  ).length;

  return (
    <div className="pagina-conteudo pagina-utilizacoes">

      {/* Cabeçalho */}
      <div className="pagina-titulo">
        <div>
          <span className="texto-destaque">MONITORAMENTO</span>

          <h1>Utilizações</h1>

          <p>
            Acompanhe a utilização dos equipamentos da academia.
          </p>
        </div>

        <button className="botao-primario">
          <Play size={18} />
          Nova utilização
        </button>
      </div>

      {/* Indicadores */}
      <div className="utilizacao-resumo">

        <div className="utilizacao-indicador">
          <div className="utilizacao-indicador-icone">
            <Activity size={22} />
          </div>

          <div>
            <span>Utilizações registradas</span>
            <strong>{utilizacoes.length}</strong>
          </div>
        </div>

        <div className="utilizacao-indicador">
          <div className="utilizacao-indicador-icone">
            <Clock size={22} />
          </div>

          <div>
            <span>Em andamento</span>
            <strong>{utilizacoesEmAndamento}</strong>
          </div>
        </div>

      </div>

      {/* Busca e quantidade */}
      <div className="utilizacoes-toolbar">

        <div className="campo-busca">
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar aluno ou equipamento..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <div className="utilizacoes-contagem">
          <Dumbbell size={18} />

          <span>
            <strong>{utilizacoesFiltradas.length}</strong>{" "}
            utilizações encontradas
          </span>
        </div>

      </div>

      {/* Tabela */}
      <div className="tabela-container tabela-utilizacoes-container">

        <table className="tabela tabela-utilizacoes">

          <thead>
            <tr>
              <th>Aluno</th>
              <th>Equipamento</th>
              <th>Início</th>
              <th>Duração</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>

            {utilizacoesFiltradas.map((item) => (
              <tr key={item.id}>

                <td>
                  <div className="tabela-usuario">
                    <div className="utilizacao-aluno-icone">
                      <UserRound size={18} />
                    </div>

                    <span>{item.aluno}</span>
                  </div>
                </td>

                <td>
                  <div className="utilizacao-equipamento">
                    <Dumbbell size={16} />
                    {item.equipamento}
                  </div>
                </td>

                <td>{item.inicio}</td>

                <td>{item.duracao}</td>

                <td>
                  <span
                    className={`status-badge ${
                      item.status === "Em andamento"
                        ? "status-ativo"
                        : "status-finalizado"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td>
                  {item.status === "Em andamento" ? (
                    <button
                      className="botao-acao"
                      onClick={() => finalizarUtilizacao(item.id)}
                      title="Finalizar utilização"
                    >
                      <Square size={16} />
                      Finalizar
                    </button>
                  ) : (
                    <span className="utilizacao-concluida">
                      Concluída
                    </span>
                  )}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* Estado vazio */}
      {utilizacoesFiltradas.length === 0 && (
        <div className="estado-vazio">
          <Activity size={32} />

          <h3>Nenhuma utilização encontrada</h3>

          <p>
            Tente alterar sua busca para encontrar uma utilização.
          </p>
        </div>
      )}

    </div>
  );
}