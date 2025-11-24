// Modo Mock: true para usar dados mockados, false para usar API real
const USE_MOCK_DATA = true;

import { equipamentosData } from '../mocks/equipamentosData';

// Simulação de delay de rede
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Armazenamento em memória para simular persistência
let mockProdutos = [...equipamentosData];
let nextId = Math.max(...equipamentosData.map(p => p.id)) + 1;

export const produtoService = {
  // Buscar todos os produtos
  async getProdutos() {
    if (USE_MOCK_DATA) {
      await delay();
      return [...mockProdutos];
    }
    
    // Código original para API real (comentado)
    // try {
    //   const response = await api.get('/produtos');
    //   return response.data;
    // } catch (error) {
    //   console.error('Erro ao buscar produtos:', error);
    //   throw error;
    // }
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
    
    // Código original para API real (comentado)
    // try {
    //   const response = await api.get(`/produtos/${id}`);
    //   return response.data;
    // } catch (error) {
    //   console.error('Erro ao buscar produto:', error);
    //   throw error;
    // }
  },

  // Criar novo produto
  async createProduto(produtoData) {
    if (USE_MOCK_DATA) {
      await delay();
      const novoProduto = {
        ...produtoData,
        id: nextId++,
        disponivel: produtoData.disponivel !== undefined ? produtoData.disponivel : true,
        avaliacao: produtoData.avaliacao || 0
      };
      mockProdutos.push(novoProduto);
      return novoProduto;
    }
    
    // Código original para API real (comentado)
    // try {
    //   const response = await api.post('/produtos', produtoData);
    //   return response.data;
    // } catch (error) {
    //   console.error('Erro ao criar produto:', error);
    //   throw error;
    // }
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
    
    // Código original para API real (comentado)
    // try {
    //   const response = await api.put(`/produtos/${id}`, produtoData);
    //   return response.data;
    // } catch (error) {
    //   console.error('Erro ao atualizar produto:', error);
    //   throw error;
    // }
  },

  // Deletar produto
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
    
    // Código original para API real (comentado)
    // try {
    //   const response = await api.delete(`/produtos/${id}`);
    //   return response.data;
    // } catch (error) {
    //   console.error('Erro ao deletar produto:', error);
    //   throw error;
    // }
  }
};

// Para usar API real, descomente o código abaixo e defina USE_MOCK_DATA = false
// import axios from 'axios';
// const API_BASE_URL = 'http://localhost:8081';
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
// export default api;