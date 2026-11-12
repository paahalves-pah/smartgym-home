
import { useEffect, useMemo, useState } from "react";

import {
  Dumbbell,
  CheckCircle2,
  Wrench,
  Activity,
  ArrowUpRight,
  UserPlus,
  CalendarCheck,
  TrendingUp,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

import { apiRequest } from "../services/api";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: "ADMIN" | "USER";
  fotoUrl: string | null;
}

interface DashboardProps {
  usuario: Usuario | null;
  onNavegar?: (pagina: string) => void;
}

interface Equipamento {
  id: number;
  nome: string;
  categoria: string;
  status:
    | "DISPONIVEL"
    | "EM_MANUTENCAO"
    | "INATIVO"
    | "EM_USO";
  ativo: boolean;
}

interface ResumoDashboard {
  totalEquipamentos: number;
  equipamentosDisponiveis: number;
  equipamentosEmUso: number;
  equipamentosEmManutencao: number;
  equipamentosInativos: number;
  manutencoesAgendadas: number;
  manutencoesEmAndamento: number;
  utilizacoesAtivas: number;
  totalUsuarios: number;
  usuariosAtivos: number;
}

interface UsoSemanal {
  data: string;
  dia: string;
  total: number;
}

interface HistoricoUtilizacao {
  id: number;
  equipamento: string;
  inicioEm: string;
  fimEm: string | null;
  status: "EM_ANDAMENTO" | "FINALIZADA";
}

interface DesempenhoUsuario {
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
  totalTreinos: number;
  tempoTotalMinutos: number;
  tempoTotalHoras: number;
  utilizacoesAtivas: number;
  historico: HistoricoUtilizacao[];
}

interface UsoPessoal {
  data: string;
  dia: string;
  total: number;
}

