# Integração com BFF - AlugaKi

Este documento descreve como o frontend está integrado com o BFF (Backend for Frontend).

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseado no `.env.example`):

```env
VITE_BFF_BASE_URL=http://localhost:8081
VITE_USE_MOCK_DATA=false
```

- `VITE_BFF_BASE_URL`: URL base do BFF (padrão: `http://localhost:8081`)
- `VITE_USE_MOCK_DATA`: Define se deve usar dados mockados (`true`) ou o BFF (`false`)

### Estrutura de Arquivos

```
src/
  config/
    bff.config.js          # Configuração do BFF
  services/
    httpClient.js          # Cliente HTTP centralizado (axios)
    authService.js         # Serviço de autenticação/usuários
    api.js                 # Serviço de produtos/equipamentos
```

## Endpoints Utilizados

### Autenticação/Usuários (`authService.js`)

- `GET /bff/usuario` - Buscar todos os usuários
- `GET /bff/usuario/{id}` - Buscar usuário por ID
- `POST /bff/usuario` - Cadastrar novo usuário
- `PUT /bff/usuario/{id}` - Atualizar usuário
- `POST /bff/usuario/login` - Fazer login
- `POST /bff/usuario/redefinir-senha` - Redefinir senha

### Produtos/Equipamentos (`api.js`)

- `GET /bff/produto` - Buscar todos os produtos
- `GET /bff/produto/{id}` - Buscar produto por ID
- `POST /bff/produto` - Criar novo produto
- `PUT /bff/produto/{id}` - Atualizar produto

## Como Usar

### Modo BFF (Produção)

1. Certifique-se de que o BFF está rodando na porta 8081 (ou configure a URL no `.env`)
2. Defina `VITE_USE_MOCK_DATA=false` no `.env` (ou não defina a variável)
3. Execute o frontend: `npm run dev`

### Modo Mock (Desenvolvimento)

1. Defina `VITE_USE_MOCK_DATA=true` no `.env`
2. Execute o frontend: `npm run dev`
3. Os dados serão carregados dos arquivos em `src/mocks/`

## Tratamento de Erros

O `httpClient.js` possui interceptors que tratam erros automaticamente:

- **400**: Requisição inválida
- **401**: Não autorizado
- **403**: Acesso negado
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor
- **Erro de rede**: Erro de conexão

Todos os erros são convertidos em mensagens amigáveis e lançados como exceções.

## Adicionando Novos Endpoints

Para adicionar novos endpoints:

1. Adicione o endpoint em `src/config/bff.config.js`:
```javascript
ENDPOINTS: {
  // ... outros endpoints
  NOVO_ENDPOINT: '/bff/novo-endpoint',
}
```

2. Use no serviço:
```javascript
import httpClient from './httpClient';
import { BFF_CONFIG } from '../config/bff.config';

async minhaFuncao() {
  const response = await httpClient.get(BFF_CONFIG.ENDPOINTS.NOVO_ENDPOINT);
  return response.data;
}
```

## Notas

- O BFF não possui endpoint DELETE para produtos (conforme README do BFF)
- Mensagens/Notificações ainda usam dados mockados (não há endpoint no BFF)
- O cliente HTTP está configurado para adicionar token de autenticação automaticamente (quando implementado)

