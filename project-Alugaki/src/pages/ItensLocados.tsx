import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Filtros } from "../components/filterBar";
import { EquipamentoCard } from "../components/equipamentosCard";
// @ts-ignore - hook em JS sem tipos
import { useProdutos } from "../hooks/useProducts";
import { type Equipamento } from "../mocks/equipamentosData";
import { aluguelService } from "../services/rentalService";
import { notificationService } from "../services/notificationService";
import { MapPin, Star, User } from "lucide-react";

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

const obterUsuarioLogado = () => {
  try {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  } catch (error) {
    console.error("Nao foi possivel ler o usuario logado:", error);
    return null;
  }
};

interface FiltrosState {
  pesquisa: string;
  categorias: string[];
  locais: string[];
  faixasPreco: string[];
  apenasDisponiveis: boolean;
}

export function ItensLocados() {
  const { produtos, loading } = useProdutos();
  const usuarioLogado = obterUsuarioLogado();
  const usuarioIdLogado = usuarioLogado?.id ?? usuarioLogado?.idUsuario ?? usuarioLogado?.usuarioId;
  const usuarioNomeLogado = usuarioLogado?.nome ? usuarioLogado.nome.toLowerCase() : "";
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [produtosAlugadosIds, setProdutosAlugadosIds] = useState<number[]>([]);
  const [aluguelPorProduto, setAluguelPorProduto] = useState<Record<number, number>>({});
  const [toastMessage, setToastMessage] = useState<string>("");
  const [filtros, setFiltros] = useState<FiltrosState>({
    pesquisa: "",
    categorias: [],
    locais: [],
    faixasPreco: [],
    apenasDisponiveis: false
  });

  // Busca alugueis (status 3) do usuário locatário
  useEffect(() => {
    const fetchAlugueis = async () => {
      if (!usuarioIdLogado) {
        setProdutosAlugadosIds([]);
        setLoadingRentals(false);
        return;
      }
      try {
        setLoadingRentals(true);
        const alugados = await aluguelService.listarPorStatus(3);
        const relacoes = (Array.isArray(alugados) ? alugados : [])
          .filter((a: any) => {
            const userId =
              a.usuarioIdUsuario ??
              a.usuario_id_usuario ??
              a.idUsuario ??
              a.usuarioId;
            return Number(userId) === Number(usuarioIdLogado);
          })
          .map((a: any) => {
            const prodId =
              a.produtoIdProduto ??
              a.produto_id_produto ??
              a.idProduto ??
              a.produtoId;
            const aluguelId =
              a.idAluguel ??
              a.id_aluguel ??
              a.id ??
              a.aluguelId;
            return { prodId: Number(prodId), aluguelId: Number(aluguelId) };
          })
          .filter((item: any) => Number.isFinite(item.prodId));

        const ids = relacoes.map((item: any) => item.prodId);
        const mapa: Record<number, number> = {};
        relacoes.forEach((rel: any) => {
          if (Number.isFinite(rel.prodId) && Number.isFinite(rel.aluguelId)) {
            mapa[rel.prodId] = rel.aluguelId;
          }
        });

        setProdutosAlugadosIds(ids);
        setAluguelPorProduto(mapa);
      } catch (error) {
        console.error("Nao foi possivel carregar itens alugados do locatario:", error);
        setProdutosAlugadosIds([]);
        setAluguelPorProduto({});
      } finally {
        setLoadingRentals(false);
      }
    };
    fetchAlugueis();
  }, [usuarioIdLogado]);

  const pertenceAoUsuario = (item: Equipamento) => {
    const donoId =
      (item as any).usuarioId ??
      (item as any).usuario_id_usuario ??
      (item as any).usuarioIdUsuario ??
      (item as any).idUsuario;
    const donoNome = (
      (item as any).proprietario ||
      (item as any).usuarioNome ||
      (item as any).nomeUsuario ||
      ""
    ).toLowerCase();

    if (usuarioIdLogado != null && donoId != null) {
      return Number(donoId) === Number(usuarioIdLogado);
    }

    if (usuarioNomeLogado && donoNome) {
      return donoNome === usuarioNomeLogado;
    }

    return false;
  };

  // Filtra itens alugados pelo usuario (locatario), baseado nos ids de aluguel status 3
  let itensLocados = produtos.filter((equipamento: Equipamento) => {
    if (!produtosAlugadosIds.length) return false;
    const prodId = Number((equipamento as any).id ?? (equipamento as any).idProduto ?? (equipamento as any).produtoId ?? (equipamento as any).idproduto);
    return produtosAlugadosIds.includes(prodId);
  });

  // Aplicar filtros
  itensLocados = itensLocados.filter((equipamento: Equipamento) => {
    if (filtros.pesquisa && !equipamento.nome.toLowerCase().includes(filtros.pesquisa.toLowerCase())) {
      return false;
    }

    if (filtros.categorias.length > 0) {
      const categoriaMapeada = mapearCategoria(equipamento.categoria);
      if (!filtros.categorias.includes(categoriaMapeada)) {
        return false;
      }
    }

    if (filtros.locais.length > 0 && !filtros.locais.includes(equipamento.local)) {
      return false;
    }

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

  const handleSolicitarDevolucao = (equipamento: Equipamento) => {
    const prodId = Number((equipamento as any).id ?? (equipamento as any).idProduto ?? (equipamento as any).produtoId ?? (equipamento as any).idproduto);
    const aluguelId = aluguelPorProduto[prodId];
    const donoId =
      (equipamento as any).usuarioId ??
      (equipamento as any).usuario_id_usuario ??
      (equipamento as any).usuarioIdUsuario ??
      (equipamento as any).idUsuario;
    if (!aluguelId || !donoId) {
      alert("Não foi possível identificar o aluguel ou o dono do item para solicitar devolução.");
      return;
    }
    notificationService.add({
      title: "Devolução solicitada",
      content: `O item "${equipamento.nome}" foi devolvido e aguarda confirmação do dono.`,
      category: "Devolucao",
      recipientId: Number(donoId),
      aluguelId: Number(aluguelId),
      produtoId: prodId,
    });
    setToastMessage("Devolução enviada ao dono para confirmação.");
    setTimeout(() => setToastMessage(""), 2500);
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
        <h1>Itens Alugados</h1>
        <p>Visualize os seus itens que já estão alugados.</p>
      </header>

      <Filtros 
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimparFiltros={handleLimparFiltros}
      />

      {loading || loadingRentals ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Carregando itens...</p>
        </div>
      ) : (
        <>
          <div className="cards">
            {itensLocados.map((item: Equipamento) => (
              <div key={item.id} style={{ width: "220px" }}>
                <EquipamentoCard equipamento={item} showAlugarButton={false} onOpenDetails={handleOpenDetalhes} />
                <button
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#007bff",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                  onClick={() => handleSolicitarDevolucao(item)}
                >
                  Devolver item
                </button>
              </div>
            ))}
          </div>

          {itensLocados.length === 0 && (
            <div className="no-results">
              <p>Nenhum item alugado encontrado.</p>
              <button 
                onClick={handleLimparFiltros}
                className="btn-limpar-filtros"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {toastMessage && (
            <div
              style={{
                position: "fixed",
                top: "16px",
                right: "16px",
                background: "#000",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 2000,
              }}
            >
              {toastMessage}
            </div>
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
                      <button
                        className="btn-alugar"
                        onClick={() => handleSolicitarDevolucao(equipamentoSelecionado)}
                      >
                        Devolver item
                      </button>
                      <button className="btn-voltar" onClick={handleCloseDetalhes}>Fechar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
