// Modo Mock: true para usar dados mockados, false para usar BFF
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

import { usuariosData } from '../mocks/usuariosData';
import httpClient from './httpClient';
import { BFF_CONFIG } from '../config/bff.config';

// Simulação de delay de rede
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Armazenamento em memória para simular persistência
let mockUsuarios = [...usuariosData];
let nextId = Math.max(...usuariosData.map(u => u.id)) + 1;

// Payload flat com todos os campos de endereço e contato em nível de raiz.
const montarPayloadUsuario = (dados) => {
  const numeroResidencia = dados.numero || dados.numeroResidencia || dados.numeroResidenc || '';
  const enderecoTexto = [
    dados.rua,
    numeroResidencia ? `, ${numeroResidencia}` : '',
    dados.bairro ? ` - ${dados.bairro}` : '',
    dados.cidade ? `, ${dados.cidade}` : '',
    dados.estado ? `/${dados.estado}` : '',
    dados.cep ? ` - CEP: ${dados.cep}` : '',
  ].join('').trim();

  const payload = {
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    cpfCnpj: dados.cpfCnpj || dados.cpf,
    foto: dados.foto || dados.avatar,
    contato: dados.telefone || dados.email,
    endereco: enderecoTexto || dados.cep || dados.cidade || dados.estado || 'endereco n/d',
    rua: dados.rua,
    numero: numeroResidencia,
    numero_residenc: numeroResidencia,
    numeroResidencia,
    numeroResidenc: numeroResidencia,
    numeroResidencial: numeroResidencia,
    bairro: dados.bairro,
    cidade: dados.cidade,
    estado: dados.estado,
    cep: dados.cep,
    logradouro: dados.rua,
  };

  if (dados.senha) {
    payload.senha = dados.senha;
  }

  return payload;
};

// Normaliza resposta do backend para manter compatibilidade com o front (campos planos)
const normalizarUsuario = (usuario) => {
  if (!usuario) return usuario;

  const contatoObj = typeof usuario.contato === 'object' ? usuario.contato : {};
  const contatoStr = typeof usuario.contato === 'string' ? usuario.contato : undefined;
  const enderecoObj = typeof usuario.endereco === 'object' ? usuario.endereco : {};
  const enderecoStr = typeof usuario.endereco === 'string' ? usuario.endereco : undefined;

  const numero =
    usuario.numero ||
    usuario.numeroResidencia ||
    usuario.numero_residenc ||
    usuario.numeroResidenc ||
    enderecoObj.numero ||
    enderecoObj.numeroResidencia ||
    enderecoObj.numero_residenc ||
    enderecoObj.numeroResidenc;

  return {
    ...usuario,
    email: usuario.email || contatoObj.email,
    telefone: usuario.telefone || contatoObj.telefone || contatoStr,
    cpf: usuario.cpf || usuario.cpfCnpj,
    cpfCnpj: usuario.cpfCnpj || usuario.cpf,
    foto: usuario.foto || usuario.avatar,
    avatar: usuario.avatar || usuario.foto,
    rua: usuario.rua || enderecoObj.rua,
    numero,
    bairro: usuario.bairro || enderecoObj.bairro,
    cidade: usuario.cidade || enderecoObj.cidade,
    estado: usuario.estado || enderecoObj.estado,
    cep: usuario.cep || enderecoObj.cep,
    enderecoTexto: enderecoStr,
  };
};

