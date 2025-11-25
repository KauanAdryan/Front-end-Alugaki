import { useState, useEffect } from "react";

interface FiltrosProps {
  filtros: {
    pesquisa: string;
    categorias: string[];
    locais: string[];
    faixasPreco: string[];
    apenasDisponiveis: boolean;
  };
  onFiltrosChange: (filtros: any) => void;
  onLimparFiltros: () => void;
}

export function Filtros({ filtros, onFiltrosChange, onLimparFiltros }: FiltrosProps){
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [pesquisaLocal, setPesquisaLocal] = useState(filtros.pesquisa);
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>(filtros.categorias);
    const [locaisSelecionados, setLocaisSelecionados] = useState<string[]>(filtros.locais);
    const [faixasPrecoSelecionadas, setFaixasPrecoSelecionadas] = useState<string[]>(filtros.faixasPreco);
    const [apenasDisponiveis, setApenasDisponiveis] = useState(filtros.apenasDisponiveis);

    // Sincronizar pesquisa em tempo real
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        onFiltrosChange({ pesquisa: pesquisaLocal });
      }, 300); // Debounce de 300ms
      
      return () => clearTimeout(timeoutId);
    }, [pesquisaLocal]);

    // Sincronizar estado local quando filtros externos mudam (apenas quando realmente mudarem)
    useEffect(() => {
      if (filtros.pesquisa !== pesquisaLocal) {
        setPesquisaLocal(filtros.pesquisa);
      }
      if (JSON.stringify(filtros.categorias) !== JSON.stringify(categoriasSelecionadas)) {
        setCategoriasSelecionadas(filtros.categorias);
      }
      if (JSON.stringify(filtros.locais) !== JSON.stringify(locaisSelecionados)) {
        setLocaisSelecionados(filtros.locais);
      }
      if (JSON.stringify(filtros.faixasPreco) !== JSON.stringify(faixasPrecoSelecionadas)) {
        setFaixasPrecoSelecionadas(filtros.faixasPreco);
      }
      if (filtros.apenasDisponiveis !== apenasDisponiveis) {
        setApenasDisponiveis(filtros.apenasDisponiveis);
      }
    }, [filtros]);

    const handleCategoriaChange = (categoria: string) => {
      setCategoriasSelecionadas(prev => 
        prev.includes(categoria) 
          ? prev.filter(c => c !== categoria)
          : [...prev, categoria]
      );
    };

    const handleLocalChange = (local: string) => {
      setLocaisSelecionados(prev => 
        prev.includes(local) 
          ? prev.filter(l => l !== local)
          : [...prev, local]
      );
    };

    const handleFaixaPrecoChange = (faixa: string) => {
      setFaixasPrecoSelecionadas(prev => 
        prev.includes(faixa) 
          ? prev.filter(f => f !== faixa)
          : [...prev, faixa]
      );
    };

    const handleAplicarFiltros = () => {
      onFiltrosChange({
        categorias: categoriasSelecionadas,
        locais: locaisSelecionados,
        faixasPreco: faixasPrecoSelecionadas,
        apenasDisponiveis: apenasDisponiveis
      });
      setSidebarOpen(false);
    };

    const handleLimparFiltros = () => {
      setCategoriasSelecionadas([]);
      setLocaisSelecionados([]);
      setFaixasPrecoSelecionadas([]);
      setApenasDisponiveis(false);
      setPesquisaLocal("");
      onLimparFiltros();
      setSidebarOpen(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

        const toggleAddItem = () => {
        setModalOpen(!modalOpen);
    };

    return(
    <>
        <div className="filter-bar">
            <button className="button-filters" onClick={toggleSidebar}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                Filtros
            </button>

            <div className="add_bar">
                <button className="button-add-item" onClick={toggleAddItem}> + Adicionar Item
                <svg width="0" height="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <label htmlFor="name">Nome do Item</label>
                    <input type="text" id="name" className="input-field" placeholder="Insira o nome do item" required />
                    <label htmlFor="description">Descrição</label>
                    <input type="text" id="description" className="input-field" placeholder="Insira a descrição do item" required />
                    <label htmlFor="image">Foto do Item</label>
                    <input type="file" id="image" className="input-field" accept="image/*" required />
                    <label htmlFor="select">Categoria</label>
                    <select id="select" className="input-field" required >
                        <option value="">Selecione a categoria</option>
                        <option value="instrumentos">Instrumentos</option>
                        <option value="amplificadores">Amplificadores</option>
                        <option value="sistemas-pa">Sistemas de PA</option>
                        <option value="acessorios">Acessórios</option>
                    </select>
                    <label htmlFor="Condição">Condição do Item</label>
                    <input type="text" id="condition" className="input-field" placeholder="Insira a condição do item" required />
                    <label htmlFor="price">Preço por dia (R$)</label>
                    <input type="number" id="price" className="input-field" placeholder="Insira o preço por dia" required />
                    <label htmlFor="availability">Disponibilidade</label>
                    <input type="text" id="availability" className="input-field" placeholder="Insira a disponibilidade do item" required />
                </svg>
                </button>
            </div>

            <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Procurar equipamento..." 
                  value={pesquisaLocal}
                  onChange={(e) => setPesquisaLocal(e.target.value)}
                />
            </div>


        {/* Overlay para fechar a sidebar ao clicar fora */}
        {sidebarOpen && (
            <div className="sidebar-overlay" onClick={toggleSidebar}></div>
        )}

        {/* Sidebar de filtros */}
        <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
                <h2>Filtros</h2>
                <button className="close-button" onClick={toggleSidebar}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

        {modalOpen && (
            <div className="modalAdd-overlay" onClick={toggleAddItem}></div>
        )}

        <div className={`modalItem ${modalOpen ? 'modal-open' : ''}`}>
            <div className="modal-header">
                <h2>Adicionar Item</h2>
                <button className="close-button" onClick={toggleAddItem}>

                </button>
            </div>

            <div className="sidebar-content">
                <div className="filter-section">
                    <h3>Preço</h3>
                    <div className="filter-options">
                        <label>
                            <input 
                              type="checkbox" 
                              checked={faixasPrecoSelecionadas.includes("ate30")}
                              onChange={() => handleFaixaPrecoChange("ate30")}
                            />
                            <span>Até R$ 30</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={faixasPrecoSelecionadas.includes("30-50")}
                              onChange={() => handleFaixaPrecoChange("30-50")}
                            />
                            <span>R$ 30 - R$ 50</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={faixasPrecoSelecionadas.includes("50-100")}
                              onChange={() => handleFaixaPrecoChange("50-100")}
                            />
                            <span>R$ 50 - R$ 100</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={faixasPrecoSelecionadas.includes("acima100")}
                              onChange={() => handleFaixaPrecoChange("acima100")}
                            />
                            <span>Acima de R$ 100</span>
                        </label>
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Categoria</h3>
                    <div className="filter-options">
                        <label>
                            <input 
                              type="checkbox" 
                              checked={categoriasSelecionadas.includes("Instrumentos")}
                              onChange={() => handleCategoriaChange("Instrumentos")}
                            />
                            <span>Instrumentos</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={categoriasSelecionadas.includes("Amplificadores")}
                              onChange={() => handleCategoriaChange("Amplificadores")}
                            />
                            <span>Amplificadores</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={categoriasSelecionadas.includes("Sistemas de PA")}
                              onChange={() => handleCategoriaChange("Sistemas de PA")}
                            />
                            <span>Sistemas de PA</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={categoriasSelecionadas.includes("Acessórios")}
                              onChange={() => handleCategoriaChange("Acessórios")}
                            />
                            <span>Acessórios</span>
                        </label>
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Localização</h3>
                    <div className="filter-options">
                        <label>
                            <input 
                              type="checkbox" 
                              checked={locaisSelecionados.includes("São Paulo")}
                              onChange={() => handleLocalChange("São Paulo")}
                            />
                            <span>São Paulo</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={locaisSelecionados.includes("Rio de Janeiro")}
                              onChange={() => handleLocalChange("Rio de Janeiro")}
                            />
                            <span>Rio de Janeiro</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={locaisSelecionados.includes("Belo Horizonte")}
                              onChange={() => handleLocalChange("Belo Horizonte")}
                            />
                            <span>Belo Horizonte</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={locaisSelecionados.includes("Curitiba")}
                              onChange={() => handleLocalChange("Curitiba")}
                            />
                            <span>Curitiba</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={locaisSelecionados.includes("Porto Alegre")}
                              onChange={() => handleLocalChange("Porto Alegre")}
                            />
                            <span>Porto Alegre</span>
                        </label>
                        <label>
                            <input 
                              type="checkbox" 
                              checked={locaisSelecionados.includes("Brasília")}
                              onChange={() => handleLocalChange("Brasília")}
                            />
                            <span>Brasília</span>
                        </label>
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Disponibilidade</h3>
                    <div className="filter-options">
                        <label>
                            <input 
                              type="checkbox" 
                              checked={apenasDisponiveis}
                              onChange={(e) => setApenasDisponiveis(e.target.checked)}
                            />
                            <span>Disponível agora</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="btn-clear" onClick={handleLimparFiltros}>Limpar Filtros</button>
                <button className="btn-apply" onClick={handleAplicarFiltros}>Aplicar Filtros</button>
            </div>
        </div>
    </div>
    </div>
    </>
    )
}

