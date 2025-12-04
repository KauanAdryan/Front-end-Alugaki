import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { authService } from "../services/authService";

export function PerfilPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    rua: "",
    numero: "",
    cidade: "",
    estado: "",
    cep: "",
    bairro: "",
    senha: "",
    confirmarSenha: ""
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    const usuarioLogado = localStorage.getItem("usuario");
    if (usuarioLogado) {
      try {
        const usuarioData = JSON.parse(usuarioLogado);
        setUsuario(usuarioData);
        setFormData({
          nome: usuarioData.nome || "",
          email: usuarioData.email || "",
          telefone: usuarioData.telefone || "",
          cpf: usuarioData.cpf || usuarioData.cpfCnpj || "",
          rua: usuarioData.rua || "",
          numero: usuarioData.numero || "",
          cidade: usuarioData.cidade || "",
          estado: usuarioData.estado || "",
          cep: usuarioData.cep || "",
          bairro: usuarioData.bairro || "",
          senha: "",
          confirmarSenha: ""
        });
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    // Validar senhas se foram preenchidas
    if (formData.senha || formData.confirmarSenha) {
      if (formData.senha !== formData.confirmarSenha) {
        setErro("As senhas não coincidem!");
        return;
      }
      if (formData.senha.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres!");
        return;
      }
    }

    try {
      const dadosAtualizacao: any = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim(),
        cpf: formData.cpf.trim(),
        cpfCnpj: formData.cpf.trim(),
        rua: formData.rua.trim(),
        numero: formData.numero.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim().toUpperCase(),
        cep: formData.cep.trim(),
        bairro: formData.bairro.trim()
      };

      // Adicionar senha apenas se foi preenchida
      if (formData.senha) {
        dadosAtualizacao.senha = formData.senha;
      }

      const usuarioAtualizado = await authService.atualizarUsuario(usuario.id, dadosAtualizacao);
      
      // Atualizar localStorage
      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
      setUsuario(usuarioAtualizado);
      
      setSucesso("Perfil atualizado com sucesso!");
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        senha: "",
        confirmarSenha: ""
      }));

      setTimeout(() => {
        setSucesso("");
      }, 3000);
    } catch (error: any) {
      setErro(error.message || "Erro ao atualizar perfil");
    }
  };

  const handleCancelar = () => {
    navigate("/");
  };

  if (!usuario) {
    return (
      <div className="perfil-page-container">
        <Navbar />
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-page-container">
      <Navbar />
      <main className="perfil-main">
        {/* Profile Header */}
        <div className="perfil-header-section">
          <div className="perfil-avatar-large">
            {usuario.avatar || (usuario as any).foto ? (
              <img src={usuario.avatar || (usuario as any).foto} alt={usuario.nome} />
            ) : (
              <div className="avatar-placeholder">
                {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "👤"}
              </div>
            )}
          </div>
          <div className="perfil-user-info">
            <h1>{usuario.nome}</h1>
            <p>{usuario.email}</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="perfil-form-container">
          <h2>Informações Pessoais</h2>
          
          {erro && <div className="mensagem-erro">{erro}</div>}
          {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}
          
          <form className="perfil-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nome completo</label>
                <input 
                  type="text" 
                  id="name" 
                  name="nome"
                  className="input-field" 
                  placeholder="Seu nome completo" 
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cpf-cnpj">CPF ou CNPJ</label>
                <input 
                  type="text" 
                  id="cpf-cnpj" 
                  name="cpf"
                  className="input-field" 
                  placeholder="000.000.000-00" 
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className="input-field" 
                  placeholder="seu@email.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Telefone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="telefone"
                  className="input-field" 
                  placeholder="(11) 99999-9999" 
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="address">Rua</label>
              <input 
                type="text" 
                id="address" 
                name="rua"
                className="input-field" 
                placeholder="Nome da rua" 
                value={formData.rua}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numero">Número</label>
                <input 
                  type="text" 
                  id="numero" 
                  name="numero"
                  className="input-field" 
                  placeholder="Número" 
                  value={formData.numero}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="neighborhood">Bairro</label>
                <input 
                  type="text" 
                  id="neighborhood" 
                  name="bairro"
                  className="input-field" 
                  placeholder="Seu bairro" 
                  value={formData.bairro}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Cidade</label>
                <input 
                  type="text" 
                  id="city" 
                  name="cidade"
                  className="input-field" 
                  placeholder="Sua cidade" 
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">Estado</label>
                <input 
                  type="text" 
                  id="state" 
                  name="estado"
                  className="input-field" 
                  placeholder="UF (ex: SP)" 
                  value={formData.estado}
                  onChange={handleChange}
                  maxLength={2}
                  required
                />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="cep">CEP</label>
              <input 
                type="text" 
                id="cep" 
                name="cep"
                className="input-field" 
                placeholder="00000-000" 
                value={formData.cep}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-divider"></div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Nova senha (opcional)</label>
                <input 
                  type="password" 
                  id="password" 
                  name="senha"
                  className="input-field" 
                  placeholder="••••••••" 
                  value={formData.senha}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password">Confirmar nova senha</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  name="confirmarSenha"
                  className="input-field" 
                  placeholder="••••••••" 
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-save">Salvar alterações</button>
              <button type="button" className="btn btn-cancel" onClick={handleCancelar}>Cancelar</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

