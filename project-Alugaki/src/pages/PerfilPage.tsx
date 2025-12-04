import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { authService } from "../services/authService";
import { getUsuarioSalvo, salvarUsuario } from "../utils/userStorage";

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
  const [fotoNome, setFotoNome] = useState<string>("");
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    const usuarioLocal = getUsuarioSalvo();
    if (!usuarioLocal) {
      navigate('/');
      return;
    }

    const preencher = (u: any) => {
      setUsuario(u);
      const fotoAtual = u.foto || u.avatar || "";
      if (fotoAtual) {
        setFotoPreview(
          fotoAtual.startsWith("http") || fotoAtual.startsWith("data:")
            ? fotoAtual
            : `data:image/jpeg;base64,${fotoAtual}`
        );
        setFotoNome("");
      } else {
        setFotoPreview("");
        setFotoNome("");
      }

      const endereco: any = u.endereco || {};
      const rua = u.rua || endereco.rua || endereco.logradouro || endereco.endereco || u.enderecoTexto || "";
      const numero =
        u.numero ||
        endereco.numero ||
        endereco.numeroResidencia ||
        endereco.numero_residencia ||
        endereco.numeroResidenc ||
        "";
      const bairro = u.bairro || endereco.bairro || "";
      const cidade = u.cidade || endereco.cidade || "";
      const estado = u.estado || endereco.estado || "";
      const cep = u.cep || endereco.cep || "";

      setFormData({
        nome: u.nome || '',
        email: u.email || '',
        telefone: u.telefone || '',
        cpf: u.cpf || u.cpfCnpj || '',
        rua,
        numero,
        cidade,
        estado,
        cep,
        bairro,
        senha: '',
        confirmarSenha: ''
      });
    };

    preencher(usuarioLocal);

    const idUsuario =
      usuarioLocal.id ?? usuarioLocal.idUsuario ?? usuarioLocal.usuarioId ?? usuarioLocal.usuario_id_usuario;
    if (idUsuario) {
      authService.getUsuarioById(idUsuario)
        .then((u) => {
          if (u) {
            salvarUsuario(u);
            preencher(u);
          }
        })
        .catch(() => {
          /* se falhar, fica com dados locais */
        });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const avatarSrc = (() => {
    const foto = fotoPreview || usuario?.foto || usuario?.avatar;
    if (!foto) return "";
    if (typeof foto === "string" && (foto.startsWith("http") || foto.startsWith("data:"))) {
      return foto;
    }
    return `data:image/jpeg;base64,${foto}`;
  })();

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFotoNome("");
      setFotoPreview(usuario?.foto || usuario?.avatar || "");
      return;
    }
    setFotoNome(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setFotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    // Senha obrigatória para evitar null no backend
    if (!formData.senha) {
      setErro("Informe sua senha para salvar as alterações.");
      return;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem!");
      return;
    }
    if (formData.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    try {
      const userId =
        usuario?.id ??
        usuario?.idUsuario ??
        usuario?.usuarioId ??
        usuario?.usuario_id_usuario;

      if (!Number.isFinite(Number(userId))) {
        setErro("Nao foi possivel identificar o usuario para atualizar.");
        return;
      }

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
        bairro: formData.bairro.trim(),
        foto: fotoPreview || usuario?.foto || usuario?.avatar || ""
      };

      // Adicionar senha apenas se foi preenchida
      dadosAtualizacao.senha = formData.senha;

      const usuarioAtualizado = await authService.atualizarUsuario(Number(userId), dadosAtualizacao);
      
      // Atualizar localStorage
      salvarUsuario(usuarioAtualizado);
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
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={usuario.nome}
                onError={() => setFotoPreview("")}
              />
            ) : (
              <div className="avatar-placeholder">
                {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "👤"}
              </div>
            )}
          </div>
          <div className="perfil-user-info">
            <h1>{usuario.nome}</h1>
            <p>{usuario.email}</p>
            <div className="perfil-avatar-actions">
              <label className="perfil-avatar-edit">
                Alterar foto
                <input type="file" accept="image/*" onChange={handleFotoChange} />
              </label>
              {fotoNome && <small className="perfil-avatar-name">{fotoNome}</small>}
            </div>
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
                <label htmlFor="password">Senha (obrigatória para salvar)</label>
                <input 
                  type="password" 
                  id="password" 
                  name="senha"
                  className="input-field" 
                  placeholder="Digite sua senha" 
                  value={formData.senha}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password">Confirmar senha</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  name="confirmarSenha"
                  className="input-field" 
                  placeholder="Confirme sua senha" 
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
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

