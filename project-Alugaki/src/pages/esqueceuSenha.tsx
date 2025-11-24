import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export function EsqueceuSenha() {
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [etapa, setEtapa] = useState(1); // 1: validação, 2: nova senha
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função de máscara para CPF
  function mascaraCPF(valor: string): string {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 11) {
      // CPF: 000.000.000-00
      return apenasNumeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return valor;
  }

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const valorFormatado = mascaraCPF(e.target.value);
    setCpf(valorFormatado);
  }

  async function handleValidarUsuario(e: any) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      // Remove máscara do CPF antes de validar
      const cpfLimpo = cpf.replace(/\D/g, '');
      await authService.validarUsuario(cpfLimpo, email);

      // Avança para a etapa de nova senha
      setEtapa(2);
      setSucesso("Usuário validado com sucesso! Agora defina sua nova senha.");

    } catch (err: any) {
      setErro(err.message || "Erro ao validar usuário. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRedefinirSenha(e: any) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    // Validações
    if (novaSenha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem. Digite a mesma senha nos dois campos.");
      setLoading(false);
      return;
    }

    try {
      // Remove máscara do CPF antes de atualizar
      const cpfLimpo = cpf.replace(/\D/g, '');
      await authService.atualizarSenha(cpfLimpo, email, novaSenha);

      setSucesso("Senha redefinida com sucesso! Redirecionando para login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err: any) {
      setErro(err.message || "Erro ao redefinir senha. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  function handleVoltar() {
    if (etapa === 2) {
      setEtapa(1);
      setNovaSenha("");
      setConfirmarSenha("");
      setErro("");
      setSucesso("");
    } else {
      navigate("/login");
    }
  }

  // Função para calcular força da senha
  function getSenhaStrength(senha: string) {
    if (senha.length === 0) return "";
    if (senha.length < 6) return "fraca";
    if (senha.length < 8) return "media";
    return "forte";
  }

  const forcaSenha = getSenhaStrength(novaSenha);

  return (
    <div className="recuperacao-page">
      <div className="logo-container-recuperacao">
        <h1>AlugaKi</h1>
      </div>

      <div className="recuperacao-container">
        <div className="recuperacao-header">
          <h2>Recuperar Senha</h2>
          <p>
            {etapa === 1 
              ? "Informe seu CPF e email para verificar sua identidade" 
              : "Defina sua nova senha"}
          </p>
        </div>

        {/* Indicador de etapas */}
        <div className="etapa-indicator">
          <div className="etapa-step">
            <div className={`etapa-circle ${etapa >= 1 ? 'active' : ''} ${etapa > 1 ? 'completed' : ''}`}>
              1
            </div>
            <div className={`etapa-label ${etapa >= 1 ? 'active' : ''}`}>
              Verificação
            </div>
          </div>
          <div className={`etapa-connector ${etapa >= 2 ? 'active' : ''}`}></div>
          <div className="etapa-step">
            <div className={`etapa-circle ${etapa >= 2 ? 'active' : ''}`}>
              2
            </div>
            <div className={`etapa-label ${etapa >= 2 ? 'active' : ''}`}>
              Nova Senha
            </div>
          </div>
        </div>

        {etapa === 1 ? (
          <form onSubmit={handleValidarUsuario}>
            <div className="form-group-recuperacao">
              <label htmlFor="cpf">CPF</label>
              <input 
                type="text"
                id="cpf"
                className="input-field-recuperacao"
                placeholder="000.000.000-00"
                maxLength={14}
                required
                value={cpf}
                onChange={handleCpfChange}
              />
            </div>

            <div className="form-group-recuperacao">
              <label htmlFor="email">Email</label>
              <input 
                type="email"
                id="email"
                className="input-field-recuperacao"
                placeholder="email@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {erro && <div className="mensagem-erro">{erro}</div>}
            {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

            <div className="divider-recuperacao"></div>

            <button 
              type="submit" 
              className="btn-recuperacao btn-primary-recuperacao"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Verificar Usuário"}
            </button>
            
          </form>
        ) : (
          <form onSubmit={handleRedefinirSenha}>
            <div className="form-group-recuperacao">
              <label htmlFor="novaSenha">
                Nova Senha
                {novaSenha && (
                  <span className={`senha-strength ${forcaSenha}`}>
                    {forcaSenha === "fraca" && " - Senha fraca"}
                    {forcaSenha === "media" && " - Senha média"}
                    {forcaSenha === "forte" && " - Senha forte"}
                  </span>
                )}
              </label>
              <input
                type="password"
                id="novaSenha"
                className="input-field-recuperacao"
                placeholder="Mínimo 6 caracteres"
                required
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                minLength={6}
              />
            </div>

            <div className="form-group-recuperacao">
              <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmarSenha"
                className="input-field-recuperacao"
                placeholder="Digite a senha novamente"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
              />
            </div>

            {erro && <div className="mensagem-erro">{erro}</div>}
            {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

            <div className="divider-recuperacao"></div>

            <button 
              type="submit" 
              className="btn-recuperacao btn-primary-recuperacao"
              disabled={loading}
            >
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </button>

            <button 
              type="button" 
              className="btn-recuperacao btn-secondary-recuperacao"
              onClick={handleVoltar}
              disabled={loading}
            >
              Voltar
            </button>
          </form>
        )}

        <div className="back-to-login">
          <a href="/login">← Voltar para o login</a>
        </div>
      </div>
    </div>
  );
}