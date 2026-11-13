
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import {
  Users,
  Search,
  UserRound,
  ShieldCheck,
  Mail,
  UserPlus,
  X,
  Pencil,
  UserCheck,
  UserX,
  Camera,
  Trash2,
} from "lucide-react";

import { apiRequest } from "../services/api";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

type TipoUsuario = "ADMIN" | "USER";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  ativo: boolean;
  fotoUrl?: string | null;
  criadoEm?: string;
}

interface FormularioUsuario {
  nome: string;
  email: string;
  senha: string;
  tipoUsuario: TipoUsuario;
}

const formularioInicial: FormularioUsuario = {
  nome: "",
  email: "",
  senha: "",
  tipoUsuario: "USER",
};

export default function Usuarios() {
  const [busca, setBusca] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioUsuario>(formularioInicial);

  const [fotoSelecionada, setFotoSelecionada] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<number | null>(null);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarUsuarios() {
    try {
      setErro("");
      const dados = await apiRequest("/usuarios");
      setUsuarios(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os usuários."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((usuario) =>
    `${usuario.nome} ${usuario.email}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const totalAdministradores = usuarios.filter(
    (usuario) => usuario.tipoUsuario === "ADMIN"
  ).length;

  const totalAtivos = usuarios.filter(
    (usuario) => usuario.ativo
  ).length;

  const totalInativos = usuarios.filter(
    (usuario) => !usuario.ativo
  ).length;

  function atualizarFormulario(
    campo: keyof FormularioUsuario,
    valor: string
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function limparFoto() {
    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }

    setFotoSelecionada(null);
    setFotoPreview("");
  }

  function selecionarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setErro("Selecione uma imagem JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 2 MB.");
      event.target.value = "";
      return;
    }

    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }

    setFotoSelecionada(arquivo);
    setFotoPreview(URL.createObjectURL(arquivo));
    setErro("");
  }

  function abrirCadastro() {
    limparFoto();
    setUsuarioEditando(null);
    setFormulario(formularioInicial);
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(usuario: Usuario) {
    limparFoto();
    setUsuarioEditando(usuario);

    setFormulario({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      tipoUsuario: usuario.tipoUsuario,
    });

    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    limparFoto();
    setModalAberto(false);
    setUsuarioEditando(null);
    setFormulario(formularioInicial);
    setErro("");
  }

  async function enviarFoto(idUsuario: number) {
    if (!fotoSelecionada) return;

    const dados = new FormData();
    dados.append("foto", fotoSelecionada);

    await apiRequest(`/usuarios/${idUsuario}/foto`, {
      method: "POST",
      body: dados,
    });
  }

  async function salvarUsuario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formulario.nome.trim() || !formulario.email.trim()) {
      setErro("Preencha o nome e o e-mail.");
      return;
    }

    if (!usuarioEditando && formulario.senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (
      usuarioEditando &&
      formulario.senha &&
      formulario.senha.length < 8
    ) {
      setErro("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      let idUsuario: number;

      if (usuarioEditando) {
        const dados: {
          nome: string;
          email: string;
          senha?: string;
          tipoUsuario: TipoUsuario;
        } = {
          nome: formulario.nome.trim(),
          email: formulario.email.trim(),
          tipoUsuario: formulario.tipoUsuario,
        };

        if (formulario.senha) {
          dados.senha = formulario.senha;
        }

        await apiRequest(`/usuarios/${usuarioEditando.id}`, {
          method: "PUT",
          body: JSON.stringify(dados),
        });

        idUsuario = usuarioEditando.id;
      } else {
        const usuarioCriado = await apiRequest("/usuarios", {
          method: "POST",
          body: JSON.stringify({
            nome: formulario.nome.trim(),
            email: formulario.email.trim(),
            senha: formulario.senha,
            tipoUsuario: formulario.tipoUsuario,
          }),
        });

        idUsuario = usuarioCriado.id;
      }

      if (fotoSelecionada) {
        await enviarFoto(idUsuario);
      }

      setMensagem(
        usuarioEditando
          ? "Usuário atualizado com sucesso!"
          : "Usuário cadastrado com sucesso!"
      );

      limparFoto();
      setModalAberto(false);
      setUsuarioEditando(null);
      setFormulario(formularioInicial);

      await carregarUsuarios();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o usuário."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(usuario: Usuario) {
    const novoStatus = !usuario.ativo;

    const confirmacao = novoStatus
      ? `Deseja ativar a conta de ${usuario.nome}?`
      : `Deseja desativar a conta de ${usuario.nome}?`;

    if (!window.confirm(confirmacao)) return;

    try {
      setAcaoEmAndamento(usuario.id);
      setErro("");
      setMensagem("");

      await apiRequest(`/usuarios/${usuario.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ativo: novoStatus,
        }),
      });

      setUsuarios((atuais) =>
        atuais.map((item) =>
          item.id === usuario.id ? { ...item, ativo: novoStatus } : item
        )
      );

      setMensagem(
        novoStatus
          ? "Usuário ativado com sucesso!"
          : "Usuário desativado com sucesso!"
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status do usuário."
      );
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function excluirUsuario(usuario: Usuario) {
    if (usuario.tipoUsuario === "ADMIN") {
      setErro("Contas de administrador não podem ser excluídas.");
      return;
    }

    const confirmacao = window.confirm(
      `Tem certeza de que deseja excluir o usuário ${usuario.nome}? Essa ação não poderá ser desfeita.`
    );

    if (!confirmacao) return;

    try {
      setAcaoEmAndamento(usuario.id);
      setErro("");
      setMensagem("");

      await apiRequest(`/usuarios/${usuario.id}`, {
        method: "DELETE",
      });

      setUsuarios((atuais) =>
        atuais.filter((item) => item.id !== usuario.id)
      );
      setMensagem(`Usuário ${usuario.nome} excluído com sucesso.`);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o usuário."
      );
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  function nomePerfil(tipoUsuario: string) {
    return tipoUsuario === "ADMIN" ? "Administrador" : "Usuário";
  }

  function urlFoto(fotoUrl?: string | null) {
    if (!fotoUrl) return "";

    if (fotoUrl.startsWith("http")) {
      return fotoUrl;
    }

    return `${API_URL}${fotoUrl}`;
  }

  return (
    <div className="pagina-conteudo pagina-usuarios">
      <div className="pagina-titulo">
        <div>
          <span className="texto-destaque">GESTÃO DE ACESSOS</span>
          <h1>Usuários</h1>
          <p>
            Gerencie os usuários e seus respectivos perfis de acesso.
          </p>
        </div>

        <button
          className="botao-primario"
          onClick={abrirCadastro}
          disabled={carregando}
        >
          <UserPlus size={18} />
          Novo usuário
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

      <div className="usuarios-resumo">
        <div className="usuario-indicador">
          <div className="usuario-indicador-icone">
            <Users size={22} />
          </div>
          <div>
            <span>Total de usuários</span>
            <strong>{usuarios.length}</strong>
          </div>
        </div>

        <div className="usuario-indicador">
          <div className="usuario-indicador-icone">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span>Administradores</span>
            <strong>{totalAdministradores}</strong>
          </div>
        </div>

        <div className="usuario-indicador">
          <div className="usuario-indicador-icone">
            <UserCheck size={22} />
          </div>
          <div>
            <span>Usuários ativos</span>
            <strong>{totalAtivos}</strong>
          </div>
        </div>

        <div className="usuario-indicador">
          <div className="usuario-indicador-icone indicador-inativo">
            <UserX size={22} />
          </div>
          <div>
            <span>Usuários inativos</span>
            <strong>{totalInativos}</strong>
          </div>
        </div>
      </div>

      <div className="usuarios-toolbar">
        <div className="campo-busca">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar usuário por nome ou e-mail..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <div className="usuarios-contagem">
          <Users size={18} />
          <span>
            <strong>{usuariosFiltrados.length}</strong> usuários encontrados
          </span>
        </div>
      </div>

      {carregando ? (
        <div className="estado-vazio">
          <h3>Carregando usuários...</h3>
        </div>
      ) : (
        <div className="usuarios-grid">
          {usuariosFiltrados.map((usuario) => (
            <div className="usuario-card" key={usuario.id}>
              <div
                className="usuario-card-avatar"
                style={{
                  width: 56,
                  height: 56,
                  overflow: "hidden",
                  borderRadius: "50%",
                }}
              >
                {usuario.fotoUrl ? (
                  <img
                    src={urlFoto(usuario.fotoUrl)}
                    alt={`Foto de ${usuario.nome}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <UserRound size={24} />
                )}
              </div>

              <div className="usuario-card-info">
                <h3>{usuario.nome}</h3>

                <p className="usuario-card-email">
                  <Mail size={15} />
                  {usuario.email}
                </p>

                <div className="usuario-card-tags">
                  <span className="perfil-badge">
                    {nomePerfil(usuario.tipoUsuario)}
                  </span>

                  <span
                    className={`status-badge ${
                      usuario.ativo
                        ? "status-finalizado"
                        : "status-pendente"
                    }`}
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="usuario-card-acoes">
                  <button
                    className="botao-acao"
                    onClick={() => abrirEdicao(usuario)}
                  >
                    <Pencil size={15} />
                    Editar
                  </button>

                  {usuario.tipoUsuario !== "ADMIN" && (
                    <>
                      <button
                        className="botao-acao botao-acao-status"
                        onClick={() => alterarStatus(usuario)}
                        disabled={acaoEmAndamento === usuario.id}
                      >
                        {usuario.ativo ? (
                          <UserX size={15} />
                        ) : (
                          <UserCheck size={15} />
                        )}
                        {acaoEmAndamento === usuario.id
                          ? "Aguarde..."
                          : usuario.ativo
                            ? "Desativar"
                            : "Ativar"}
                      </button>

                      <button
                        className="botao-acao botao-acao-excluir"
                        onClick={() => excluirUsuario(usuario)}
                        disabled={acaoEmAndamento === usuario.id}
                      >
                        <Trash2 size={15} />
                        {acaoEmAndamento === usuario.id
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!carregando && usuariosFiltrados.length === 0 && (
        <div className="estado-vazio">
          <Users size={32} />
          <h3>Nenhum usuário encontrado</h3>
          <p>
            {busca
              ? "Tente alterar sua busca."
              : "Ainda não existem usuários cadastrados."}
          </p>
        </div>
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
                <span className="texto-destaque">GESTÃO DE ACESSOS</span>
                <h2>
                  {usuarioEditando ? "Editar usuário" : "Novo usuário"}
                </h2>
                <p>
                  {usuarioEditando
                    ? "Atualize as informações da conta."
                    : "Preencha os dados para cadastrar um usuário."}
                </p>
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

            <form onSubmit={salvarUsuario}>
              <div className="modal-manutencao-campo">
                <label>Foto de perfil</label>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#eaf0f8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #dce5f0",
                    }}
                  >
                    {fotoPreview ? (
                      <img
                        src={fotoPreview}
                        alt="Pré-visualização da foto"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : usuarioEditando?.fotoUrl ? (
                      <img
                        src={urlFoto(usuarioEditando.fotoUrl)}
                        alt={`Foto de ${usuarioEditando.nome}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <UserRound size={42} color="#54749b" />
                    )}
                  </div>

                  <label
                    htmlFor="fotoUsuario"
                    className="botao-acao"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <Camera size={16} />
                    Escolher foto
                  </label>

                  <input
                    id="fotoUsuario"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={selecionarFoto}
                    style={{ display: "none" }}
                  />

                  <small style={{ color: "#777", textAlign: "center" }}>
                    JPG, PNG ou WEBP. Tamanho máximo: 2 MB.
                  </small>

                  {fotoPreview && (
                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={limparFoto}
                    >
                      Remover foto selecionada
                    </button>
                  )}
                </div>
              </div>

              <div className="modal-manutencao-campo">
                <label htmlFor="nome">Nome completo</label>
                <input
                  id="nome"
                  type="text"
                  value={formulario.nome}
                  onChange={(event) =>
                    atualizarFormulario("nome", event.target.value)
                  }
                  placeholder="Digite o nome completo"
                  maxLength={150}
                  required
                />
              </div>

              <div className="modal-manutencao-campo">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={formulario.email}
                  onChange={(event) =>
                    atualizarFormulario("email", event.target.value)
                  }
                  placeholder="usuario@email.com"
                  maxLength={150}
                  required
                />
              </div>

              <div className="modal-manutencao-campo">
                <label htmlFor="senha">
                  {usuarioEditando ? "Nova senha (opcional)" : "Senha"}
                </label>
                <input
                  id="senha"
                  type="password"
                  value={formulario.senha}
                  onChange={(event) =>
                    atualizarFormulario("senha", event.target.value)
                  }
                  placeholder={
                    usuarioEditando
                      ? "Deixe em branco para manter a senha atual"
                      : "Mínimo de 8 caracteres"
                  }
                  minLength={8}
                  required={!usuarioEditando}
                  autoComplete="new-password"
                />
              </div>

              <div className="modal-manutencao-campo">
                <label htmlFor="tipoUsuario">Perfil de acesso</label>
                <select
                  id="tipoUsuario"
                  value={formulario.tipoUsuario}
                  onChange={(event) =>
                    atualizarFormulario("tipoUsuario", event.target.value)
                  }
                  disabled={salvando}
                >
                  <option value="USER">Usuário (USER)</option>
                  <option value="ADMIN">Administrador (ADMIN)</option>
                </select>
                <small>
                  Administradores possuem acesso às funções administrativas
                  do sistema.
                </small>
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
                  disabled={salvando}
                >
                  {salvando ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      {usuarioEditando
                        ? "Salvar alterações"
                        : "Cadastrar usuário"}
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
