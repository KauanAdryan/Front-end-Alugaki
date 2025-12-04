import { useState, useEffect } from 'react';
import { produtoService } from '../services/api';
import { aluguelService } from '../services/rentalService';
import { authService } from '../services/authService';

const LOCAL_INDEFINIDO = "Local n/d";

// Garante que o front use sempre o mesmo formato de produto,
// independentemente de os dados virem do mock ou do BFF.
const normalizarProduto = (produto = {}) => {
  const id =
    produto.id ??
    produto.idProduto ??
    produto.produtoId ??
    produto.idproduto;

  const precoBruto =
    produto.preco ??
    produto.precoDiaria ??
    produto.preco_diaria ??
    produto.valor ??
    produto.valorDiaria ??
    produto.valor_diario;
  const precoNumerico =
    typeof precoBruto === 'string' ? parseFloat(precoBruto) : Number(precoBruto);

  const statusDisponivel =
    typeof produto.status === 'string'
      ? produto.status.toLowerCase() === 'disponivel'
      : undefined;

  const usuarioId =
    produto.usuarioId ??
    produto.usuario_id_usuario ??
    produto.usuarioIdUsuario ??
    produto.idUsuario ??
    produto.usuario_id ??
    produto.usuario?.id ??
    produto.usuario?.idUsuario;

  const statusAluguelIdStatus =
    produto.statusAluguelIdStatus ??
    produto.status_aluguel_id_status ??
    produto.status ??
    produto.statusId ??
    null;
  const statusAluguelIdStatusParsed = Number(statusAluguelIdStatus);

  const proprietario =
    produto.proprietario ??
    produto.usuarioNome ??
    produto.nomeUsuario ??
    produto.usuario?.nome;

  const cidadeDono = produto.usuario?.cidade ?? produto.usuarioCidade ?? produto.cidadeDono;
  const estadoDono = produto.usuario?.estado ?? produto.usuarioEstado ?? produto.estadoDono;
  const cidadeEstadoDono = cidadeDono ? `${cidadeDono}${estadoDono ? `/${estadoDono}` : ''}` : undefined;

  // Local exibido: tenta campos do produto; se faltar, usa cidade/estado do dono
  const localLegivel =
    produto.local ??
    produto.localizacao ??
    produto.localRetirada ??
    produto.endereco ??
    produto.cidade ??
    produto.cidadeLocal ??
    produto.estado ??
    produto.estadoLocal ??
    cidadeEstadoDono ??
    LOCAL_INDEFINIDO;

  const imagemPrincipal =
    produto.imagem ||
    produto.foto ||
    (Array.isArray(produto.imagens) ? produto.imagens[0] : undefined) ||
    'https://via.placeholder.com/320x220?text=Sem+Imagem';

  return {
    ...produto,
    id,
    nome: produto.nome ?? produto.titulo ?? produto.nomeProduto ?? 'Item sem nome',
    preco: Number.isFinite(precoNumerico) ? precoNumerico : 0,
    local: localLegivel,
    categoria:
      produto.categoria ??
      produto.categoriaNome ??
      produto.categoria_id_categoria ??
      produto.categoriaId ??
      produto.categoriaIdCategoria ??
      'Acessorios',
    imagem: imagemPrincipal,
    disponivel: produto.disponivel ?? produto.disponibilidade ?? statusDisponivel ?? true,
    avaliacao: produto.avaliacao ?? produto.rating ?? 0,
    descricao: produto.descricao ?? produto.detalhes ?? produto.info ?? produto.caracteristicas,
    proprietario,
    usuarioId,
    statusAluguelIdStatus: Number.isFinite(statusAluguelIdStatusParsed)
      ? statusAluguelIdStatusParsed
      : null,
  };
};

const normalizarListaProdutos = (lista) =>
  Array.isArray(lista) ? lista.map(normalizarProduto) : [];

