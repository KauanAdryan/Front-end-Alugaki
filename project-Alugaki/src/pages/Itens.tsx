import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Filtros } from "../components/filterBar";
import { EquipamentoCard } from "../components/equipamentosCard";
import { equipamentosData, type Equipamento } from "../mocks/equipamentosData";

interface FiltrosState {
  pesquisa: string;
  categorias: string[];
  locais: string[];
  faixasPreco: string[];
  apenasDisponiveis: boolean;
}

export function MyItens() {
  const [filtros, setFiltros] = useState<FiltrosState>({
    pesquisa: "",
    categorias: [],
    locais: [],
    faixasPreco: [],
    apenasDisponiveis: false
  });

  // Filtrar apenas os itens do usuário logado (mockado)
  // Em produção, isso viria da API com base no usuário autenticado
  let meusItens = equipamentosData.filter(item => 
    item.proprietario === "Kauan Cássia" || item.id <= 3 // Mock: primeiros 3 itens são do usuário
  );

  // Aplicar filtros
  meusItens = meusItens.filter((equipamento: Equipamento) => {
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
        <h1>Meus Itens</h1>
        <p>Cadastre, atualize, edite e exclua os seus itens.</p>
      </header>

      <Filtros 
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimparFiltros={handleLimparFiltros}
      />

      <div className="cards">
        {meusItens.map((item) => (
          <EquipamentoCard key={item.id} equipamento={item} />
        ))}
      </div>

      {meusItens.length === 0 && (
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
    </div>
  );
}
