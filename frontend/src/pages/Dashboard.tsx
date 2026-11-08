
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
} from "lucide-react";

import { apiRequest } from "../services/api";

interface Equipamento {
  id: number;
  nome: string;
  categoria: string;
  status: "DISPONIVEL" | "EM_MANUTENCAO" | "INATIVO";
  ativo: boolean;
}

interface DashboardProps {
  onNavegar?: (pagina: string) => void;
}

export default function Dashboard({ onNavegar }: DashboardProps) {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

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

    carregarEquipamentos();
  }, []);

  const disponiveis = equipamentos.filter(
    (e) => e.status === "DISPONIVEL"
  ).length;

  const manutencao = equipamentos.filter(
    (e) => e.status === "EM_MANUTENCAO"
  ).length;

  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const alturas = [35, 55, 72, 48, 78, 95, 62];

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

      {erro && <div className="dashboard-erro">{erro}</div>}

      <div className="dashboard-indicadores">
        <div className="indicador-card">
          <div className="indicador-icone"><Dumbbell /></div>
          <div>
            <span>Equipamentos</span>
            <strong>{carregando ? "..." : equipamentos.length}</strong>
            <small>Total cadastrado</small>
          </div>
        </div>

        <div className="indicador-card">
          <div className="indicador-icone"><CheckCircle2 /></div>
          <div>
            <span>Disponíveis</span>
            <strong>{carregando ? "..." : disponiveis}</strong>
            <small>Em funcionamento</small>
          </div>
        </div>

        <div className="indicador-card">
          <div className="indicador-icone"><Activity /></div>
          <div>
            <span>Uso dos equipamentos</span>
            <strong>—</strong>
            <small>Dados de utilização pendentes</small>
          </div>
        </div>

        <div className="indicador-card indicador-alerta">
          <div className="indicador-icone"><Wrench /></div>
          <div>
            <span>Manutenções</span>
            <strong>{carregando ? "..." : manutencao}</strong>
            <small>Equipamentos em manutenção</small>
          </div>
        </div>
      </div>

      <div className="dashboard-paineis">
        <section className="dashboard-bloco dashboard-grafico">
          <div className="bloco-cabecalho">
            <div>
              <h2>Uso semanal da academia</h2>
              <p>Visualização demonstrativa</p>
            </div>
            <Activity size={20} />
          </div>

          <div className="grafico">
            <div className="grafico-eixo">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            <div className="grafico-colunas">
              {dias.map((dia, index) => (
                <div className="grafico-coluna" key={dia}>
                  <div
                    className="grafico-barra"
                    style={{ height: `${alturas[index]}%` }}
                  />
                  <span>{dia}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grafico-legenda">
            <span className="legenda-ponto" />
            Atividade ilustrativa — aguardando dados de utilização
          </div>
        </section>

        <section className="dashboard-bloco dashboard-inteligencia">
          <div className="inteligencia-icone">
            <BrainCircuit size={30} />
          </div>

          <span className="texto-destaque">SMART INTELLIGENCE</span>
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
              <div className="dashboard-equipamento" key={equipamento.id}>
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