const enriquecerComDadosDoUsuario = async (produtosNormalizados = []) => {
  const precisaBuscarUsuario = produtosNormalizados.some((produto) => {
    const localAtual = (produto.local ?? "").toString().trim().toLowerCase();
    const donoId =
      produto.usuarioId ??
      produto.usuario_id_usuario ??
      produto.usuarioIdUsuario ??
      produto.idUsuario;
    return (!localAtual || localAtual === LOCAL_INDEFINIDO.toLowerCase()) && donoId != null;
  });

  if (!precisaBuscarUsuario) return produtosNormalizados;

  try {
    const usuarios = await authService.getUsuarios();
    const mapaUsuarios = new Map();
    usuarios.forEach((usuario) => {
      const idUsuario =
        usuario?.id ??
        usuario?.idUsuario ??
        usuario?.usuarioId ??
        usuario?.usuario_id_usuario;
      if (idUsuario != null) {
        mapaUsuarios.set(Number(idUsuario), usuario);
      }
    });

    return produtosNormalizados.map((produto) => {
      const donoId =
        produto.usuarioId ??
        produto.usuario_id_usuario ??
        produto.usuarioIdUsuario ??
        produto.idUsuario;
      const usuario = Number.isFinite(Number(donoId))
        ? mapaUsuarios.get(Number(donoId))
        : undefined;
      if (!usuario) return produto;

      const localAtual = (produto.local ?? "").toString().trim();
      const semLocal =
        !localAtual || localAtual.toLowerCase() === LOCAL_INDEFINIDO.toLowerCase();
      const cidadeEstado = usuario.cidade
        ? `${usuario.cidade}${usuario.estado ? `/${usuario.estado}` : ""}`
        : undefined;

      if (!semLocal && produto.proprietario) {
        return produto;
      }

      return {
        ...produto,
        local: semLocal && cidadeEstado ? cidadeEstado : produto.local,
        proprietario: produto.proprietario ?? usuario.nome,
      };
    });
  } catch (error) {
    console.warn("Nao foi possivel enriquecer produtos com dados do usuario", error);
    return produtosNormalizados;
  }
};

const mapearStatusPorProduto = (alugueis = []) => {
  const mapa = new Map();
  alugueis.forEach((a) => {
    const prodId =
      a.produtoIdProduto ??
      a.produto_id_produto ??
      a.idProduto ??
      a.produtoId;
    const statusId =
      a.statusAluguelIdStatus ??
      a.status_aluguel_id_status ??
      a.statusId ??
      a.status;
    if (!Number.isFinite(Number(prodId)) || !Number.isFinite(Number(statusId))) {
      return;
    }
    const statusNum = Number(statusId);
    const existente = mapa.get(Number(prodId));
    if (existente === 3) return; // prioridade para alugado
    if (statusNum === 3 || statusNum === 2) {
      mapa.set(Number(prodId), statusNum);
    }
  });
  return mapa;
};

export function useProdutos(options = {}) {
  const { autoFetch = true } = options;
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  // Buscar produtos
  const fetchProdutos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await produtoService.getProdutos();
      let produtosNormalizados = normalizarListaProdutos(data);
      produtosNormalizados = await enriquecerComDadosDoUsuario(produtosNormalizados);

      // Enriquecer com status de aluguel vindos do BFF
      try {
        const [reservados, alugados] = await Promise.all([
          aluguelService.listarPorStatus(2),
          aluguelService.listarPorStatus(3),
        ]);
        const mapaStatus = mapearStatusPorProduto([
          ...(Array.isArray(reservados) ? reservados : []),
          ...(Array.isArray(alugados) ? alugados : []),
        ]);

        produtosNormalizados = produtosNormalizados.map((p) => {
          const statusMap = mapaStatus.get(Number(p.id));
          if (statusMap) {
            return {
              ...p,
              statusAluguelIdStatus: statusMap,
              disponivel: false,
            };
          }
          return p;
        });
      } catch (e) {
        console.warn('Nao foi possivel enriquecer status de aluguel', e);
      }

      setProdutos(produtosNormalizados);
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criar produto
  const criarProduto = async (produtoData) => {
    try {
      const novoProduto = await produtoService.createProduto(produtoData);
      const produtoNormalizado = normalizarProduto(novoProduto);
      setProdutos(prev => [...prev, produtoNormalizado]);
      return produtoNormalizado;
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      throw err;
    }
  };

  // Atualiza propriedades de um produto no estado local (para refletir aluguel, por exemplo)
  const atualizarProdutoLocal = (produtoId, dadosParciais = {}) => {
    setProdutos(prev => prev.map((item) => {
      if (!item) return item;
      const idItem = item.id ?? item.idProduto ?? item.produtoId ?? item.idproduto;
      if (Number(idItem) === Number(produtoId)) {
        return { ...item, ...dadosParciais };
      }
      return item;
    }));
  };

  // Efeito para carregar produtos ao montar o componente
  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);
      return undefined;
    }

    fetchProdutos();

    const handleRefresh = () => {
      fetchProdutos();
    };
    window.addEventListener('produtos:refresh', handleRefresh);
    return () => {
      window.removeEventListener('produtos:refresh', handleRefresh);
    };
  }, [autoFetch]);

  return {
    produtos,
    loading,
    error,
    fetchProdutos,
    criarProduto,
    atualizarProdutoLocal,
    // utilitarios para dash
    getResumoStatus: () => {
      const total = produtos.length;
      const alugados = produtos.filter((p) => Number(p.statusAluguelIdStatus) === 3).length;
      const reservados = produtos.filter((p) => Number(p.statusAluguelIdStatus) === 2).length;
      const disponiveis = produtos.filter((p) => !p.statusAluguelIdStatus && p.disponivel !== false).length;
      return { total, alugados, reservados, disponiveis };
    },
  };
}
