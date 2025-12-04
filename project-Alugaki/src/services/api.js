// Modo Mock: true para usar dados mockados, false para usar BFF
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

import { equipamentosData } from '../mocks/equipamentosData';
import httpClient from './httpClient';
import { BFF_CONFIG } from '../config/bff.config';

// Simulação de delay de rede
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Armazenamento em memória para simular persistência
let mockProdutos = [...equipamentosData];
let nextId = Math.max(...equipamentosData.map(p => p.id)) + 1;

// IDs padrão configuráveis via .env (caso o backend use outros valores)
const DEFAULT_CATEGORIA_ID = Number(import.meta.env.VITE_DEFAULT_CATEGORIA_ID) || 1;
const DEFAULT_CONDICAO_ID = Number(import.meta.env.VITE_DEFAULT_CONDICAO_ID) || 1;
const DEFAULT_PERIODO_ID = Number(import.meta.env.VITE_DEFAULT_PERIODO_ID) || 1;

// Garante campos exigidos pelo backend (foto e IDs de FK)
const montarPayloadProduto = (produtoData) => {
  const categoriaMap = {
    eletronico: 1,
    cordas: 2,
    cordasfriccionadas: 3,
    cordasfriccionada: 3,
    cordasdedilhadas: 4,
    cordaspercussao: 5,
    sopro: 6,
    madeiras: 7,
    metais: 8,
    percussao: 9,
    "percussão": 9,
    percussaodepele: 10,
    percussaopele: 10,
    percussaometalica: 11,
    percussaometálica: 11,
    teclas: 12,
    eletronicos: 13,
    eletrônicos: 13,
    sintetizadores: 14,
    acessorios: 15,
    acessórios: 15,
    audioprofissional: 16,
    "áudioprofissional": 16,
    bateria: 17,
    componentes: 17,
    violoes: 18,
    violões: 18,
    guitarras: 19,
    baixos: 20,
    pianos: 21,
    teclados: 22,
    ukuleles: 23,
    instrumentosregionais: 24,
    instrumentosorquestrais: 25,
    outros: 27,
  };

  const condicaoMap = {
    novo: 1,
    usado: 2,
    "semi-novo": 3,
    seminovo: 3,
    inativado: 4,
    inativo: 4,
    "inativado": 4,
  };

  const foto =
    produtoData.foto ||
    produtoData.imagem ||
    (Array.isArray(produtoData.imagens) ? produtoData.imagens[0] : undefined) ||
    'https://via.placeholder.com/600x400?text=Produto';

  // Categoria: tenta número, campos alternativos ou mapeamento por label
  const categoriaIdRaw = (
    produtoData.categoriaIdCategoria ||
    produtoData.categoriaId ||
    produtoData.categoria_id_categoria ||
    produtoData.categoria
  );
  const categoriaIdParsed = Number(categoriaIdRaw);
  const categoriaLabel = typeof categoriaIdRaw === 'string' ? categoriaIdRaw.toLowerCase().replace(/\s+/g, '') : undefined;
  const categoriaId =
    (!Number.isNaN(categoriaIdParsed) ? categoriaIdParsed : categoriaMap[categoriaLabel]) ||
    DEFAULT_CATEGORIA_ID;

  // Condição: número ou label
  const condicaoIdRaw = (
    produtoData.condicaoIdCondicao ||
    produtoData.condicaoId ||
    produtoData.condicao_id_condicao ||
    produtoData.condicao
  );
  const condicaoIdParsed = Number(condicaoIdRaw);
  const condicaoLabel = typeof condicaoIdRaw === 'string' ? condicaoIdRaw.toLowerCase().replace(/\s+/g, '') : undefined;
  const condicaoId =
    (!Number.isNaN(condicaoIdParsed) ? condicaoIdParsed : condicaoMap[condicaoLabel]) ||
    DEFAULT_CONDICAO_ID;

  // Período: número (mantém defaults se não vier)
  const periodoIdRaw = (
    produtoData.periodoIdPeriodo ||
    produtoData.periodoId ||
    produtoData.periodo_id_periodo ||
    produtoData.periodo
  );
  const periodoIdParsed = Number(periodoIdRaw);
  const periodoId = !Number.isNaN(periodoIdParsed) ? periodoIdParsed : DEFAULT_PERIODO_ID;

  // Usuário: pega do payload ou do localStorage; se não houver, cai em 1
  let usuarioId = (
    produtoData.usuarioIdUsuario ||
    produtoData.usuarioId ||
    produtoData.usuario_id_usuario
  );
  if (!usuarioId) {
    try {
      const storedSession = sessionStorage.getItem('usuario');
      const storedLocal = localStorage.getItem('usuario');
      const source = storedSession || storedLocal;
      if (source) {
        const parsed = JSON.parse(source);
        usuarioId = parsed.id || parsed.usuarioId || parsed.idUsuario || parsed.usuario_id_usuario;
      }
    } catch (e) {
      usuarioId = undefined;
    }
  }
  if (!usuarioId) usuarioId = 1;

  return {
    ...produtoData,
    foto,
    categoriaId,
    condicaoId,
    periodoId,
    usuarioId,
    categoria_id_categoria: categoriaId,
    categoriaIdCategoria: categoriaId,
    condicao_id_condicao: condicaoId,
    condicaoIdCondicao: condicaoId,
    periodo_id_periodo: periodoId,
    periodoIdPeriodo: periodoId,
    usuario_id_usuario: usuarioId,
    usuarioIdUsuario: usuarioId,
  };
};

