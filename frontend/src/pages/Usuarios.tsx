
import { useEffect, useState, type FormEvent } from "react";
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
  LoaderCircle,
} from "lucide-react";

import { apiRequest } from "../services/api";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: "ADMIN" | "USER";
  ativo: boolean;
  criadoEm?: string;
}

interface FormularioUsuario {
  nome: string;
  email: string;
  senha: string;
}

const formularioInicial: FormularioUsuario = {
  nome: "",
  email: "",
  senha: "",
};

export default function Usuarios() {
  const [busca, setBusca] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioUsuario>(formularioInicial);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<number | null>(null);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarUsuarios() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await apiRequest("/usuarios");

      setUsuarios(dados || []);
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

  function abrirCadastro() {
    setUsuarioEditando(null);
    setFormulario(formularioInicial);
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(usuario: Usuario) {
    setUsuarioEditando(usuario);

    setFormulario({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
    });

    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setUsuarioEditando(null);
    setFormulario(formularioInicial);
    setErro("");
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

      if (usuarioEditando) {
        const dados: {
          nome: string;
          email: string;
          senha?: string;
        } = {
          nome: formulario.nome.trim(),
          email: formulario.email.trim(),
        };

        if (formulario.senha) {
          dados.senha = formulario.senha;
        }

        await apiRequest(`/usuarios/${usuarioEditando.id}`, {
          method: "PUT",
          body: JSON.stringify(dados),
        });

        setMensagem("Usuário atualizado com sucesso!");
      } else {
        await apiRequest("/usuarios", {
          method: "POST",
          body: JSON.stringify({
            nome: formulario.nome.trim(),
            email: formulario.email.trim(),
            senha: formulario.senha,
          }),
        });

        setMensagem("Usuário cadastrado com sucesso!");
      }

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

      setMensagem(
        novoStatus
          ? "Usuário ativado com sucesso!"
          : "Usuário desativado com sucesso!"
      );

      await carregarUsuarios();
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

  function nomePerfil(tipoUsuario: string) {
    return tipoUsuario === "ADMIN" ? "Administrador" : "Usuário";
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
          <LoaderCircle size={32} />
          <h3>Carregando usuários...</h3>
        </div>
      ) : (
        <div className="usuarios-grid">

          {usuariosFiltrados.map((usuario) => (
            <div className="usuario-card" key={usuario.id}>

              <div className="usuario-card-avatar">
                <UserRound size={24} />
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

                  <button
                    className="botao-acao"
                    onClick={() => alterarStatus(usuario)}
                    disabled={acaoEmAndamento === usuario.id}
                  >
                    {acaoEmAndamento === usuario.id ? (
                      <LoaderCircle size={15} />
                    ) : usuario.ativo ? (
                      <UserX size={15} />
                    ) : (
                      <UserCheck size={15} />
                    )}

                    {usuario.ativo ? "Desativar" : "Ativar"}
                  </button>

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

              {usuarioEditando && (
                <div className="modal-manutencao-campo">
                  <label>Perfil de acesso</label>

                  <input
                    type="text"
                    value={nomePerfil(usuarioEditando.tipoUsuario)}
                    disabled
                  />
                </div>
              )}

              {!usuarioEditando && (
                <div className="modal-manutencao-campo">
                  <label>Perfil inicial</label>

                  <input
                    type="text"
                    value="Usuário"
                    disabled
                  />

                  <small>
                    Novos cadastros recebem o perfil padrão USER.
                  </small>
                </div>
              )}

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
                    <>
                      <LoaderCircle size={17} />
                      Salvando...
                    </>
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