export default function Dashboard({
  usuario,
  onNavegar,
}: DashboardProps) {
  const isAdmin = usuario?.tipoUsuario === "ADMIN";

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [usoSemanal, setUsoSemanal] = useState<UsoSemanal[]>([]);
  const [desempenho, setDesempenho] =
    useState<DesempenhoUsuario | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [carregandoGeral, setCarregandoGeral] = useState(true);
  const [carregandoPessoal, setCarregandoPessoal] = useState(true);

  const [erro, setErro] = useState("");
  const [erroGeral, setErroGeral] = useState("");
  const [erroPessoal, setErroPessoal] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarEquipamentos() {
      try {
        const dados = await apiRequest("/equipamentos");

        if (ativo) {
          setEquipamentos(dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os equipamentos."
          );
        }
      }
    }

    async function carregarResumo() {
      try {
        const dados: ResumoDashboard = await apiRequest(
          "/dashboard/resumo"
        );

        if (ativo) {
          setResumo(dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os indicadores."
          );
        }
      }
    }

    async function carregarUsoSemanal() {
      if (!isAdmin) {
        setCarregandoGeral(false);
        return;
      }

      try {
        setCarregandoGeral(true);
        setErroGeral("");

        const dados: UsoSemanal[] = await apiRequest(
          "/dashboard/uso-semanal"
        );

        if (ativo) {
          setUsoSemanal(dados);
        }
      } catch (error) {
        if (ativo) {
          setErroGeral(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o uso geral."
          );
        }
      } finally {
        if (ativo) {
          setCarregandoGeral(false);
        }
      }
    }

    async function carregarDesempenhoPessoal() {
      try {
        setCarregandoPessoal(true);
        setErroPessoal("");

        const dados: DesempenhoUsuario = await apiRequest(
          "/dashboard/desempenho"
        );

        if (ativo) {
          setDesempenho(dados);
        }
      } catch (error) {
        if (ativo) {
          setErroPessoal(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar seu histórico."
          );
        }
      } finally {
        if (ativo) {
          setCarregandoPessoal(false);
        }
      }
    }

    async function carregarDashboard() {
      setCarregando(true);

      await Promise.all([
        carregarEquipamentos(),
        carregarResumo(),
        carregarUsoSemanal(),
        carregarDesempenhoPessoal(),
      ]);

      if (ativo) {
        setCarregando(false);
      }
    }

    carregarDashboard();

    return () => {
      ativo = false;
    };
  }, [isAdmin]);

  const disponiveis =
    resumo?.equipamentosDisponiveis ??
    equipamentos.filter(
      (equipamento) =>
        equipamento.status === "DISPONIVEL" &&
        equipamento.ativo
    ).length;

  const totalEquipamentos =
    resumo?.totalEquipamentos ?? equipamentos.length;

  const equipamentosEmUso = isAdmin
    ? resumo?.equipamentosEmUso ?? 0
    : desempenho?.utilizacoesAtivas ?? 0;

  const manutencao =
    resumo?.equipamentosEmManutencao ??
    equipamentos.filter(
      (equipamento) =>
        equipamento.status === "EM_MANUTENCAO"
    ).length;

  const maiorUsoSemanal = Math.max(
    1,
    ...usoSemanal.map((item) => item.total)
  );

  const usoPessoal = useMemo(() => {
    if (!desempenho?.historico) return [];

    const dias = new Map<string, UsoPessoal>();

    for (const utilizacao of desempenho.historico) {
      if (
        utilizacao.status !== "FINALIZADA" ||
        !utilizacao.fimEm
      ) {
        continue;
      }

      const data = new Date(utilizacao.inicioEm);

      const chave = [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0"),
      ].join("-");

      if (!dias.has(chave)) {
        dias.set(chave, {
          data: chave,
          dia: data.toLocaleDateString("pt-BR", {
            weekday: "short",
          }),
          total: 0,
        });
      }

      dias.get(chave)!.total++;
    }

    return Array.from(dias.values())
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(-7);
  }, [desempenho]);

  const maiorUsoPessoalGrafico = Math.max(
    1,
    ...usoPessoal.map((item) => item.total)
  );

  function renderizarGrafico(
    dados: UsoSemanal[],
    maiorUso: number,
    legenda: string
  ) {
    return (
      <>
        <div className="grafico">
          <div className="grafico-eixo">
            {[4, 3, 2, 1, 0].map((valor) => (
              <span key={valor}>
                {Math.ceil(maiorUso / 4) * valor}
              </span>
            ))}
          </div>

          <div className="grafico-colunas">
            {dados.map((item) => {
              const altura =
                item.total > 0
                  ? (item.total / maiorUso) * 100
                  : 0;

              return (
                <div
                  className="grafico-coluna"
                  key={item.data}
                  title={`${item.data}: ${item.total} utilizações`}
                >
                  <strong>{item.total}</strong>

                  <div
                    className="grafico-barra"
                    style={{ height: `${altura}%` }}
                  />

                  <span>{item.dia}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grafico-legenda">
          <span className="legenda-ponto" />
          {legenda}
        </div>
      </>
    );
  }

  function renderizarGraficoGeral() {
    return (
      <section className="dashboard-bloco dashboard-grafico">
        <div className="bloco-cabecalho">
          <div>
            <h2>Utilização geral da academia</h2>
            <p>Últimos sete dias · Todos os usuários</p>
          </div>

          <Activity size={20} />
        </div>

        {carregandoGeral ? (
          <div className="grafico-mensagem">
            Carregando dados de utilização...
          </div>
        ) : erroGeral ? (
          <div className="grafico-mensagem grafico-erro">
            <AlertCircle size={18} />
            {erroGeral}
          </div>
        ) : usoSemanal.length === 0 ? (
          <div className="grafico-mensagem">
            Nenhum dado disponível para o período.
          </div>
        ) : (
          renderizarGrafico(
            usoSemanal,
            maiorUsoSemanal,
            "Utilizações finalizadas de todos os usuários"
          )
        )}
      </section>
    );
  }

  function renderizarGraficoPessoal() {
    return (
      <section className="dashboard-bloco dashboard-grafico">
        <div className="bloco-cabecalho">
          <div>
            <h2>Minha utilização</h2>
            <p>Suas últimas sete datas de utilização</p>
          </div>

          <Activity size={20} />
        </div>

        {carregandoPessoal ? (
          <div className="grafico-mensagem">
            Carregando seu histórico...
          </div>
        ) : erroPessoal ? (
          <div className="grafico-mensagem grafico-erro">
            <AlertCircle size={18} />
            {erroPessoal}
          </div>
        ) : usoPessoal.length === 0 ? (
          <div className="grafico-mensagem">
            Você ainda não possui utilizações finalizadas.
          </div>
        ) : (
          <>
            {renderizarGrafico(
              usoPessoal,
              maiorUsoPessoalGrafico,
              "Suas utilizações finalizadas por dia"
            )}

            <div className="dashboard-resumo-pessoal">
              <div>
                <span>Treinos finalizados</span>
                <strong>{desempenho?.totalTreinos ?? 0}</strong>
              </div>

              <div>
                <span>Tempo total de treino</span>
                <strong>
                  {desempenho?.tempoTotalHoras ?? 0} h
                </strong>
              </div>

              <div>
                <span>Utilizações em andamento</span>
                <strong>
                  {desempenho?.utilizacoesAtivas ?? 0}
                </strong>
              </div>
            </div>
          </>
        )}
      </section>
    );
  }

  function renderizarIndicadoresUsuario() {
    return (
      <div
        className="dashboard-indicadores dashboard-indicadores-lateral"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div className="indicador-card">
          <div className="indicador-icone">
            <Dumbbell />
          </div>

          <div>
            <span>Equipamentos em uso</span>
            <strong>
              {carregando ? "..." : equipamentosEmUso}
            </strong>
            <small>Equipamentos em utilização</small>
          </div>
        </div>

        <div className="indicador-card">
          <div className="indicador-icone">
            <CheckCircle2 />
          </div>

          <div>
            <span>Disponíveis</span>
            <strong>
              {carregando
                ? "..."
                : `${disponiveis}/${totalEquipamentos}`}
            </strong>
            <small>Equipamentos disponíveis</small>
          </div>
        </div>

        <div className="indicador-card">
          <div className="indicador-icone">
            <Activity />
          </div>

          <div>
            <span>Usuários ativos</span>
            <strong>
              {carregando
                ? "..."
                : `${resumo?.usuariosAtivos ?? 0}/${resumo?.totalUsuarios ?? 0}`}
            </strong>
            <small>
              Pessoas utilizando equipamentos / usuários cadastrados
            </small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-moderno">
      <div className="dashboard-topo">
        <div>
          <h1>
            Bem-vindo ao SmartGym,{" "}
            {usuario?.nome || "Usuário"}!
          </h1>

          <p>
            {isAdmin
              ? "Acompanhe o funcionamento da sua academia."
              : "Confira seu histórico e sua evolução na academia."}
          </p>
        </div>

        <div className="dashboard-status">
          <Activity size={18} />
          <span>Academia em tempo real</span>
        </div>
      </div>

      {erro && (
        <div className="dashboard-erro">
          <AlertCircle size={18} />
          {erro}
        </div>
      )}

      {isAdmin ? (
        <>
          <div className="dashboard-indicadores">
            <div className="indicador-card">
              <div className="indicador-icone">
                <Dumbbell />
              </div>

              <div>
                <span>Equipamentos em uso</span>
                <strong>
                  {carregando ? "..." : equipamentosEmUso}
                </strong>
                <small>Equipamentos em utilização</small>
              </div>
            </div>

            <div className="indicador-card">
              <div className="indicador-icone">
                <CheckCircle2 />
              </div>

              <div>
                <span>Disponíveis</span>
                <strong>
                  {carregando
                    ? "..."
                    : `${disponiveis}/${totalEquipamentos}`}
                </strong>
                <small>Equipamentos disponíveis</small>
              </div>
            </div>

            <div className="indicador-card">
              <div className="indicador-icone">
                <Activity />
              </div>

              <div>
                <span>Usuários ativos</span>
                <strong>
                  {carregando
                    ? "..."
                    : `${resumo?.usuariosAtivos ?? 0}/${resumo?.totalUsuarios ?? 0}`}
                </strong>
                <small>
                  Pessoas utilizando equipamentos / usuários cadastrados
                </small>
              </div>
            </div>

            <div className="indicador-card indicador-alerta">
              <div className="indicador-icone">
                <Wrench />
              </div>

              <div>
                <span>Manutenções</span>
                <strong>
                  {carregando ? "..." : manutencao}
                </strong>
                <small>Equipamentos em manutenção</small>
              </div>
            </div>
          </div>

          <div
            className="dashboard-paineis"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "16px",
              alignItems: "start",
            }}
          >
            {renderizarGraficoGeral()}
            {renderizarGraficoPessoal()}
          </div>
        </>
      ) : (
        <div
          className="dashboard-layout-usuario"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 2.2fr) minmax(220px, 1fr)",
            gap: "16px",
            alignItems: "start",
          }}
        >
          {renderizarGraficoPessoal()}
          {renderizarIndicadoresUsuario()}
        </div>
      )}

      <section className="dashboard-bloco dashboard-recentes">
        <div className="bloco-cabecalho">
          <div>
            <h2>Equipamentos cadastrados</h2>
            <p>Confira os equipamentos mais recentes.</p>
          </div>

          <button
            className="dashboard-link"
            onClick={() => onNavegar?.("Equipamentos")}
          >
            Ver todos <ArrowUpRight size={16} />
          </button>
        </div>

        {carregando ? (
          <p>Carregando equipamentos...</p>
        ) : equipamentos.length === 0 ? (
          <p>Nenhum equipamento cadastrado.</p>
        ) : (
          <div className="dashboard-lista">
            {equipamentos.slice(0, 3).map((equipamento) => (
              <div
                className="dashboard-equipamento"
                key={equipamento.id}
              >
                <div className="equipamento-mini-icone">
                  <Dumbbell size={22} />
                </div>

                <div className="equipamento-mini-info">
                  <strong>{equipamento.nome}</strong>
                  <span>{equipamento.categoria}</span>
                </div>

                <span
                  className={`equipamento-status ${
                    equipamento.status === "DISPONIVEL"
                      ? "status-ok"
                      : equipamento.status === "EM_MANUTENCAO"
                      ? "status-atencao"
                      : "status-inativo"
                  }`}
                >
                  {equipamento.status === "DISPONIVEL"
                    ? "Disponível"
                    : equipamento.status === "EM_MANUTENCAO"
                    ? "Manutenção"
                    : equipamento.status === "EM_USO"
                    ? "Em uso"
                    : "Inativo"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-acessos">
        <h2>Acesso rápido</h2>

        <div className="acessos-grid">
          {isAdmin && (
            <button
              onClick={() => onNavegar?.("Usuários")}
            >
              <UserPlus />
              <span>Novo usuário</span>
            </button>
          )}

          <button
            onClick={() => onNavegar?.("Utilizações")}
          >
            <CalendarCheck />
            <span>Registrar utilização</span>
          </button>

          <button
            onClick={() => onNavegar?.("Inteligência")}
          >
            <TrendingUp />
            <span>Ver inteligência</span>
          </button>

          <button
            onClick={() => onNavegar?.("Equipamentos")}
          >
            <Dumbbell />
            <span>Equipamentos</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavegar?.("Manutenções")}
            >
              <ClipboardList />
              <span>Manutenção</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
