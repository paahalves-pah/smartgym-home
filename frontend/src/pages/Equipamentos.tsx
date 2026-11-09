import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

import { Search, Plus, Dumbbell, Filter, X } from "lucide-react";

import CardEquipamento from "../components/CardEquipamento";
import { apiRequest } from "../services/api";

interface Equipamento {
  id: number;
  nome: string;
  categoria: string;
  descricao: string | null;
  imagem: string | null;
  status: "DISPONIVEL" | "EM_MANUTENCAO" | "INATIVO";
  ativo: boolean;
}

interface FormularioEquipamento {
  nome: string;
  categoria: string;
  descricao: string;
  status: Equipamento["status"];
}

const formularioInicial: FormularioEquipamento = {
  nome: "",
  categoria: "",
  descricao: "",
  status: "DISPONIVEL",
};

const traduzirStatus = (status: Equipamento["status"]) => {
  const statusMap = {
    DISPONIVEL: "Disponível",
    EM_MANUTENCAO: "Em manutenção",
    INATIVO: "Inativo",
  };

  return statusMap[status];
};

export default function Equipamentos() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [equipamentoEditando, setEquipamentoEditando] =
    useState<Equipamento | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioEquipamento>(formularioInicial);

  const [imagemSelecionada, setImagemSelecionada] =
    useState<File | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [erroCadastro, setErroCadastro] = useState("");

  const usuarioSalvo = localStorage.getItem("usuario");
  const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;

  const isAdmin = usuario?.tipoUsuario === "ADMIN";

  async function carregarEquipamentos() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await apiRequest("/equipamentos");

      setEquipamentos(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar equipamentos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  function abrirModalCadastro() {
    setEquipamentoEditando(null);
    setFormulario(formularioInicial);
    setImagemSelecionada(null);
    setErroCadastro("");
    setModalAberto(true);
  }

  function abrirModalEdicao(equipamento: Equipamento) {
    setEquipamentoEditando(equipamento);

    setFormulario({
      nome: equipamento.nome,
      categoria: equipamento.categoria,
      descricao: equipamento.descricao || "",
      status: equipamento.status,
    });

    setImagemSelecionada(null);
    setErroCadastro("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setEquipamentoEditando(null);
    setFormulario(formularioInicial);
    setImagemSelecionada(null);
    setErroCadastro("");
  }

  function atualizarCampo(
    campo: keyof FormularioEquipamento,
    valor: string
  ) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campo]: valor,
    }));
  }

  function selecionarImagem(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      setImagemSelecionada(null);
      return;
    }

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!formatosPermitidos.includes(arquivo.type)) {
      setErroCadastro("Selecione uma imagem JPG, PNG ou WebP.");
      event.target.value = "";
      setImagemSelecionada(null);
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setErroCadastro("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      setImagemSelecionada(null);
      return;
    }

    setErroCadastro("");
    setImagemSelecionada(arquivo);
  }

  async function salvarEquipamento(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!isAdmin) {
      setErroCadastro(
        "Somente administradores podem gerenciar equipamentos."
      );
      return;
    }

    try {
      setSalvando(true);
      setErroCadastro("");

      const dados = new FormData();

      dados.append("nome", formulario.nome.trim());
      dados.append("categoria", formulario.categoria.trim());
      dados.append("descricao", formulario.descricao.trim());
      dados.append("status", formulario.status);

      if (imagemSelecionada) {
        dados.append("imagem", imagemSelecionada);
      }

      const estaEditando = equipamentoEditando !== null;

      const endpoint = estaEditando
        ? `/equipamentos/${equipamentoEditando.id}`
        : "/equipamentos";

      await apiRequest(endpoint, {
        method: estaEditando ? "PUT" : "POST",
        body: dados,
      });

      setModalAberto(false);
      setEquipamentoEditando(null);
      setFormulario(formularioInicial);
      setImagemSelecionada(null);

      await carregarEquipamentos();
    } catch (error) {
      setErroCadastro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar equipamento."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirEquipamento(equipamento: Equipamento) {
    if (!isAdmin) return;

    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o equipamento "${equipamento.nome}"?`
    );

    if (!confirmar) return;

    try {
      setExcluindoId(equipamento.id);

      await apiRequest(`/equipamentos/${equipamento.id}`, {
        method: "DELETE",
      });

      await carregarEquipamentos();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Erro ao excluir equipamento."
      );
    } finally {
      setExcluindoId(null);
    }
  }

  const equipamentosFiltrados = equipamentos.filter((equipamento) => {
    const correspondeBusca = equipamento.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    const statusTraduzido = traduzirStatus(equipamento.status);

    const correspondeFiltro =
      filtro === "Todos" || statusTraduzido === filtro;

    return correspondeBusca && correspondeFiltro;
  });

  return (
    <div className="pagina-conteudo pagina-equipamentos">
      <div className="pagina-titulo">
        <div>
          <span className="texto-destaque">GESTÃO OPERACIONAL</span>

          <h1>Equipamentos</h1>

          <p>
            Gerencie os equipamentos e acompanhe sua disponibilidade.
          </p>
        </div>

        {isAdmin && (
          <button
            className="botao-primario"
            onClick={abrirModalCadastro}
          >
            <Plus size={18} />
            Novo equipamento
          </button>
        )}
      </div>

      <div className="equipamentos-toolbar">
        <div className="equipamentos-filtros">
          <div className="campo-busca">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar equipamento..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          <div className="campo-filtro">
            <Filter size={18} />

            <select
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
            >
              <option value="Todos">Todos os status</option>
              <option value="Disponível">Disponíveis</option>
              <option value="Em manutenção">Em manutenção</option>
              <option value="Inativo">Inativos</option>
            </select>
          </div>
        </div>

        <div className="equipamentos-contagem">
          <Dumbbell size={18} />

          <span>
            <strong>{equipamentosFiltrados.length}</strong>{" "}
            equipamentos encontrados
          </span>
        </div>
      </div>

      {carregando && (
        <div className="estado-vazio">
          <p>Carregando equipamentos...</p>
        </div>
      )}

      {!carregando && erro && (
        <div className="estado-vazio">
          <h3>Não foi possível carregar os equipamentos</h3>
          <p>{erro}</p>

          <button
            className="botao-primario"
            onClick={carregarEquipamentos}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && (
        <div className="equipamentos-grid">
          {equipamentosFiltrados.map((equipamento) => (
            <CardEquipamento
              key={equipamento.id}
              nome={equipamento.nome}
              categoria={equipamento.categoria}
              status={traduzirStatus(equipamento.status)}
              localizacao={equipamento.descricao || "Sem descrição"}
              imagem={equipamento.imagem}
              isAdmin={isAdmin}
              excluindo={excluindoId === equipamento.id}
              onEditar={() => abrirModalEdicao(equipamento)}
              onExcluir={() => excluirEquipamento(equipamento)}
            />
          ))}
        </div>
      )}

      {!carregando &&
        !erro &&
        equipamentosFiltrados.length === 0 && (
          <div className="estado-vazio">
            <Dumbbell size={32} />

            <h3>Nenhum equipamento encontrado</h3>

            <p>
              Tente alterar a busca ou selecionar outro status.
            </p>
          </div>
        )}

      {modalAberto && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-equipamento">
            <div className="modal-cabecalho">
              <div>
                <span className="texto-destaque">
                  GESTÃO OPERACIONAL
                </span>

                <h2>
                  {equipamentoEditando
                    ? "Editar equipamento"
                    : "Novo equipamento"}
                </h2>

                <p>
                  {equipamentoEditando
                    ? "Atualize as informações do equipamento."
                    : "Preencha os dados para cadastrar o equipamento."}
                </p>
              </div>

              <button
                type="button"
                className="botao-fechar-modal"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarEquipamento}>
              <div className="campo-formulario">
                <label htmlFor="nome">Nome do equipamento</label>

                <input
                  id="nome"
                  type="text"
                  placeholder="Ex.: Esteira ergométrica"
                  value={formulario.nome}
                  onChange={(event) =>
                    atualizarCampo("nome", event.target.value)
                  }
                  required
                  maxLength={150}
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="categoria">Categoria</label>

                <input
                  id="categoria"
                  type="text"
                  placeholder="Ex.: Cardio"
                  value={formulario.categoria}
                  onChange={(event) =>
                    atualizarCampo("categoria", event.target.value)
                  }
                  required
                  maxLength={100}
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="descricao">Descrição</label>

                <textarea
                  id="descricao"
                  placeholder="Informações adicionais sobre o equipamento"
                  value={formulario.descricao}
                  onChange={(event) =>
                    atualizarCampo("descricao", event.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="imagem">Foto do equipamento</label>

                <input
                  id="imagem"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={selecionarImagem}
                />

                <small>
                  Formatos JPG, PNG ou WebP. Máximo de 5 MB.
                </small>

                {imagemSelecionada && (
                  <div className="preview-imagem">
                    <img
                      src={URL.createObjectURL(imagemSelecionada)}
                      alt="Pré-visualização do equipamento"
                      style={{
                        width: "100%",
                        maxWidth: "220px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginTop: "10px",
                      }}
                    />

                    <p>{imagemSelecionada.name}</p>

                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={() => setImagemSelecionada(null)}
                    >
                      Remover imagem selecionada
                    </button>
                  </div>
                )}

                {equipamentoEditando?.imagem && !imagemSelecionada && (
                  <div className="preview-imagem">
                    <p>Imagem atual do equipamento:</p>

                    <img
                      src={`http://localhost:3000${equipamentoEditando.imagem}`}
                      alt={equipamentoEditando.nome}
                      style={{
                        width: "100%",
                        maxWidth: "220px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />

                    <small>
                      Selecione outra imagem acima para substituir a atual.
                    </small>
                  </div>
                )}
              </div>

              <div className="campo-formulario">
                <label htmlFor="status">Status</label>

                <select
                  id="status"
                  value={formulario.status}
                  onChange={(event) =>
                    atualizarCampo("status", event.target.value)
                  }
                >
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="EM_MANUTENCAO">Em manutenção</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>

              {erroCadastro && (
                <div className="mensagem-erro">
                  {erroCadastro}
                </div>
              )}

              <div className="modal-acoes">
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
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : equipamentoEditando
                    ? "Salvar alterações"
                    : "Cadastrar equipamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}