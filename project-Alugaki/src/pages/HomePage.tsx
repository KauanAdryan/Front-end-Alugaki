import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Filtros } from "../components/filterBar";
import { EquipamentoCard } from "../components/equipamentosCard";
import { useProdutos } from "../hooks/useProducts";
import { type Equipamento } from "../mocks/equipamentosData";

interface FiltrosState {
  pesquisa: string;
  categorias: string[];
  locais: string[];
  faixasPreco: string[];
  apenasDisponiveis: boolean;
}

export function Homepage() {
  const { produtos, loading } = useProdutos();
  const [filtros, setFiltros] = useState<FiltrosState>({
    pesquisa: "",
    categorias: [],
    locais: [],
    faixasPreco: [],
    apenasDisponiveis: false
  });

  const equipamentosFiltrados = produtos.filter((equipamento: Equipamento) => {
    // Filtro por pesquisa (nome)
    if (filtros.pesquisa && !equipamento.nome.toLowerCase().includes(filtros.pesquisa.toLowerCase())) {
      return false;
    }
    
    // Filtro por categorias
    if (filtros.categorias.length > 0) {
      const categoriaMapeada = mapearCategoria(equipamento.categoria);
      if (!filtros.categorias.includes(categoriaMapeada)) {
        return false;
      }
    }
    
    // Filtro por locais
    if (filtros.locais.length > 0 && !filtros.locais.includes(equipamento.local)) {
      return false;
    }
    
    // Filtro por faixas de preço
    if (filtros.faixasPreco.length > 0) {
      const precoNoIntervalo = filtros.faixasPreco.some(faixa => {
        switch(faixa) {
          case "ate30": return equipamento.preco <= 30;
          case "30-50": return equipamento.preco > 30 && equipamento.preco <= 50;
          case "50-100": return equipamento.preco > 50 && equipamento.preco <= 100;
          case "acima100": return equipamento.preco > 100;
          default: return true;
        }
      });
      if (!precoNoIntervalo) {
        return false;
      }
    }
    
    // Filtro por disponibilidade
    if (filtros.apenasDisponiveis && !equipamento.disponivel) {
      return false;
    }
    
    return true;
  });

  const mapearCategoria = (categoria: string): string => {
    const mapeamento: { [key: string]: string } = {
      "cordas": "Instrumentos",
      "teclas": "Instrumentos",
      "percussao": "Instrumentos",
      "amplificadores": "Amplificadores",
      "som": "Sistemas de PA"
    };
    return mapeamento[categoria] || "Acessórios";
  };

  const handleFiltrosChange = (novosFiltros: Partial<FiltrosState>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const handleLimparFiltros = () => {
    setFiltros({
      pesquisa: "",
      categorias: [],
      locais: [],
      faixasPreco: [],
      apenasDisponiveis: false
    });
  };

  return (
    <div className="page-container">
      <Navbar />

      <header className="explore-header">
        <h1>Encontre o Equipamento Ideal</h1>
        <p>Explore uma vasta gama de equipamentos disponíveis para aluguel.</p>
      </header>

      <Filtros 
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimparFiltros={handleLimparFiltros}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Carregando equipamentos...</p>
        </div>
      ) : (
        <>
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
                onClick={handleLimparFiltros}
                className="btn-limpar-filtros"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}