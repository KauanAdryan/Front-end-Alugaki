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
        ...produtoData,
        id: nextId++,
        disponivel: produtoData.disponivel !== undefined ? produtoData.disponivel : true,
        avaliacao: produtoData.avaliacao || 0
      };
      mockProdutos.push(novoProduto);
      return novoProduto;
    }
    
    try {
      const response = await httpClient.post(BFF_CONFIG.ENDPOINTS.PRODUTO, produtoData);
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
      const response = await httpClient.put(`${BFF_CONFIG.ENDPOINTS.PRODUTO}/${id}`, produtoData);
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