// Modo Mock: true para usar dados mockados, false para usar API real
const USE_MOCK_DATA = true;

import { usuariosData } from '../mocks/usuariosData';

// Simulação de delay de rede
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Armazenamento em memória para simular persistência
let mockUsuarios = [...usuariosData];
let nextId = Math.max(...usuariosData.map(u => u.id)) + 1;

export const authService = {
  // Buscar todos os usuários
  async getUsuarios() {
    if (USE_MOCK_DATA) {
      await delay();
      // Retorna usuários sem senha por segurança
      return mockUsuarios.map(({ senha, ...usuario }) => usuario);
    }
    
    // Código original para API real (comentado)
    // try {
    //   const response = await fetch("http://localhost:8081/usuario");
    //   return await response.json();
    // } catch (error) {
    //   console.error('Erro ao buscar usuários:', error);
    //   throw error;
    // }
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
    
    // Código original para API real (comentado)
    // try {
    //   const response = await fetch(`http://localhost:8081/usuario/${id}`);
    //   return await response.json();
    // } catch (error) {
    //   console.error('Erro ao buscar usuário:', error);
    //   throw error;
    // }
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
    
    // Código original para API real (comentado)
    // try {
    //   const response = await fetch("http://localhost:8081/usuario");
    //   const usuarios = await response.json();
    //   const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    //   if (!usuario) throw new Error('Email ou senha incorretos');
    //   return usuario;
    // } catch (error) {
    //   console.error('Erro ao fazer login:', error);
    //   throw error;
    // }
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
    
    // Código original para API real (comentado)
    // try {
    //   const response = await fetch("http://localhost:8081/usuario", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(usuarioData)
    //   });
    //   if (!response.ok) throw new Error('Erro ao cadastrar usuário');
    //   return await response.json();
    // } catch (error) {
    //   console.error('Erro ao cadastrar usuário:', error);
    //   throw error;
    // }
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
    
    // Código original para API real (comentado)
    // try {
    //   const response = await fetch("http://localhost:8081/usuario");
    //   const usuarios = await response.json();
    //   const usuario = usuarios.find(u => u.cpf === cpf && u.email === email);
    //   if (!usuario) throw new Error('CPF ou email não encontrados');
    //   return true;
    // } catch (error) {
    //   console.error('Erro ao validar usuário:', error);
    //   throw error;
    // }
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
    
    // Código original para API real (comentado)
    // try {
    //   const response = await fetch("http://localhost:8081/usuario");
    //   const usuarios = await response.json();
    //   const usuario = usuarios.find(u => u.cpf === cpf && u.email === email);
    //   if (!usuario) throw new Error('Usuário não encontrado');
    //   
    //   const updateResponse = await fetch(`http://localhost:8081/usuario/${usuario.id}`, {
    //     method: "PUT",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ ...usuario, senha: novaSenha })
    //   });
    //   
    //   if (!updateResponse.ok) throw new Error('Erro ao atualizar senha');
    //   return await updateResponse.json();
    // } catch (error) {
    //   console.error('Erro ao atualizar senha:', error);
    //   throw error;
    // }
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
    
    // Código original para API real (comentado)
    // try {
    //   const response = await fetch(`http://localhost:8081/usuario/${id}`, {
    //     method: "PUT",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(usuarioData)
    //   });
    //   if (!response.ok) throw new Error('Erro ao atualizar usuário');
    //   return await response.json();
    // } catch (error) {
    //   console.error('Erro ao atualizar usuário:', error);
    //   throw error;
    // }
  }
};

