
import { useEffect, useState } from "react";
import {
  Wrench,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CalendarDays,
  UserRound,
  X,
  Play,
  Ban,
  LoaderCircle,
} from "lucide-react";

import { apiRequest } from "../services/api";

interface Equipamento {
  id: number;
  nome: string;
  categoria: string;
  status: string;
  ativo: boolean;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: string;
  ativo: boolean;
}

interface Manutencao {
  id: number;
  equipamento: Equipamento;
  responsavelUsuario: Usuario | null;
  responsavel: string | null;
  tipo: "PREVENTIVA" | "CORRETIVA";
  descricao: string;
  dataPrevista: string;
  dataInicio: string | null;
  dataConclusao: string | null;
  status: "AGENDADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";
  observacoes: string | null;
  criadoEm: string;
}

interface FormularioManutencao {
  equipamentoId: string;
  responsavelId: string;
  tipo: "PREVENTIVA" | "CORRETIVA";
  descricao: string;
  dataPrevista: string;
  observacoes: string;
}

const formularioInicial: FormularioManutencao = {
  equipamentoId: "",
  responsavelId: "",
  tipo: "PREVENTIVA",
  descricao: "",
  dataPrevista: "",
  observacoes: "",
};

export default function Manutencoes() {
  const [busca, setBusca] = useState("");
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] =
    useState<FormularioManutencao>(formularioInicial);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<number | null>(null);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [listaManutencoes, listaEquipamentos, listaUsuarios] =
        await Promise.all([
          apiRequest("/manutencoes"),
          apiRequest("/equipamentos"),
          apiRequest("/usuarios"),
        ]);

      setManutencoes(listaManutencoes || []);
      setEquipamentos(listaEquipamentos || []);
      setUsuarios(listaUsuarios || []);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const equipamentosDisponiveis = equipamentos.filter(
    (equipamento) =>
      equipamento.ativo &&
      equipamento.status !== "INATIVO" &&
      equipamento.status !== "EM_MANUTENCAO"
  );

  const administradoresAtivos = usuarios.filter(
    (usuario) =>
      usuario.tipoUsuario === "ADMIN" &&
      usuario.ativo
  );

  const manutencoesFiltradas = manutencoes.filter((item) => {
    const nomeEquipamento = item.equipamento?.nome || "";
    const nomeResponsavel =
      item.responsavelUsuario?.nome || item.responsavel || "";

    return `${nomeEquipamento} ${nomeResponsavel} ${item.tipo} ${item.descricao}`
      .toLowerCase()
      .includes(busca.toLowerCase());
  });

  const pendentes = manutencoes.filter(
    (item) => item.status === "AGENDADA"
  ).length;

  const andamento = manutencoes.filter(
    (item) => item.status === "EM_ANDAMENTO"
  ).length;

  const concluidas = manutencoes.filter(
    (item) => item.status === "CONCLUIDA"
  ).length;

  function formatarData(data: string) {
    if (!data) return "Não informada";

    return new Date(data).toLocaleDateString("pt-BR");
  }

  function nomeStatus(status: string) {
    const nomes: Record<string, string> = {
      AGENDADA: "Pendente",
      EM_ANDAMENTO: "Em andamento",
      CONCLUIDA: "Concluída",
      CANCELADA: "Cancelada",
    };

    return nomes[status] || status;
  }

  function nomeTipo(tipo: string) {
    return tipo === "PREVENTIVA" ? "Preventiva" : "Corretiva";
  }

  function classeStatus(status: string) {
    if (status === "CONCLUIDA") {
      return "status-finalizado";
    }

    if (status === "AGENDADA") {
      return "status-pendente";
    }

    if (status === "CANCELADA") {
      return "status-pendente";
    }

    return "status-ativo";
  }

  function atualizarFormulario(
    campo: keyof FormularioManutencao,
    valor: string
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function abrirModal() {
    setFormulario(formularioInicial);
    setErro("");
    setMensagem("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setFormulario(formularioInicial);
  }

  async function cadastrarManutencao(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formulario.equipamentoId || !formulario.responsavelId) {
      setErro("Selecione um equipamento e um administrador responsável.");
      return;
    }

    if (!formulario.dataPrevista) {
      setErro("Informe a data prevista da manutenção.");
      return;
    }

    if (
      new Date(formulario.dataPrevista).getTime() <= Date.now()
    ) {
      setErro("A data prevista precisa ser futura.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const dados = {
        equipamentoId: Number(formulario.equipamentoId),
        responsavelId: Number(formulario.responsavelId),
        tipo: formulario.tipo,
        descricao: formulario.descricao.trim(),
        dataPrevista: new Date(formulario.dataPrevista).toISOString(),
        observacoes: formulario.observacoes.trim() || undefined,
      };

      await apiRequest("/manutencoes", {
        method: "POST",
        body: JSON.stringify(dados),
      });

      setModalAberto(false);
      setFormulario(formularioInicial);
      setMensagem("Manutenção cadastrada com sucesso!");

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a manutenção."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function executarAcao(
    id: number,
    acao: "iniciar" | "concluir" | "cancelar"
  ) {
    const confirmacoes = {
      iniciar: "Deseja iniciar esta manutenção?",
      concluir: "Deseja concluir esta manutenção?",
      cancelar: "Deseja cancelar esta manutenção?",
    };

    if (!window.confirm(confirmacoes[acao])) {
      return;
    }

    try {
      setAcaoEmAndamento(id);
      setErro("");
      setMensagem("");

      await apiRequest(`/manutencoes/${id}/${acao}`, {
        method: "PATCH",
      });

      const mensagens = {
        iniciar: "Manutenção iniciada com sucesso!",
        concluir: "Manutenção concluída com sucesso!",
        cancelar: "Manutenção cancelada com sucesso!",
      };

      setMensagem(mensagens[acao]);

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível executar a operação."
      );
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  return (
    <div className="pagina-conteudo pagina-manutencoes">

      <div className="pagina-titulo">
        <div>
          <span className="texto-destaque">GESTÃO PREVENTIVA</span>

          <h1>Manutenções</h1>

          <p>
            Controle reparos e mantenha os equipamentos operacionais.
          </p>
        </div>

        <button
          className="botao-primario"
          onClick={abrirModal}
          disabled={carregando}
        >
          <Wrench size={18} />
          Nova manutenção
        </button>
      </div>

      {mensagem && (
        <div className="mensagem-sucesso">
          {mensagem}
          <button onClick={() => setMensagem("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {erro && !modalAberto && (
        <div className="mensagem-erro">
          {erro}
          <button onClick={() => setErro("")}>
            <X size={16} />
          </button>
        </div>
      )}

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

      {carregando ? (
        <div className="estado-vazio">
          <LoaderCircle size={32} />
          <h3>Carregando manutenções...</h3>
        </div>
      ) : (
        <>
          <div className="manutencao-lista">

            {manutencoesFiltradas.map((item) => {
              const nomeEquipamento =
                item.equipamento?.nome || "Equipamento não identificado";

              const nomeResponsavel =
                item.responsavelUsuario?.nome ||
                item.responsavel ||
                "Não informado";

              return (
                <div className="manutencao-card" key={item.id}>

                  <div className="manutencao-icone">
                    <Wrench size={24} />
                  </div>

                  <div className="manutencao-info">

                    <h3>{nomeEquipamento}</h3>

                    <div className="manutencao-tipo">
                      <span>{nomeTipo(item.tipo)}</span>
                      <span className="manutencao-separador">•</span>
                      <span>{nomeStatus(item.status)}</span>
                    </div>

                    <div className="manutencao-responsavel">
                      <UserRound size={15} />
                      {nomeResponsavel}
                    </div>

                    <div className="manutencao-data">
                      <CalendarDays size={15} />
                      Data prevista: {formatarData(item.dataPrevista)}
                    </div>

                    <p>{item.descricao}</p>

                  </div>

                  <div className="manutencao-detalhes">

                    <span className={`status-badge ${classeStatus(item.status)}`}>
                      {nomeStatus(item.status)}
                    </span>

                  </div>

                  <div className="manutencao-acoes">

                    {item.status === "AGENDADA" && (
                      <>
                        <button
                          className="botao-acao"
                          onClick={() => executarAcao(item.id, "iniciar")}
                          disabled={acaoEmAndamento === item.id}
                        >
                          {acaoEmAndamento === item.id ? (
                            <LoaderCircle size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                          Iniciar
                        </button>

                        <button
                          className="botao-acao"
                          onClick={() => executarAcao(item.id, "cancelar")}
                          disabled={acaoEmAndamento === item.id}
                        >
                          <Ban size={16} />
                          Cancelar
                        </button>
                      </>
                    )}

                    {item.status === "EM_ANDAMENTO" && (
                      <button
                        className="botao-acao"
                        onClick={() => executarAcao(item.id, "concluir")}
                        disabled={acaoEmAndamento === item.id}
                      >
                        {acaoEmAndamento === item.id ? (
                          <LoaderCircle size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Concluir
                      </button>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

          {manutencoesFiltradas.length === 0 && (
            <div className="estado-vazio">
              <Wrench size={32} />

              <h3>Nenhuma manutenção encontrada</h3>

              <p>
                {busca
                  ? "Tente alterar sua busca para encontrar uma manutenção."
                  : "Ainda não existem manutenções cadastradas."}
              </p>
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <div
          className="modal-manutencao-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharModal();
            }
          }}
        >
          <div className="modal-manutencao">

            <div className="modal-manutencao-cabecalho">
              <div>
                <span className="texto-destaque">GESTÃO PREVENTIVA</span>
                <h2>Nova manutenção</h2>
                <p>Preencha os dados para cadastrar a manutenção.</p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={cadastrarManutencao}>

              <div className="modal-manutencao-campo">
                <label htmlFor="equipamentoId">Equipamento</label>

                <select
                  id="equipamentoId"
                  value={formulario.equipamentoId}
                  onChange={(event) =>
                    atualizarFormulario("equipamentoId", event.target.value)
                  }
                  required
                >
                  <option value="">Selecione um equipamento</option>

                  {equipamentosDisponiveis.map((equipamento) => (
                    <option key={equipamento.id} value={equipamento.id}>
                      {equipamento.nome}
                    </option>
                  ))}
                </select>

                {equipamentosDisponiveis.length === 0 && (
                  <small>
                    Nenhum equipamento ativo disponível para manutenção.
                  </small>
                )}
              </div>

              <div className="modal-manutencao-campo">
                <label htmlFor="responsavelId">Administrador responsável</label>

                <select
                  id="responsavelId"
                  value={formulario.responsavelId}
                  onChange={(event) =>
                    atualizarFormulario("responsavelId", event.target.value)
                  }
                  required
                >
                  <option value="">Selecione um administrador</option>

                  {administradoresAtivos.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </option>
                  ))}
                </select>

                {administradoresAtivos.length === 0 && (
                  <small>
                    Nenhum administrador ativo encontrado.
                  </small>
                )}
              </div>

              <div className="modal-manutencao-campo">
                <label htmlFor="tipo">Tipo de manutenção</label>

                <select
                  id="tipo"
                  value={formulario.tipo}
                  onChange={(event) =>
                    atualizarFormulario("tipo", event.target.value)
                  }
                >
                  <option value="PREVENTIVA">Preventiva</option>
                  <option value="CORRETIVA">Corretiva</option>
                </select>
              </div>

              <div className="modal-manutencao-campo">
                <label htmlFor="descricao">Descrição</label>

                <textarea
                  id="descricao"
                  value={formulario.descricao}
                  onChange={(event) =>
                    atualizarFormulario("descricao", event.target.value)
                  }
                  placeholder="Descreva o serviço que precisa ser realizado..."
                  minLength={3}
                  maxLength={255}
                  required
                />
              </div>

              <div className="modal-manutencao-campo">
                <label htmlFor="dataPrevista">Data prevista</label>

                <input
                  id="dataPrevista"
                  type="datetime-local"
                  value={formulario.dataPrevista}
                  onChange={(event) =>
                    atualizarFormulario("dataPrevista", event.target.value)
                  }
                  min={(() => {
                    const agora = new Date();
                    agora.setMinutes(
                      agora.getMinutes() - agora.getTimezoneOffset()
                    );
                    return agora.toISOString().slice(0, 16);
                  })()}
                  required
                />
              </div>

              <div className="modal-manutencao-campo">
                <label htmlFor="observacoes">Observações</label>

                <textarea
                  id="observacoes"
                  value={formulario.observacoes}
                  onChange={(event) =>
                    atualizarFormulario("observacoes", event.target.value)
                  }
                  placeholder="Informações adicionais (opcional)"
                  maxLength={1000}
                />
              </div>

              {erro && (
                <div className="mensagem-erro">
                  {erro}
                </div>
              )}

              <div className="modal-manutencao-acoes">
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="botao-primario"
                  disabled={
                    salvando ||
                    equipamentosDisponiveis.length === 0 ||
                    administradoresAtivos.length === 0
                  }
                >
                  {salvando ? (
                    <>
                      <LoaderCircle size={17} />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Wrench size={17} />
                      Cadastrar manutenção
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
