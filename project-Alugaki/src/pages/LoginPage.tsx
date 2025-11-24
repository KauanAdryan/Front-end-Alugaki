import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export function LoginPage() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: any) {
    e.preventDefault();
    setErro("");

    try {
      const usuarioEncontrado = await authService.login(email, senha);

      // salva usuario logado
      localStorage.setItem("usuario", JSON.stringify(usuarioEncontrado));

      navigate("/");

    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login");
    }
  }

  return (
    <>
      <div className="login-container2">
        <h1>AlugaKi</h1>
      </div>

      <div className="login-container">
        <div className="welcome">
          <h2>Bem-vindo de volta!</h2>
          <p>Faça login na sua conta</p>
        </div>

        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <input 
              type="email"
              id="email"
              className="input-field"
              placeholder="email@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="••••••••"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && <p style={{ color: "red" }}>{erro}</p>}

          <div className="divider"></div>

          <div className="forgot-password">
            <a href="esqueceu-senha">Esqueceu sua senha?</a>
          </div>

          <button type="submit" className="btn btn-primary">Entrar</button>

          <div className="register-link">
            <p>Não tem uma conta? <a href="cadastro">Cadastre-se</a></p>
          </div>
        </form>
      </div>
    </>
  );
}
