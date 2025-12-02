import { useState, useEffect } from "react";
// @ts-ignore - hook em JS sem tipos
import { useProdutos } from "../hooks/useProducts";
import { X } from "lucide-react";

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
    const { fetchProdutos, criarProduto } = useProdutos();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [pesquisaLocal, setPesquisaLocal] = useState(filtros.pesquisa);
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>(filtros.categorias);
    const [locaisSelecionados, setLocaisSelecionados] = useState<string[]>(filtros.locais);
    const [faixasPrecoSelecionadas, setFaixasPrecoSelecionadas] = useState<string[]>(filtros.faixasPreco);
    const [apenasDisponiveis, setApenasDisponiveis] = useState(filtros.apenasDisponiveis);
    
    // Estados do formulário de cadastro
    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        preco: "",
        local: "",
        categoria: "",
        imagem: null as File | null,
        imagemPreview: ""
    });
    const [erro, setErro] = useState("");
    const [loadingCadastro, setLoadingCadastro] = useState(false);

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
        if (!modalOpen) {
            setErro("");
            setFormData({
                nome: "",
                descricao: "",
                preco: "",
                local: "",
                categoria: "",
                imagem: null,
                imagemPreview: ""
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                imagem: file,
                imagemPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmitCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");
        setLoadingCadastro(true);

        // Validações
        if (!formData.nome.trim()) {
            setErro("Nome é obrigatório");
            setLoadingCadastro(false);
            return;
        }
        if (!formData.preco || parseFloat(formData.preco) <= 0) {
            setErro("Preço deve ser maior que zero");
            setLoadingCadastro(false);
            return;
        }
        if (!formData.local.trim()) {
            setErro("Local é obrigatório");
            setLoadingCadastro(false);
            return;
        }
        if (!formData.categoria) {
            setErro("Categoria é obrigatória");
            setLoadingCadastro(false);
            return;
        }

        try {
            // Converter imagem para base64 ou URL
            let imagemUrl = "";
            if (formData.imagem) {
                const reader = new FileReader();
                imagemUrl = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(formData.imagem!);
                });
            } else {
                imagemUrl = "https://via.placeholder.com/320x220?text=Sem+Imagem";
            }

            const novoProduto = {
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim(),
                preco: parseFloat(formData.preco),
                local: formData.local.trim(),
                categoria: formData.categoria,
                imagem: imagemUrl,
                disponivel: true,
                avaliacao: 0
            };

            await criarProduto(novoProduto);
            await fetchProdutos();
            toggleAddItem(); // Fecha o modal
        } catch (error: any) {
            setErro(error.message || "Erro ao cadastrar produto");
        } finally {
            setLoadingCadastro(false);
        }
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
                <button className="button-add-item" onClick={toggleAddItem}>
                    + Adicionar Item
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

        {/* Modal de Adicionar Item */}
        {modalOpen && (
            <div className="modalAdd-overlay" onClick={toggleAddItem}></div>
        )}

        <div className={`modalItem ${modalOpen ? 'modal-open' : ''}`}>
            <div className="modal-header">
                <h2>Adicionar Item</h2>
                <button className="close-button" onClick={toggleAddItem}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmitCadastro} style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="modal-nome" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nome do Item *</label>
                    <input
                        type="text"
                        id="modal-nome"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Guitarra Elétrica"
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="modal-descricao" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Descrição</label>
                    <textarea
                        id="modal-descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descreva o equipamento..."
                        rows={3}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', resize: 'vertical' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="modal-preco" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Preço por dia (R$) *</label>
                    <input
                        type="number"
                        id="modal-preco"
                        value={formData.preco}
                        onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="modal-local" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Localização *</label>
                    <input
                        type="text"
                        id="modal-local"
                        value={formData.local}
                        onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                        placeholder="Ex: São Paulo"
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="modal-categoria" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Categoria *</label>
                    <select
                        id="modal-categoria"
                        value={formData.categoria}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                    >
                        <option value="">Selecione a categoria</option>
                        <option value="cordas">Cordas</option>
                        <option value="teclas">Teclas</option>
                        <option value="percussao">Percussão</option>
                        <option value="amplificadores">Amplificadores</option>
                        <option value="som">Sistemas de PA</option>
                        <option value="acessorios">Acessórios</option>
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="modal-imagem" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Foto do Item</label>
                    <input
                        type="file"
                        id="modal-imagem"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    {formData.imagemPreview && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <img 
                                src={formData.imagemPreview} 
                                alt="Preview" 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '200px', 
                                    borderRadius: '8px',
                                    objectFit: 'cover'
                                }} 
                            />
                        </div>
                    )}
                </div>

                {erro && (
                    <div style={{ 
                        color: 'red', 
                        marginBottom: '1rem', 
                        padding: '0.5rem',
                        backgroundColor: '#ffe6e6',
                        borderRadius: '4px'
                    }}>
                        {erro}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button 
                        type="button"
                        onClick={toggleAddItem}
                        disabled={loadingCadastro}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#f5f5f5',
                            color: '#333',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={loadingCadastro}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        {loadingCadastro ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </div>
            </form>
        </div>
    </div>
    </>
    )
}

