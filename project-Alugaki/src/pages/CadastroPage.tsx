export function CadastroPage() {
    return(
        <>
        <div className="logo-container">
            <h1>AlugAki</h1>
        </div>
        
        <div className="signup-container">
            <div className="welcome">
                <h2>Criar nova conta</h2>
                <p>Preencha os dados abaixo para se cadastrar</p>
            </div>
            
            <form>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Nome completo</label>
                        <input type="text" id="name" className="input-field" placeholder="Seu nome completo" required />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" className="input-field" placeholder="seu@email.com" required />
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="cpf-cnpj">CPF ou CNPJ</label>
                        <input type="text" id="cpf-cnpj" className="input-field" placeholder="000.000.000-00" required />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="phone">Telefone</label>
                        <input type="tel" id="phone" className="input-field" placeholder="(11) 99999-9999" required />
                    </div>
                </div>
                
                <div className="form-group full-width">
                    <label htmlFor="address">Endereço completo</label>
                    <input type="text" id="address" className="input-field" placeholder="Rua, número, complemento" required />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="city">Cidade</label>
                        <input type="text" id="city" className="input-field" placeholder="Sua cidade" required />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="state">Estado</label>
                        <input type="text" id="state" className="input-field" placeholder="UF (ex: SP)" required />
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="cep">CEP</label>
                        <input type="text" id="cep" className="input-field" placeholder="00000-000" required />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="neighborhood">Bairro</label>
                        <input type="text" id="neighborhood" className="input-field" placeholder="Seu bairro" required />
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input type="password" id="password" className="input-field" placeholder="••••••••" required />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirmar senha</label>
                        <input type="password" id="confirm-password" className="input-field" placeholder="••••••••" required />
                    </div>
                </div>
                
                <div className="divider"></div>
                
                <button type="submit" className="btn btn-primary">Cadastrar</button>
                
                <div className="login-link">
                    <p>Já tem uma conta?</p> <a href="login">Faça login</a>
                </div>
            </form>
        </div>
        </>
    );
}