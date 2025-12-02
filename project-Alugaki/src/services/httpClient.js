import axios from 'axios';
import { BFF_CONFIG } from '../config/bff.config';

// Cria instância do axios configurada para o BFF
const httpClient = axios.create({
  baseURL: BFF_CONFIG.BASE_URL,
  timeout: BFF_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação (se necessário no futuro)
httpClient.interceptors.request.use(
  (config) => {
    // Aqui você pode adicionar token de autenticação se necessário
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento centralizado de erros
    if (error.response) {
      // Erro com resposta do servidor
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data?.message || 'Requisição inválida');
        case 401:
          throw new Error(data?.message || 'Não autorizado');
        case 403:
          throw new Error(data?.message || 'Acesso negado');
        case 404:
          throw new Error(data?.message || 'Recurso não encontrado');
        case 500:
          throw new Error(data?.message || 'Erro interno do servidor');
        default:
          throw new Error(data?.message || 'Erro ao processar requisição');
      }
    } else if (error.request) {
      // Erro de rede (sem resposta)
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outro tipo de erro
      throw new Error(error.message || 'Erro desconhecido');
    }
  }
);

export default httpClient;

