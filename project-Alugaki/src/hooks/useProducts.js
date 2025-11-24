import { useState, useEffect } from 'react';
import { produtoService } from '../services/api';

export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar produtos
  const fetchProdutos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await produtoService.getProdutos();
      setProdutos(data);
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
      setProdutos(prev => [...prev, novoProduto]);
      return novoProduto;
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      throw err;
    }
  };

  // Efeito para carregar produtos ao montar o componente
  useEffect(() => {
    fetchProdutos();
  }, []);

  return {
    produtos,
    loading,
    error,
    fetchProdutos,
    criarProduto
  };
}