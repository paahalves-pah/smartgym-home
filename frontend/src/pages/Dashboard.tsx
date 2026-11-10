
import { useEffect, useState } from "react";
import {
  Dumbbell,
  CheckCircle2,
  Wrench,
  Activity,
  BrainCircuit,
  ArrowUpRight,
  UserPlus,
  CalendarCheck,
  TrendingUp,
  ClipboardList,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { apiRequest } from "../services/api";

interface Equipamento {
  id: number;
  nome: string;
  categoria: string;
  status: "DISPONIVEL" | "EM_MANUTENCAO" | "INATIVO" | "EM_USO";
  ativo: boolean;
}

interface UsoSemanal {
  data: string;
  dia: string;
  total: number;
}

interface DashboardProps {
  onNavegar?: (pagina: string) => void;
}

interface AvaliacaoKMeans {
  k: number;
  silhouette: number;
  inercia: number;
}

interface AgrupamentoUsuario {
  usuario_id: number;
  grupo: number;
}

interface ResultadoModelo {
  sucesso: boolean;
  usuarios_analisados: number;
  numero_clusters: number;
  silhouette_score: number;
  avaliacao: AvaliacaoKMeans[];
  agrupamentos: AgrupamentoUsuario[];
  modelo_salvo: string;
}

interface ResultadoTreinamento {
  mensagem: string;
  usuariosEnviados: number;
  resultado: ResultadoModelo;
}

export default function Dashboard({ onNavegar }: DashboardProps) {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [usoSemanal, setUsoSemanal] = useState<UsoSemanal[]>([]);
  const [carregandoGrafico, setCarregandoGrafico] = useState(true);
  const [erroGrafico, setErroGrafico] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [treinando, setTreinando] = useState(false);

  const [resultadoTreinamento, setResultadoTreinamento] =
    useState<ResultadoTreinamento | null>(null);

  const [erroTreinamento, setErroTreinamento] = useState("");

  useEffect(() => {
    async function carregarEquipamentos() {
      try {
        const dados = await apiRequest("/equipamentos");
        setEquipamentos(dados);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os equipamentos."
        );
      } finally {
        setCarregando(false);
      }
    }

    async function carregarUsoSemanal() {
      try {
        setCarregandoGrafico(true);
        setErroGrafico("");

        const dados = await apiRequest("/dashboard/uso-semanal");
        setUsoSemanal(dados);
      } catch (error) {
        setErroGrafico(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados semanais."
        );
      } finally {
        setCarregandoGrafico(false);
      }
    }

    carregarEquipamentos();
    carregarUsoSemanal();

    try {
      const usuarioSalvo = localStorage.getItem("usuario");
      const usuario = usuarioSalvo
        ? JSON.parse(usuarioSalvo)
        : null;

      setIsAdmin(usuario?.tipoUsuario === "ADMIN");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  async function treinarModelo() {
    if (treinando) return;

    const confirmar = window.confirm(
      "Deseja iniciar o treinamento do modelo de recomendações com os dados de utilização da academia?"
    );

    if (!confirmar) return;

    setTreinando(true);
    setErroTreinamento("");
    setResultadoTreinamento(null);

    try {
      const dados: ResultadoTreinamento = await apiRequest(
        "/dashboard/inteligencia/treinar",
        {
          method: "POST",
        }
      );

      setResultadoTreinamento(dados);
    } catch (error) {
      setErroTreinamento(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o treinamento."
      );
    } finally {
      setTreinando(false);
    }
  }

  const disponiveis = equipamentos.filter(
    (e) => e.status === "DISPONIVEL" && e.ativo
  ).length;

  const manutencao = equipamentos.filter(
    (e) => e.status === "EM_MANUTENCAO"
  ).length;

  const resultadoModelo = resultadoTreinamento?.resultado;

  const distribuicaoGrupos = resultadoModelo
    ? resultadoModelo.agrupamentos.reduce(
        (grupos, usuario) => {
          grupos[usuario.grupo] =
            (grupos[usuario.grupo] || 0) + 1;
          return grupos;
        },
        {} as Record<number, number>
      )
    : {};

  const descricaoSilhouette = (score: number) => {
    if (score >= 0.7) return "Separação forte entre os grupos";
    if (score >= 0.5) return "Boa separação entre os grupos";
    if (score >= 0.25) return "Separação moderada entre os grupos";
    return "Separação fraca entre os grupos";
  };

  const maiorUso = Math.max(
    1,
    ...usoSemanal.map((item) => item.total)
  );

  const escalaGrafico = Math.max(
    1,
    Math.ceil(maiorUso / 4)
  );

  return (
    <div className="dashboard-moderno">
      <div className="dashboard-topo">
        <div>
          <span className="texto-destaque">VISÃO GERAL</span>
          <h1>Dashboard</h1>
          <p>Visão geral da sua SmartGym Home</p>
        </div>

        <div className="dashboard-status">
          <Activity size={18} />
          <span>Academia em tempo real</span>
        </div>
      </div>

      {erro && (
        <div className="dashboard-erro">{erro}</div>
      )}

      <div className="dashboard-indicadores">
        <div className="indicador-card">
          <div className="indicador-icone">
            <Dumbbell />
          </div>
          <div>
            <span>Equipamentos</span>
            <strong>
              {carregando ? "..." : equipamentos.length}
            </strong>
            <small>Total cadastrado</small>
          </div>
        </div>

        <div className="indicador-card">
          <div className="indicador-icone">
            <CheckCircle2 />
          </div>
          <div>
            <span>Disponíveis</span>
            <strong>
              {carregando ? "..." : disponiveis}
            </strong>
            <small>Em funcionamento</small>
          </div>
        </div>

        <div className="indicador-card">
          <div className="indicador-icone">
            <Activity />
          </div>
          <div>
            <span>Uso dos equipamentos</span>
            <strong>—</strong>
            <small>Dados de utilização pendentes</small>
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

      <div className="dashboard-paineis">
        <section className="dashboard-bloco dashboard-grafico">
          <div className="bloco-cabecalho">
            <div>
              <h2>Uso semanal da academia</h2>
              <p>Últimos sete dias</p>
            </div>
            <Activity size={20} />
          </div>

          {carregandoGrafico ? (
            <div className="grafico-mensagem">
              Carregando dados de utilização...
            </div>
          ) : erroGrafico ? (
            <div className="grafico-mensagem grafico-erro">
              <AlertCircle size={18} />
              {erroGrafico}
            </div>
          ) : usoSemanal.length === 0 ? (
            <div className="grafico-mensagem">
              Nenhum dado disponível para o período.
            </div>
          ) : (
            <>
              <div className="grafico">
                <div className="grafico-eixo">
                  {[4, 3, 2, 1, 0].map((valor) => (
                    <span key={valor}>
                      {escalaGrafico * valor}
                    </span>
                  ))}
                </div>

                <div className="grafico-colunas">
                  {usoSemanal.map((item) => {
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
                Quantidade de utilizações finalizadas
              </div>
            </>
          )}
        </section>

        <section className="dashboard-bloco dashboard-inteligencia">
          <div className="inteligencia-icone">
            <BrainCircuit size={30} />
          </div>

          <span className="texto-destaque">
            SMART INTELLIGENCE
          </span>

          <h2>Inteligência para sua academia</h2>

          <p>
            Transforme dados de equipamentos e utilização em decisões
            mais inteligentes.
          </p>

          <div className="inteligencia-status">
            <span />
            Sistema preparado para análise
          </div>
        </section>
      </div>

      {isAdmin && (
        <section className="dashboard-bloco dashboard-treinamento">
          <div className="bloco-cabecalho">
            <div>
              <span className="texto-destaque">
                MACHINE LEARNING
              </span>
              <h2>Treinamento de Inteligência Artificial</h2>
            </div>

            <div className="inteligencia-icone">
              <BrainCircuit size={30} />
            </div>
          </div>

          <div className="treinamento-informacoes">
            <div>
              <strong>Modelo de recomendações</strong>
              <span>K-Means</span>
            </div>

            <div>
              <strong>Dados utilizados</strong>
              <span>
                Histórico de utilização dos usuários
              </span>
            </div>

            <div>
              <strong>Requisito mínimo</strong>
              <span>
                3 usuários com histórico de utilização.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="botao-primario"
            onClick={treinarModelo}
            disabled={treinando}
          >
            <RefreshCw
              size={18}
              className={treinando ? "girando" : ""}
            />

            {treinando
              ? "Treinando modelo..."
              : "Treinar modelo de recomendações"}
          </button>

          {resultadoTreinamento && resultadoModelo && (
            <div className="treinamento-relatorio">
              <div className="treinamento-sucesso">
                <CheckCircle size={20} />

                <div>
                  <strong>Treinamento concluído!</strong>
                  <p>{resultadoTreinamento.mensagem}</p>
                  <p>
                    Usuários enviados:{" "}
                    {resultadoTreinamento.usuariosEnviados}
                  </p>
                  <p>
                    Modelo salvo: {resultadoModelo.modelo_salvo}
                  </p>
                </div>
              </div>

              <h3>Resultados do treinamento</h3>

              <div className="treinamento-metricas">
                <div className="metrica-card">
                  <span>Usuários analisados</span>
                  <strong>
                    {resultadoModelo.usuarios_analisados}
                  </strong>
                </div>

                <div className="metrica-card">
                  <span>Grupos identificados</span>
                  <strong>
                    {resultadoModelo.numero_clusters}
                  </strong>
                </div>

                <div className="metrica-card">
                  <span>Silhouette Score</span>
                  <strong>
                    {resultadoModelo.silhouette_score.toFixed(4)}
                  </strong>
                  <small>
                    {descricaoSilhouette(
                      resultadoModelo.silhouette_score
                    )}
                  </small>
                </div>
              </div>

              <h3>Comparação dos agrupamentos</h3>

              <div className="tabela-treinamento">
                <table>
                  <thead>
                    <tr>
                      <th>Quantidade de grupos (K)</th>
                      <th>Silhouette Score</th>
                      <th>Inércia</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resultadoModelo.avaliacao.map((item) => (
                      <tr key={item.k}>
                        <td>
                          {item.k}
                          {item.k === resultadoModelo.numero_clusters && (
                            <strong className="melhor-modelo">
                              {" "}Melhor resultado
                            </strong>
                          )}
                        </td>
                        <td>{item.silhouette.toFixed(4)}</td>
                        <td>{item.inercia.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3>Distribuição dos usuários</h3>

              <div className="distribuicao-grupos">
                {Object.entries(distribuicaoGrupos)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([grupo, quantidade]) => (
                    <div className="grupo-card" key={grupo}>
                      <span>Grupo {grupo}</span>
                      <strong>{quantidade} usuários</strong>
                    </div>
                  ))}
              </div>

              <h3>Usuários classificados</h3>

              <div className="tabela-treinamento">
                <table>
                  <thead>
                    <tr>
                      <th>ID do usuário</th>
                      <th>Grupo identificado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resultadoModelo.agrupamentos.map((usuario) => (
                      <tr key={usuario.usuario_id}>
                        <td>{usuario.usuario_id}</td>
                        <td>Grupo {usuario.grupo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="treinamento-observacao">
                O Silhouette Score avalia a qualidade da separação
                dos grupos. Ele não representa uma porcentagem
                de acertos do modelo.
              </p>
            </div>
          )}

          {erroTreinamento && (
            <div className="treinamento-erro">
              <AlertCircle size={20} />
              <div>
                <strong>
                  Não foi possível treinar o modelo.
                </strong>
                <p>{erroTreinamento}</p>
              </div>
            </div>
          )}
        </section>
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
          <button onClick={() => onNavegar?.("Usuários")}>
            <UserPlus />
            <span>Novo usuário</span>
          </button>

          <button onClick={() => onNavegar?.("Utilizações")}>
            <CalendarCheck />
            <span>Registrar utilização</span>
          </button>

          <button onClick={() => onNavegar?.("Inteligência")}>
            <TrendingUp />
            <span>Ver inteligência</span>
          </button>

          <button onClick={() => onNavegar?.("Manutenções")}>
            <ClipboardList />
            <span>Abrir manutenção</span>
          </button>
        </div>
      </section>
    </div>
  );
}
