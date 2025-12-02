// Configuração do BFF
export const BFF_CONFIG = {
  // URL base do BFF (padrão: http://localhost:8081)
  BASE_URL: import.meta.env.VITE_BFF_BASE_URL || 'http://localhost:8081',
  
  // Endpoints do BFF
  ENDPOINTS: {
    // Usuario
    USUARIO: '/bff/usuario',
    USUARIO_LOGIN: '/bff/usuario/login',
    USUARIO_REDEFINIR_SENHA: '/bff/usuario/redefinir-senha',
    
    // Produto
    PRODUTO: '/bff/produto',
    
    // Periodo
    PERIODO: '/bff/periodo',
    
    // StatusAluguel
    STATUS_ALUGUEL: '/bff/statusaluguel',
    
    // Endereco
    ENDERECO: '/bff/enderecos',
    
    // Aluguel
    ALUGUEL: '/bff/aluguel',
  },
  
  // Timeout para requisições (em ms)
  TIMEOUT: 30000,
};

