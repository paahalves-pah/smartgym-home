import { useState } from "react";
import {
  Users,
  Search,
  UserRound,
  ShieldCheck,
  Mail,
  UserPlus,
} from "lucide-react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  status: string;
}

export default function Usuarios() {
  const [busca, setBusca] = useState("");

  const usuarios: Usuario[] = [
    {
      id: 1,
      nome: "Mariana Oliveira",
      email: "mariana@email.com",
      perfil: "Administrador",
      status: "Ativo",
    },
    {
      id: 2,
      nome: "Lucas Santos",
      email: "lucas@email.com",
      perfil: "Aluno",
      status: "Ativo",
    },
    {
      id: 3,
      nome: "Ana Costa",
      email: "ana@email.com",
      perfil: "Aluno",
      status: "Ativo",
    },
    {
      id: 4,
      nome: "Carlos Mendes",
      email: "carlos@email.com",
      perfil: "Personal Trainer",
      status: "Ativo",
    },
  ];

  const usuariosFiltrados = usuarios.filter((usuario) =>
    `${usuario.nome} ${usuario.email}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const totalAdministradores = usuarios.filter(
    (usuario) => usuario.perfil === "Administrador"
  ).length;

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

        <button className="botao-primario">
          <UserPlus size={18} />
          Novo usuário
        </button>
      </div>

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
                  {usuario.perfil}
                </span>

                <span className="status-badge status-finalizado">
                  {usuario.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {usuariosFiltrados.length === 0 && (
        <div className="estado-vazio">
          <Users size={32} />

          <h3>Nenhum usuário encontrado</h3>

          <p>
            Tente alterar sua busca.
          </p>
        </div>
      )}
    </div>
  );
}