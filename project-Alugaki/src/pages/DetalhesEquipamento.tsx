import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Star, MapPin, User } from "lucide-react";
// @ts-ignore - hook em JS sem tipos
import { useProdutos } from "../hooks/useProducts";
import { notificationService } from "../services/notificationService";
import { aluguelService } from "../services/rentalService";

const obterCategoriaLabel = (equipamento: any) => {
  const descricao =
    equipamento?.categoriaDescricao ||
    equipamento?.categoria_nome ||
    equipamento?.categoriaNome ||
    equipamento?.categoriaLabel;
  if (descricao) return descricao;

  const categoriaCampo = equipamento?.categoria;
  if (typeof categoriaCampo === "string" && isNaN(Number(categoriaCampo))) {
    return categoriaCampo;
  }

  const categoriaId =
    equipamento?.categoria_id_categoria ??
    equipamento?.categoriaIdCategoria ??
    equipamento?.categoriaId ??
    categoriaCampo;

  const mapaId: Record<number, string> = {
    1: "Eletronico",
    2: "Cordas",
    3: "Cordas Friccionadas",
    4: "Cordas Dedilhadas",
    5: "Cordas Percussao",
    6: "Sopro",
    7: "Madeiras",
    8: "Metais",
    9: "Percussao",
    10: "Percussao de Pele",
    11: "Percussao Metalica",
    12: "Teclas",
    13: "Eletrônicos",
    14: "Sintetizadores",
    15: "Acessórios",
    16: "Áudio Profissional",
    17: "Bateria e Componentes",
    18: "Violões",
    19: "Guitarras",
    20: "Baixos",
    21: "Pianos",
    22: "Teclados",
    23: "Ukuleles",
    24: "Instrumentos Regionais",
    25: "Instrumentos Orquestrais",
    27: "Outros",
  };

  const idNum = Number(categoriaId);
  if (!Number.isNaN(idNum) && mapaId[idNum]) {
    return mapaId[idNum];
  }

  return categoriaCampo || "Categoria n/d";
};

const obterUsuarioId = () => {
  try {
    const salvo = localStorage.getItem("usuario");
    if (!salvo) return null;
    const parsed = JSON.parse(salvo);
    return (
      parsed.id ??
      parsed.usuarioId ??
      parsed.usuario_id_usuario ??
      parsed.idUsuario ??
      null
    );
  } catch (error) {
    console.warn("Nao foi possivel ler usuario logado", error);
    return null;
  }
};

