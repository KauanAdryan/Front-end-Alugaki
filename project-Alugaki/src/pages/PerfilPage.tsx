import { Navbar } from "../components/Navbar"

export function PerfilPage() {
  return (
    <div className="perfil-page-container">
      <Navbar />
      <main className="perfil-main">
        {/* Profile Header */}
        <div className="perfil-header-section">
          <div className="perfil-avatar-large">
            <span className="avatar-placeholder">👤</span>
          </div>
          <div className="perfil-user-info">
            <h1>Kauan Cássia</h1>
            <p>kauancassia91@gmail.com</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="perfil-form-container">
          <h2>Informações Pessoais</h2>
          
          <form className="perfil-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nome completo</label>
                <input 
                  type="text" 
                  id="name" 
                  className="input-field" 
                  placeholder="Seu nome completo" 
                  defaultValue="Kauan Cássia"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cpf-cnpj">CPF ou CNPJ</label>
                <input 
                  type="text" 
                  id="cpf-cnpj" 
                  className="input-field" 
                  placeholder="000.000.000-00" 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input 
                  type="email" 
                  id="email" 
                  className="input-field" 
                  placeholder="seu@email.com" 
                  defaultValue="kauancassia91@gmail.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Telefone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="input-field" 
                  placeholder="(11) 99999-9999" 
                />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="address">Endereço completo</label>
              <input 
                type="text" 
                id="address" 
                className="input-field" 
                placeholder="Rua, número, complemento" 
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Cidade</label>
                <input 
                  type="text" 
                  id="city" 
                  className="input-field" 
                  placeholder="Sua cidade" 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">Estado</label>
                <input 
                  type="text" 
                  id="state" 
                  className="input-field" 
                  placeholder="UF (ex: SP)" 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cep">CEP</label>
                <input 
                  type="text" 
                  id="cep" 
                  className="input-field" 
                  placeholder="00000-000" 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="neighborhood">Bairro</label>
                <input 
                  type="text" 
                  id="neighborhood" 
                  className="input-field" 
                  placeholder="Seu bairro" 
                />
              </div>
            </div>
            
            <div className="form-divider"></div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Nova senha</label>
                <input 
                  type="password" 
                  id="password" 
                  className="input-field" 
                  placeholder="••••••••" 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password">Confirmar nova senha</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  className="input-field" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-save">Salvar alterações</button>
              <button type="button" className="btn btn-cancel">Cancelar</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

