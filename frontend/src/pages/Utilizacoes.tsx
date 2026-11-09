
import { useEffect, useState } from "react";

import {
  Activity,
  Search,
  Play,
  Clock,
  UserRound,
  Dumbbell,
  X,
} from "lucide-react";

import { apiRequest } from "../services/api";

interface Utilizacao {
  id: number;
  usuario?: {
    id: number;
    nome?: string;
    email?: string;
  };
  aluno: string;
  equipamento: string;
  inicio: string;
  fim?: string | null;
  duracao: string;
  status: string;
}

interface Equipamento {
  id: number;
  nome: string;
  categoria?: string;
  status: string;
  ativo: boolean;
}

function formatarData(data?: string | null) {
  if (!data) return "—";

  return new Date(data).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatarDuracao(
  segundos?: number,
  inicio?: string,
  fim?: string | null
) {
  let totalSegundos = segundos;

  if (
    totalSegundos === undefined &&
    inicio &&
    fim
  ) {
    totalSegundos = Math.floor(
      (new Date(fim).getTime() -
        new Date(inicio).getTime()) /
        1000
    );
  }

  if (
    totalSegundos === undefined ||
    totalSegundos === null
  ) {
    return "Em andamento";
  }

  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor(
    (totalSegundos % 3600) / 60
  );

  if (horas > 0) {
    return `${horas}h ${minutos}min`;
  }

  return `${minutos} min`;
}

function normalizarUtilizacao(item: any): Utilizacao {
  const inicio = item.inicioEm ?? item.inicio;
  const fim = item.fimEm ?? item.fim ?? null;

  const status =
    item.status === "EM_ANDAMENTO"
      ? "Em andamento"
      : item.status === "FINALIZADA"
        ? "Finalizada"
        : item.status;

  return {
    id: item.id,
    usuario: item.usuario,
    aluno:
      item.usuario?.nome ??
      item.usuario?.email ??
      item.aluno ??
      "Usuário",
    equipamento:
      item.equipamento?.nome ??
      item.equipamento ??
      "Equipamento",
    inicio,
    fim,
    duracao:
      status === "Finalizada"
        ? formatarDuracao(
            item.duracaoSegundos,
            inicio,
            fim
          )
        : "Em andamento",
    status,
  };
}

export default function Utilizacoes() {
  const [busca, setBusca] = useState("");

  const [utilizacoes, setUtilizacoes] = useState<
    Utilizacao[]
  >([]);

  const [equipamentos, setEquipamentos] = useState<
    Equipamento[]
  >([]);

  const [modalAberto, setModalAberto] = useState(false);

  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState("");

  const [carregando, setCarregando] = useState(true);

  const [iniciando, setIniciando] = useState(false);

  const [finalizando, setFinalizando] = useState<
    number | null
  >(null);

  const [erro, setErro] = useState("");

  const [mensagem, setMensagem] = useState("");

  const usuarioSalvo = localStorage.getItem("usuario");

  let usuario: any = null;

  try {
    usuario = usuarioSalvo
      ? JSON.parse(usuarioSalvo)
      : null;
  } catch {
    usuario = null;
  }

  const ehAdmin = usuario?.tipoUsuario === "ADMIN";

  async function carregarUtilizacoes() {
    try {
      setCarregando(true);
      setErro("");

      const endpoint = ehAdmin
        ? "/utilizacoes"
        : "/utilizacoes/meu-historico";

      const dados = await apiRequest(endpoint);

      setUtilizacoes(
        Array.isArray(dados)
          ? dados.map(normalizarUtilizacao)
          : []
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as utilizações."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarEquipamentos() {
    try {
      const dados = await apiRequest("/equipamentos");

      setEquipamentos(
        Array.isArray(dados)
          ? dados.filter(
              (equipamento: Equipamento) =>
                equipamento.ativo &&
                equipamento.status === "DISPONIVEL"
            )
          : []
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os equipamentos."
      );
    }
  }

  useEffect(() => {
    carregarUtilizacoes();
    carregarEquipamentos();
  }, []);

  async function iniciarUtilizacao() {
    if (!equipamentoSelecionado) {
      setErro("Selecione um equipamento para iniciar.");
      return;
    }

    try {
      setIniciando(true);
      setErro("");
      setMensagem("");

      await apiRequest("/utilizacoes/iniciar", {
        method: "POST",
        body: JSON.stringify({
          equipamentoId: Number(equipamentoSelecionado),
        }),
      });

      setMensagem("Utilização iniciada com sucesso!");

      setModalAberto(false);
      setEquipamentoSelecionado("");

      await carregarUtilizacoes();
      await carregarEquipamentos();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a utilização."
      );
    } finally {
      setIniciando(false);
    }
  }

  async function finalizarUtilizacao(id: number) {
    try {
      setFinalizando(id);
      setErro("");
      setMensagem("");

      await apiRequest(
        `/utilizacoes/${id}/finalizar`,
        {
          method: "PATCH",
        }
      );

      setMensagem("Utilização finalizada com sucesso!");

      await carregarUtilizacoes();
      await carregarEquipamentos();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar a utilização."
      );
    } finally {
      setFinalizando(null);
    }
  }

  const utilizacoesFiltradas = utilizacoes.filter(
    (item) =>
      `${item.aluno} ${item.equipamento}`
        .toLowerCase()
        .includes(busca.toLowerCase())
  );

  const utilizacoesEmAndamento = utilizacoes.filter(
    (item) => item.status === "Em andamento"
  ).length;

  return (
    <div className="pagina-conteudo pagina-utilizacoes">

      <div className="pagina-titulo">
        <div>
          <span className="texto-destaque">
            MONITORAMENTO
          </span>

          <h1>Utilizações</h1>

          <p>
            Acompanhe a utilização dos equipamentos da academia.
          </p>
        </div>

        <button
          className="botao-primario"
          onClick={() => {
            setErro("");
            setMensagem("");
            carregarEquipamentos();
            setModalAberto(true);
          }}
        >
          <Play size={18} />
          Nova utilização
        </button>
      </div>

      {erro && (
        <div className="mensagem-erro">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mensagem-sucesso">
          {mensagem}
        </div>
      )}

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

      <div className="utilizacoes-toolbar">

        <div className="campo-busca">
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar aluno ou equipamento..."
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
          />
        </div>

        <div className="utilizacoes-contagem">
          <Dumbbell size={18} />

          <span>
            <strong>
              {utilizacoesFiltradas.length}
            </strong>{" "}
            utilizações encontradas
          </span>
        </div>

      </div>

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

            {!carregando &&
              utilizacoesFiltradas.map((item) => (
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

                  <td>
                    {formatarData(item.inicio)}
                  </td>

                  <td>
                    {item.duracao}
                  </td>

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
                        type="button"
                        className="botao-finalizar-utilizacao"
                        onClick={() =>
                          finalizarUtilizacao(item.id)
                        }
                        disabled={finalizando === item.id}
                      >
                        {finalizando === item.id
                          ? "Finalizando..."
                          : "Finalizar"}
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

      {carregando && (
        <div className="estado-vazio">
          <Activity size={32} />
          <h3>Carregando utilizações...</h3>
        </div>
      )}

      {!carregando &&
        utilizacoesFiltradas.length === 0 && (
          <div className="estado-vazio">
            <Activity size={32} />

            <h3>Nenhuma utilização encontrada</h3>

            <p>
              Tente alterar sua busca ou iniciar uma nova utilização.
            </p>
          </div>
        )}

      {modalAberto && (
        <div className="modal-overlay">

          <div className="modal-equipamento">

            <div className="modal-cabecalho">
              <div>
                <span className="texto-destaque">
                  REGISTRO
                </span>

                <h2>Nova utilização</h2>

                <p>
                  Selecione o equipamento que será utilizado.
                  O horário de início será registrado automaticamente.
                </p>
              </div>

              <button
                className="botao-fechar-modal"
                onClick={() => setModalAberto(false)}
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="campo-formulario">

              <label htmlFor="equipamento">
                Equipamento
              </label>

              <select
                id="equipamento"
                value={equipamentoSelecionado}
                onChange={(event) =>
                  setEquipamentoSelecionado(event.target.value)
                }
              >
                <option value="">
                  Selecione um equipamento
                </option>

                {equipamentos.map((equipamento) => (
                  <option
                    key={equipamento.id}
                    value={equipamento.id}
                  >
                    {equipamento.nome}
                  </option>
                ))}
              </select>

            </div>

            {equipamentos.length === 0 && (
              <p>
                Nenhum equipamento disponível no momento.
              </p>
            )}

            <div className="modal-acoes">

              <button
                className="botao-secundario"
                onClick={() => setModalAberto(false)}
                disabled={iniciando}
              >
                Cancelar
              </button>

              <button
                className="botao-primario"
                onClick={iniciarUtilizacao}
                disabled={
                  iniciando ||
                  !equipamentoSelecionado ||
                  equipamentos.length === 0
                }
              >
                <Play size={16} />

                {iniciando
                  ? "Iniciando..."
                  : "Iniciar utilização"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
