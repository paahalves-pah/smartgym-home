import { useState } from "react";
import { Search, Plus, Dumbbell, Filter } from "lucide-react";
import CardEquipamento from "../components/CardEquipamento";

export default function Equipamentos() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  const equipamentos = [
    {
      id: 1,
      nome: "Esteira Elétrica Pro",
      categoria: "Cardio",
      status: "Disponível",
      localizacao: "Área de cardio",
    },
    {
      id: 2,
      nome: "Leg Press 45°",
      categoria: "Musculação",
      status: "Disponível",
      localizacao: "Área de musculação",
    },
    {
      id: 3,
      nome: "Bicicleta Ergométrica",
      categoria: "Cardio",
      status: "Manutenção",
      localizacao: "Área de cardio",
    },
    {
      id: 4,
      nome: "Supino Articulado",
      categoria: "Musculação",
      status: "Disponível",
      localizacao: "Área de musculação",
    },
  ];

  const equipamentosFiltrados = equipamentos.filter((equipamento) => {
    const correspondeBusca = equipamento.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    const correspondeFiltro =
      filtro === "Todos" || equipamento.status === filtro;

    return correspondeBusca && correspondeFiltro;
  });

  return (
    <div className="pagina-conteudo pagina-equipamentos">

      {/* Título e botão */}
      <div className="pagina-titulo">
        <div>
          <span className="texto-destaque">
            GESTÃO OPERACIONAL
          </span>

          <h1>Equipamentos</h1>

          <p>
            Gerencie os equipamentos e acompanhe sua disponibilidade.
          </p>
        </div>

        <button className="botao-primario">
          <Plus size={18} />
          Novo equipamento
        </button>
      </div>

      {/* Busca e filtros */}
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
              <option value="Manutenção">Em manutenção</option>
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

      {/* Lista de equipamentos */}
      <div className="equipamentos-grid">

        {equipamentosFiltrados.map((equipamento) => (
          <CardEquipamento
            key={equipamento.id}
            nome={equipamento.nome}
            categoria={equipamento.categoria}
            status={equipamento.status}
            localizacao={equipamento.localizacao}
          />
        ))}

      </div>

      {/* Nenhum equipamento encontrado */}
      {equipamentosFiltrados.length === 0 && (
        <div className="estado-vazio">
          <Dumbbell size={32} />

          <h3>Nenhum equipamento encontrado</h3>

          <p>
            Tente alterar a busca ou selecionar outro status.
          </p>
        </div>
      )}

    </div>
  );
}