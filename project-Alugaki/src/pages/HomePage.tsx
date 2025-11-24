import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Filtros } from "../components/filterBar";
import { EquipamentoCard } from "../components/equipamentosCard";
import { equipamentosData, type Equipamento } from "../mocks/equipamentosData";

export function Homepage() {
  const [filtros, setFiltros] = useState({
    categoria: "Todos",
    local: "Todos",
    precoMax: 100,
    apenasDisponiveis: false
  });

  const equipamentosFiltrados = equipamentosData.filter((equipamento: Equipamento) => {
    // Filtro por categoria
    if (filtros.categoria !== "Todos" && equipamento.categoria !== filtros.categoria) {
      return false;
    }
    
    // Filtro por local
    if (filtros.local !== "Todos" && equipamento.local !== filtros.local) {
      return false;
    }
    
    // Filtro por preço
    if (equipamento.preco > filtros.precoMax) {
      return false;
    }
    
    // Filtro por disponibilidade
    if (filtros.apenasDisponiveis && !equipamento.disponivel) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="page-container">
      <Navbar />

      <header className="explore-header">
        <h1>Encontre o Equipamento Ideal</h1>
        <p>Explore uma vasta gama de equipamentos disponíveis para aluguel.</p>
      </header>

      <Filtros />

      <div className="results-info">
        <p>{equipamentosFiltrados.length} equipamentos encontrados</p>
      </div>

      <div className="cards">
        {equipamentosFiltrados.map((equipamento: Equipamento) => (
          <EquipamentoCard 
            key={equipamento.id} 
            equipamento={equipamento} 
          />
        ))}
      </div>

      {equipamentosFiltrados.length === 0 && (
        <div className="no-results">
          <p>Nenhum equipamento encontrado com os filtros selecionados.</p>
          <button 
            onClick={() => setFiltros({
              categoria: "Todos",
              local: "Todos",
              precoMax: 100,
              apenasDisponiveis: false
            })}
            className="btn-limpar-filtros"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}