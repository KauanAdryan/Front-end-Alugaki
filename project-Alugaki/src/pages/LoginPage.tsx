export function LoginPage() {
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

        <form>
            <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" className="input-field" placeholder="email@email.com" required />
            </div>

            <div>
                <label htmlFor="password">Senha</label>
                <input type="password" id="password" className="input-field" placeholder="••••••••" required />
            </div>

            <div className="divider"></div>

            <div className="forgot-password">
                <a href="esqueceuSenha">Esqueceu sua senha?</a>
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