export const authService = {
  // Buscar todos os usuários
  async getUsuarios() {
    if (USE_MOCK_DATA) {
      await delay();
      // Retorna usuários sem senha por segurança
      return mockUsuarios.map(({ senha, ...usuario }) => usuario);
    }
    
    try {
      const response = await httpClient.get(BFF_CONFIG.ENDPOINTS.USUARIO);
      return Array.isArray(response.data)
        ? response.data.map(normalizarUsuario)
        : [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  // Buscar usuário por ID
  async getUsuarioById(id) {
    if (USE_MOCK_DATA) {
      await delay();
      const usuario = mockUsuarios.find(u => u.id === parseInt(id));
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      // Retorna sem senha
      const { senha, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    }
    
    try {
      const response = await httpClient.get(`${BFF_CONFIG.ENDPOINTS.USUARIO}/${id}`);
      return normalizarUsuario(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  // Login - validar email e senha
  async login(email, senha) {
    if (USE_MOCK_DATA) {
      await delay();
      const usuario = mockUsuarios.find(
        u => u.email === email && u.senha === senha
      );
      
      if (!usuario) {
        throw new Error('Email ou senha incorretos');
      }
      
      // Retorna usuário sem senha
      const { senha: _, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    }
    
    try {
      const response = await httpClient.post(BFF_CONFIG.ENDPOINTS.USUARIO_LOGIN, {
        email,
        senha
      });
      return normalizarUsuario(response.data);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  // Cadastrar novo usuário
  async cadastrar(usuarioData) {
    if (USE_MOCK_DATA) {
      await delay();
      
      // Verifica se email já existe
      const emailExiste = mockUsuarios.some(u => u.email === usuarioData.email);
      if (emailExiste) {
        throw new Error('Email já cadastrado');
      }
      
      // Verifica se CPF já existe
      const cpfExiste = mockUsuarios.some(
        u => u.cpf === usuarioData.cpfCnpj || u.cpfCnpj === usuarioData.cpfCnpj
      );
      if (cpfExiste) {
        throw new Error('CPF/CNPJ já cadastrado');
      }
      
      const novoUsuario = {
        ...usuarioData,
        id: nextId++,
        senha: usuarioData.senha,
        cpf: usuarioData.cpfCnpj,
        avaliacao: 0,
        totalAlugueis: 0,
        membroDesde: new Date(),
        avatar: null
      };
      
      mockUsuarios.push(novoUsuario);
      
      // Retorna sem senha
      const { senha: _, ...usuarioSemSenha } = novoUsuario;
      return usuarioSemSenha;
    }
    try {
      const payload = montarPayloadUsuario(usuarioData);
      console.debug('cadastro payload', payload);
      const response = await httpClient.post(BFF_CONFIG.ENDPOINTS.USUARIO, payload);
      return normalizarUsuario(response.data);
    } catch (error) {
      console.error('Erro ao cadastrar usuario:', error);
      const msg =
        (error?.response?.data && (error.response.data.message || error.response.data.error)) ||
        error?.message;
      const lower = (msg || '').toLowerCase();
      if (lower.includes('cpf') && lower.includes('duplicate')) {
        throw new Error('CPF/CNPJ ja cadastrado. Use outro documento ou faca login.');
      }
      throw new Error(msg || 'Erro ao cadastrar usuario.');
    }
  },

  // Validar usuário por CPF e email (para recuperação de senha)
  async validarUsuario(cpf, email) {
    if (USE_MOCK_DATA) {
      await delay();
      const usuario = mockUsuarios.find(
        u => (u.cpf === cpf || u.cpfCnpj === cpf) && u.email === email
      );
      
      if (!usuario) {
        throw new Error('CPF ou email não encontrados');
      }
      
      return true;
    }
    
    try {
      // Busca todos os usuários e valida localmente
      // Ou pode criar um endpoint específico no BFF para validação
      const response = await httpClient.get(BFF_CONFIG.ENDPOINTS.USUARIO);
      const usuarios = Array.isArray(response.data)
        ? response.data.map(normalizarUsuario)
        : [];
      const usuario = usuarios.find(
        u => (u.cpf === cpf || u.cpfCnpj === cpf) && u.email === email
      );
      
      if (!usuario) {
        throw new Error('CPF ou email não encontrados');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao validar usuário:', error);
      throw error;
    }
  },

  // Atualizar senha do usuário
  async atualizarSenha(cpf, email, novaSenha) {
    if (USE_MOCK_DATA) {
      await delay();
      const index = mockUsuarios.findIndex(
        u => (u.cpf === cpf || u.cpfCnpj === cpf) && u.email === email
      );
      
      if (index === -1) {
        throw new Error('Usuário não encontrado');
      }
      
      mockUsuarios[index] = {
        ...mockUsuarios[index],
        senha: novaSenha
      };
      
      return { sucesso: true };
    }
    
    try {
      const response = await httpClient.post(BFF_CONFIG.ENDPOINTS.USUARIO_REDEFINIR_SENHA, {
        email,
        cpfCnpj: cpf,
        senhaNova: novaSenha
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      const msg = error?.response?.data?.message || error?.message;
      if (msg?.toLowerCase().includes('email') || msg?.toLowerCase().includes('cpf')) {
        throw new Error('Email ou CPF/CNPJ não encontrados ou não correspondem ao mesmo usuário.');
      }
      throw new Error(msg || 'Não foi possível redefinir a senha.');
    }
  },

  // Atualizar usuário
  async atualizarUsuario(id, usuarioData) {
    if (USE_MOCK_DATA) {
      await delay();
      const index = mockUsuarios.findIndex(u => u.id === parseInt(id));
      if (index === -1) {
        throw new Error('Usuário não encontrado');
      }
      
      mockUsuarios[index] = {
        ...mockUsuarios[index],
        ...usuarioData,
        id: parseInt(id)
      };
      
      // Retorna sem senha
      const { senha: _, ...usuarioSemSenha } = mockUsuarios[index];
      return usuarioSemSenha;
    }
    
    try {
      const payload = montarPayloadUsuario(usuarioData);
      console.debug('atualizar usuario payload', payload);
      const response = await httpClient.put(`${BFF_CONFIG.ENDPOINTS.USUARIO}/${id}`, payload);
      return normalizarUsuario(response.data);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }
};
