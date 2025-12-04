import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Filtros } from "../components/filterBar";
import { EquipamentoCard } from "../components/equipamentosCard";
import { useProdutos } from "../hooks/useProducts";
import { type Equipamento } from "../mocks/equipamentosData";
import { MapPin, Star, User } from "lucide-react";
import { aluguelService } from "../services/rentalService";
import { notificationService } from "../services/notificationService";
import { getUsuarioSalvo } from "../utils/userStorage";

interface FiltrosState {
  pesquisa: string;
  categorias: string[];
  locais: string[];
  faixasPreco: string[];
  apenasDisponiveis: boolean;
}

const obterUsuarioLogado = () => getUsuarioSalvo();

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
  const { produtos, loading, fetchProdutos, atualizarProdutoLocal } = useProdutos();
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);
  const [statusLocal, setStatusLocal] = useState<number | null>(null);
  const [alugando, setAlugando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [diasLocacao, setDiasLocacao] = useState<number>(3);
  const [aluguelId, setAluguelId] = useState<number | null>(null);
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
    const statusId =
      (equipamento as any).statusAluguelIdStatus ??
      (equipamento as any).status_aluguel_id_status ??
      null;
    setStatusLocal(Number.isFinite(Number(statusId)) ? Number(statusId) : null);
    setMensagem("");
    setErro("");
    setAluguelId(null);
  };

  const handleCloseDetalhes = () => {
    setEquipamentoSelecionado(null);
    setMensagem("");
    setErro("");
    setAluguelId(null);
    setAlugando(false);
    setStatusLocal(null);
  };

  useEffect(() => {
    // Reset estado quando troca de item
    if (!equipamentoSelecionado) {
      setMensagem("");
      setErro("");
      setAluguelId(null);
      setAlugando(false);
      setStatusLocal(null);
      setDiasLocacao(3);
    }
  }, [equipamentoSelecionado]);

  const handleAlugarAsync = async () => {
    if (!equipamentoSelecionado) return;
    const produtoId =
      (equipamentoSelecionado as any).id ??
      (equipamentoSelecionado as any).idProduto ??
      (equipamentoSelecionado as any).produtoId ??
      (equipamentoSelecionado as any).idproduto;
    const disponivel = (equipamentoSelecionado as any).disponivel;

    if (!disponivel || statusLocal === 2 || statusLocal === 3) return;
    if (usuarioIdLogado == null) {
      setErro("Faça login para alugar um item.");
      return;
    }
    const donoId =
      (equipamentoSelecionado as any).usuarioId ??
      (equipamentoSelecionado as any).usuario_id_usuario ??
      (equipamentoSelecionado as any).usuarioIdUsuario ??
      (equipamentoSelecionado as any).idUsuario;
    if (donoId != null && Number(donoId) === Number(usuarioIdLogado)) {
      setErro("Você não pode alugar o próprio item.");
      return;
    }

    setErro("");
    setMensagem("");
    setAlugando(true);
    try {
      // Confirma se já existe reserva/aluguel
      const [reservados, alugados] = await Promise.all([
        aluguelService.listarPorStatus(2),
        aluguelService.listarPorStatus(3),
      ]);
      const existePendente = (Array.isArray(reservados) ? reservados : []).find((a: any) => {
        const prodId = a.produtoIdProduto ?? a.produto_id_produto ?? a.idProduto ?? a.produtoId;
        return Number(prodId) === Number(produtoId);
      });
      const existeAlugado = (Array.isArray(alugados) ? alugados : []).find((a: any) => {
        const prodId = a.produtoIdProduto ?? a.produto_id_produto ?? a.idProduto ?? a.produtoId;
        return Number(prodId) === Number(produtoId);
      });
      if (existePendente || existeAlugado) {
        const novoStatus = existeAlugado ? 3 : 2;
        setStatusLocal(novoStatus);
        atualizarProdutoLocal(produtoId, { disponivel: false, statusAluguelIdStatus: novoStatus });
        setMensagem(existeAlugado ? "Este item já está alugado." : "Este item já está reservado.");
        setAlugando(false);
        return;
      }

      const resposta: any = await aluguelService.alugarProduto(Number(produtoId), {
        usuarioId: usuarioIdLogado,
        preco: (equipamentoSelecionado as any).preco,
        dias: diasLocacao,
      });
      const novoAluguelId =
        resposta?.aluguelId ||
        resposta?.aluguelCriado?.id ||
        resposta?.aluguelCriado?.aluguelId ||
        resposta?.aluguelCriado?.idAluguel ||
        resposta?.aluguelCriado?.id_aluguel ||
        null;
      setAluguelId(novoAluguelId);
      setStatusLocal(2);
      atualizarProdutoLocal(produtoId, { disponivel: false, statusAluguelIdStatus: 2 });
      await fetchProdutos();
      setMensagem("Aluguel criado e reservado com sucesso.");

      if (donoId) {
        const titulo = "Confirme o aluguel do seu item";
        const conteudo = `O equipamento "${(equipamentoSelecionado as any).nome}" foi reservado e aguarda sua confirmação.`;
        notificationService.add({
          title: titulo,
          content: conteudo,
          category: "Aluguel",
          recipientId: Number(donoId),
          aluguelId: novoAluguelId ?? undefined,
          produtoId: Number(produtoId),
        });
      }
      window.dispatchEvent(new CustomEvent('produtos:refresh'));
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Nao foi possivel concluir o aluguel.";
      setErro(msg);
    } finally {
      setAlugando(false);
    }
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

                    <div className="produto-modal-extra">
                      <div style={{ marginBottom: "0.75rem" }}>
                        <label htmlFor="dias-select" style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                          Período de locação
                        </label>
                        <select
                          id="dias-select"
                          value={diasLocacao}
                          onChange={(e) => setDiasLocacao(Number(e.target.value))}
                          className="dias-select"
                          disabled={alugando || statusLocal === 2 || statusLocal === 3}
                        >
                          <option value={1}>1 dia</option>
                          <option value={3}>3 dias</option>
                          <option value={7}>7 dias</option>
                          <option value={15}>15 dias</option>
                          <option value={30}>30 dias</option>
                        </select>
                      </div>

                      {erro && (
                        <div className="produto-modal-msg erro">{erro}</div>
                      )}

                      {mensagem && (
                        <div className="produto-modal-msg sucesso">{mensagem}</div>
                      )}

                      <div className="produto-modal-acao">
                        <button
                          className={`btn-alugar ${
                            !(equipamentoSelecionado as any).disponivel ||
                            statusLocal === 2 ||
                            statusLocal === 3
                              ? "btn-disabled"
                              : ""
                          }`}
                          onClick={handleAlugarAsync}
                          disabled={
                            !(equipamentoSelecionado as any).disponivel ||
                            alugando ||
                            statusLocal === 2 ||
                            statusLocal === 3 ||
                            ((equipamentoSelecionado as any).usuarioId ?? (equipamentoSelecionado as any).usuario_id_usuario ?? (equipamentoSelecionado as any).usuarioIdUsuario ?? (equipamentoSelecionado as any).idUsuario) == usuarioIdLogado
                          }
                        >
                          {alugando
                            ? "Alugando..."
                            : statusLocal === 2
                              ? "Confirmação pendente"
                              : statusLocal === 3
                                ? "Indisponível"
                                : "Alugar Agora"}
                        </button>
                        <button className="btn-voltar" onClick={handleCloseDetalhes}>Fechar</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
    </div>
  );
}