export function DetalhesEquipamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { produtos, loading, fetchProdutos, atualizarProdutoLocal } = useProdutos();
  const [alugando, setAlugando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [aluguelId, setAluguelId] = useState<number | null>(null);
  const [statusLocal, setStatusLocal] = useState<number | null>(null);
  const [diasLocacao, setDiasLocacao] = useState<number>(3);
  const usuarioId = obterUsuarioId();
  const produtoId = Number(id);

  const equipamento = produtos.find((eq: any) => {
    const eqId = eq?.id ?? eq?.idProduto ?? eq?.produtoId ?? eq?.idproduto;
    return eqId === produtoId;
  });

  const donoId =
    (equipamento as any)?.usuarioId ??
    (equipamento as any)?.usuario_id_usuario ??
    (equipamento as any)?.usuarioIdUsuario ??
    (equipamento as any)?.idUsuario;
  const isDono = donoId != null && usuarioId != null && Number(donoId) === Number(usuarioId);

  useEffect(() => {
    if (equipamento) {
      const statusId =
        (equipamento as any).statusAluguelIdStatus ??
        (equipamento as any).status_aluguel_id_status ??
        null;
      setStatusLocal(
        Number.isFinite(Number(statusId)) ? Number(statusId) : null
      );
    }
  }, [equipamento]);

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Carregando equipamento...</h2>
        </div>
      </div>
    );
  }

  if (!equipamento) {
    return (
      <div className="page-container">
        <Navbar />
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Equipamento nao encontrado</h2>
          <button 
            onClick={() => navigate("/")}
            style={{
              marginTop: "1rem",
              padding: "10px 20px",
              backgroundColor: "#000",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  const handleAlugarAsync = async () => {
    if (!(equipamento as any).disponivel || alugando) return;
    if (statusLocal === 2 || statusLocal === 3) return;
    if (isDono) {
      setErro("Você não pode alugar o próprio item.");
      return;
    }
    setErro("");
    setMensagem("");
    setAlugando(true);
    try {
      // Verifica no backend se já existe aluguel/reserva para este produto
      const [pendentes, alugados] = await Promise.all([
        aluguelService.listarPorStatus(2),
        aluguelService.listarPorStatus(3),
      ]);
      const existePendente = pendentes.find((a: any) => {
        const prodId = a.produtoIdProduto ?? a.produto_id_produto ?? a.idProduto ?? a.produtoId;
        return Number(prodId) === produtoId;
      });
      const existeAlugado = alugados.find((a: any) => {
        const prodId = a.produtoIdProduto ?? a.produto_id_produto ?? a.idProduto ?? a.produtoId;
        return Number(prodId) === produtoId;
      });
      if (existePendente || existeAlugado) {
        const novoStatus = existeAlugado ? 3 : 2;
        setStatusLocal(novoStatus);
        atualizarProdutoLocal(produtoId, { disponivel: false, statusAluguelIdStatus: novoStatus });
        setMensagem(existeAlugado ? "Este item já está alugado." : "Este item já está reservado.");
        setAlugando(false);
        return;
      }

      const resposta: any = await aluguelService.alugarProduto(produtoId, {
        usuarioId,
        preco: (equipamento as any).preco,
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

      // Notifica o dono do item para confirmar
      if (donoId) {
        const titulo = "Confirme o aluguel do seu item";
        const conteudo = `O equipamento "${equipamento.nome}" foi reservado e aguarda sua confirmação.`;
        notificationService.add({
          title: titulo,
          content: conteudo,
          category: "Aluguel",
          recipientId: Number(donoId),
          aluguelId: novoAluguelId,
          produtoId: produtoId,
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

  const handleConfirmarAsync = async () => {
    if (!aluguelId) {
      setErro("Aluguel ainda nao foi criado/reservado.");
      return;
    }
    setErro("");
    setMensagem("");
    setConfirmando(true);
    try {
      await aluguelService.confirmarAluguel(aluguelId);
      setMensagem("Aluguel confirmado com sucesso!");
      setStatusLocal(3);
      atualizarProdutoLocal(produtoId, { disponivel: false, statusAluguelIdStatus: 3 });
      await fetchProdutos();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Nao foi possivel confirmar o aluguel.";
      setErro(msg);
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="detalhes-container">
        <div className="detalhes-imagem">
          <img 
            src={(equipamento as any).imagem}
            alt={equipamento.nome}
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/600x400?text=Sem+Imagem';
            }}
          />
          {!(equipamento as any).disponivel && (
            <div className="badge-indisponivel-detalhes">Indisponivel</div>
          )}
        </div>

      <div className="detalhes-info">
        <h1>{equipamento.nome}</h1>
        {isDono && (
          <div style={{ color: "#d32f2f", fontWeight: 600, marginBottom: "0.5rem" }}>
            Você é o dono deste item e não pode alugá-lo.
          </div>
        )}
          
          <div className="detalhes-avaliacao">
            <Star size={20} fill="currentColor" />
            <span>{(equipamento as any).avaliacao ?? 0}</span>
          </div>

          <div className="detalhes-preco">
            <strong>R$ {equipamento.preco}</strong>
            <span>/dia</span>
          </div>

          <div className="detalhes-local">
            <MapPin size={18} />
            <span>{equipamento.local}</span>
          </div>

          {(equipamento as any).descricao && (
            <div className="detalhes-descricao">
              <h3>Descricao</h3>
              <p>{(equipamento as any).descricao}</p>
            </div>
          )}

          {(equipamento as any).proprietario && (
            <div className="detalhes-proprietario">
              <User size={18} />
              <span>Proprietario: {(equipamento as any).proprietario}</span>
            </div>
          )}

          <div className="detalhes-categoria">
            <span>Categoria: <strong>{obterCategoriaLabel(equipamento)}</strong></span>
          </div>

          {!isDono && (
            <div style={{ margin: "0.75rem 0" }}>
              <label htmlFor="dias-select" style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                Período de locação
              </label>
              <select
                id="dias-select"
                value={diasLocacao}
                onChange={(e) => setDiasLocacao(Number(e.target.value))}
                style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ddd", width: "100%", maxWidth: "220px" }}
                disabled={alugando || statusLocal === 2 || statusLocal === 3}
              >
                <option value={1}>1 dia</option>
                <option value={3}>3 dias</option>
                <option value={7}>7 dias</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
              </select>
            </div>
          )}

          {erro && (
            <div style={{ color: "red", margin: "0.5rem 0" }}>
              {erro}
            </div>
          )}

          {mensagem && (
            <div style={{ color: "green", margin: "0.5rem 0" }}>
              {mensagem}
            </div>
          )}

          <button 
            className={`btn-alugar-detalhes ${
              !(equipamento as any).disponivel || statusLocal === 2 || statusLocal === 3
                ? 'btn-disabled'
                : ''
            }`}
            onClick={handleAlugarAsync}
            disabled={
              !(equipamento as any).disponivel ||
              alugando ||
              statusLocal === 2 ||
              statusLocal === 3 ||
              isDono
            }
          >
            {alugando
              ? "Alugando..."
              : statusLocal === 2
                ? "Confirmação pendente"
                : statusLocal === 3
                  ? "Indisponível"
                  : isDono
                    ? "Seu item"
                  : "Alugar Agora"}
          </button>

          {aluguelId && isDono && (
            <button 
              className="btn-alugar-detalhes"
              onClick={handleConfirmarAsync}
              disabled={confirmando}
            >
              {confirmando ? "Confirmando..." : "Confirmar Aluguel"}
            </button>
          )}

          <button 
            className="btn-voltar"
            onClick={() => navigate("/")}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