export const produtoService = {
  // Buscar todos os produtos
  async getProdutos() {
    if (USE_MOCK_DATA) {
      await delay();
      return [...mockProdutos];
    }
    
    try {
      const response = await httpClient.get(BFF_CONFIG.ENDPOINTS.PRODUTO);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  // Buscar produto por ID
  async getProdutoById(id) {
    if (USE_MOCK_DATA) {
      await delay();
      const produto = mockProdutos.find(p => p.id === parseInt(id));
      if (!produto) {
        throw new Error('Produto não encontrado');
      }
      return produto;
    }
    
    try {
      const response = await httpClient.get(`${BFF_CONFIG.ENDPOINTS.PRODUTO}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  // Criar novo produto
  async createProduto(produtoData) {
    if (USE_MOCK_DATA) {
      await delay();
      const novoProduto = {
        ...montarPayloadProduto(produtoData),
        id: nextId++,
        disponivel: produtoData.disponivel !== undefined ? produtoData.disponivel : true,
        avaliacao: produtoData.avaliacao || 0
      };
      mockProdutos.push(novoProduto);
      return novoProduto;
    }
    
    try {
      const payload = montarPayloadProduto(produtoData);
      const response = await httpClient.post(BFF_CONFIG.ENDPOINTS.PRODUTO, payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  // Atualizar produto
  async updateProduto(id, produtoData) {
    if (USE_MOCK_DATA) {
      await delay();
      const index = mockProdutos.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        throw new Error('Produto não encontrado');
      }
      mockProdutos[index] = { ...mockProdutos[index], ...produtoData, id: parseInt(id) };
      return mockProdutos[index];
    }
    
    try {
      const payload = montarPayloadProduto(produtoData);
      const response = await httpClient.put(`${BFF_CONFIG.ENDPOINTS.PRODUTO}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Deletar produto
  // Nota: O BFF não tem endpoint DELETE para produto, mas mantemos a função caso seja adicionado
  async deleteProduto(id) {
    if (USE_MOCK_DATA) {
      await delay();
      const index = mockProdutos.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        throw new Error('Produto não encontrado');
      }
      const produtoRemovido = mockProdutos[index];
      mockProdutos = mockProdutos.filter(p => p.id !== parseInt(id));
      return produtoRemovido;
    }
    
    // Nota: O BFF não tem endpoint DELETE para produto no README
    // Se for necessário, adicione o endpoint no BFF e descomente o código abaixo
    // try {
    //   const response = await httpClient.delete(`${BFF_CONFIG.ENDPOINTS.PRODUTO}/${id}`);
    //   return response.data;
    // } catch (error) {
    //   console.error('Erro ao deletar produto:', error);
    //   throw error;
    // }
    
    throw new Error('Endpoint DELETE não disponível no BFF');
  }
};
