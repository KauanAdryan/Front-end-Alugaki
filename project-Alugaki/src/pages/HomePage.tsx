import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Filtros } from "../components/filterBar";
import { EquipamentoCard } from "../components/equipamentosCard";
import { useProdutos } from "../hooks/useProducts";
import { type Equipamento } from "../mocks/equipamentosData";
import { MapPin, Star, User } from "lucide-react";

interface FiltrosState {
  pesquisa: string;
  categorias: string[];
  locais: string[];
  faixasPreco: string[];
  apenasDisponiveis: boolean;
}

const obterUsuarioLogado = () => {
  try {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  } catch (error) {
    console.warn("Nao foi possivel ler usuario logado", error);
    return null;
  }
};

const mapearCategoria = (categoria: string): string => {
  const mapeamento: { [key: string]: string } = {
    "cordas": "Instrumentos",
    "teclas": "Instrumentos",
    "percussao": "Instrumentos",
    "amplificadores": "Amplificadores",
    "som": "Sistemas de PA"
  };
  return mapeamento[categoria] || "Acessorios";
};

export function Homepage() {
  const { produtos, loading } = useProdutos();
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);
  const usuarioLogado = obterUsuarioLogado();
  const usuarioIdLogado = usuarioLogado?.id ?? usuarioLogado?.idUsuario ?? usuarioLogado?.usuarioId;
  const usuarioNomeLogado = usuarioLogado?.nome ? usuarioLogado.nome.toLowerCase() : "";
  const [filtros, setFiltros] = useState<FiltrosState>({
    pesquisa: "",
    categorias: [],
    locais: [],
    faixasPreco: [],
    apenasDisponiveis: false
  });

  const naoPertenceAoUsuario = (equipamento: Equipamento) => {
    const donoId =
      (equipamento as any).usuarioId ??
      (equipamento as any).usuario_id_usuario ??
      (equipamento as any).usuarioIdUsuario ??
      (equipamento as any).idUsuario;
    const donoNome = (
      (equipamento as any).proprietario ||
      (equipamento as any).usuarioNome ||
      (equipamento as any).nomeUsuario ||
      ""
    ).toLowerCase();

    if (usuarioIdLogado != null && donoId != null) {
      return Number(donoId) !== Number(usuarioIdLogado);
    }

    if (usuarioNomeLogado && donoNome) {
      return donoNome !== usuarioNomeLogado;
    }

    // Sem usuario logado, mantemos tudo
    return true;
  };

  const equipamentosFiltrados = produtos
    .filter(naoPertenceAoUsuario)
    .filter((equipamento: any) => {
      // Se o BFF marcar status 2 (reservado) ou 3 (alugado), ocultamos da listagem
      const statusIdRaw = equipamento.statusAluguelIdStatus ?? equipamento.status_aluguel_id_status;
      const statusId = Number(statusIdRaw);
      if (statusId === 2 || statusId === 3) {
        return false;
      }
      return true;
    })
    .filter((equipamento: Equipamento) => {
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
    
    // Filtro por faixas de preco
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

  const handleOpenDetalhes = (equipamento: Equipamento) => {
    setEquipamentoSelecionado(equipamento);
  };

  const handleCloseDetalhes = () => {
    setEquipamentoSelecionado(null);
  };

  return (
    <div className="page-container">
      <Navbar />

      <header className="explore-header">
        <h1>Encontre o Equipamento Ideal</h1>
        <p>Explore uma vasta gama de equipamentos disponiveis para aluguel.</p>
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
            {equipamentosFiltrados.map((equipamento: Equipamento, idx: number) => (
              <EquipamentoCard 
                // Usa id do front ou idProduto do backend; fallback no indice para evitar warning
                key={equipamento.id || (equipamento as any).idProduto || `equip-${idx}`}
                equipamento={equipamento}
                onOpenDetails={handleOpenDetalhes}
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

      {equipamentoSelecionado && (
        <div className="produto-modal-overlay" onClick={handleCloseDetalhes}>
          <div className="produto-modal" onClick={(e) => e.stopPropagation()}>
            <button className="produto-modal-close" onClick={handleCloseDetalhes}>×</button>
            <div className="produto-modal-body">
              <div className="produto-modal-image">
                <img
                  src={(equipamentoSelecionado as any).imagem}
                  alt={equipamentoSelecionado.nome}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = 'https://via.placeholder.com/600x400?text=Sem+Imagem';
                  }}
                />
                {((equipamentoSelecionado as any).avaliacao ?? 0) > 0 && (
                  <span className="produto-modal-badge">
                    <Star size={14} fill="currentColor" /> {(equipamentoSelecionado as any).avaliacao}
                  </span>
                )}
              </div>

              <div className="produto-modal-info">
                <h2>{equipamentoSelecionado.nome}</h2>
                <div className="produto-modal-preco">
                  <strong>R${equipamentoSelecionado.preco}</strong>
                  <span>/dia</span>
                </div>

                <div className="produto-modal-local">
                  <MapPin size={18} />
                  <span>{(equipamentoSelecionado as any).local}</span>
                </div>

                {(equipamentoSelecionado as any).descricao && (
                  <p className="produto-modal-descricao">
                    {(equipamentoSelecionado as any).descricao}
                  </p>
                )}

                {(equipamentoSelecionado as any).proprietario && (
                  <div className="produto-modal-owner">
                    <User size={16} />
                    <span>Proprietário: {(equipamentoSelecionado as any).proprietario}</span>
                  </div>
                )}

                <div className="produto-modal-acao">
                  <button className="btn-alugar">Alugar Agora</button>
                  <button className="btn-voltar" onClick={handleCloseDetalhes}>Fechar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
