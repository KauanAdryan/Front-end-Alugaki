import { useState } from "react";

export function Filtros(){
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
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
                <button className="button-add-item">+ Adicionar Item</button>
            </div>

            <div className="search-bar">
                <input type="text" placeholder="Procurar equipamento..." />
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

            <div className="sidebar-content">
                <div className="filter-section">
                    <h3>Preço</h3>
                    <div className="filter-options">
                        <label>
                            <input type="checkbox" />
                            <span>Até R$ 30</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>R$ 30 - R$ 50</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>R$ 50 - R$ 100</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>Acima de R$ 100</span>
                        </label>
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Categoria</h3>
                    <div className="filter-options">
                        <label>
                            <input type="checkbox" />
                            <span>Instrumentos</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>Amplificadores</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>Sistemas de PA</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>Acessórios</span>
                        </label>
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Localização</h3>
                    <div className="filter-options">
                        <label>
                            <input type="checkbox" />
                            <span>São Paulo</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>Rio de Janeiro</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>Belo Horizonte</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>Curitiba</span>
                        </label>
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Disponibilidade</h3>
                    <div className="filter-options">
                        <label>
                            <input type="checkbox" />
                            <span>Disponível agora</span>
                        </label>
                        <label>
                            <input type="checkbox" />
                            <span>Próximos 7 dias</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="btn-clear">Limpar Filtros</button>
                <button className="btn-apply">Aplicar Filtros</button>
            </div>
        </div>
    </div>
    </>
    )
}

