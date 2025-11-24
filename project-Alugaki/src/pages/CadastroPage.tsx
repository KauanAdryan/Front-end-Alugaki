import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export function CadastroPage() {

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        cpfCnpj: "",
        telefone: "",
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
    const navigate = useNavigate();

    // Funções de máscara
    function mascaraCPF(valor: string): string {
        const apenasNumeros = valor.replace(/\D/g, '');
        if (apenasNumeros.length <= 11) {
            // CPF: 000.000.000-00
            return apenasNumeros
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            // CNPJ: 00.000.000/0000-00
            return apenasNumeros
                .replace(/(\d{2})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1/$2')
                .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        }
    }

    function mascaraTelefone(valor: string): string {
        const apenasNumeros = valor.replace(/\D/g, '');
        if (apenasNumeros.length <= 10) {
            // Telefone fixo: (00) 0000-0000
            return apenasNumeros
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
        } else {
            // Celular: (00) 00000-0000
            return apenasNumeros
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
        }
    }

    function mascaraCEP(valor: string): string {
        const apenasNumeros = valor.replace(/\D/g, '');
        return apenasNumeros.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
    }

    function handleChange(e: any) {
        const { id, value } = e.target;
        let valorFormatado = value;

        // Aplicar máscaras conforme o campo
        if (id === 'cpfCnpj') {
            valorFormatado = mascaraCPF(value);
        } else if (id === 'telefone') {
            valorFormatado = mascaraTelefone(value);
        } else if (id === 'cep') {
            valorFormatado = mascaraCEP(value);
        } else if (id === 'estado') {
            // Converte para maiúsculas e limita a 2 caracteres
            valorFormatado = value.toUpperCase().slice(0, 2);
        } else if (id === 'nome') {
            // Primeira letra de cada palavra em maiúscula
            valorFormatado = value;
        }

        setFormData({ ...formData, [id]: valorFormatado });
    }

    // -------------------------------
    // 🔍 Função ViaCEP
    // -------------------------------
    async function buscarCEP() {
        // Remove a máscara do CEP antes de buscar
        const cepLimpo = formData.cep.replace(/\D/g, '');
        if (cepLimpo.length < 8) return;

        try {
            const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await resp.json();

            if (data.erro) {
                setErro("CEP inválido!");
                return;
            }

            setFormData(prev => ({
                ...prev,
                rua: data.logradouro || "",
                bairro: data.bairro || "",
                cidade: data.localidade || "",
                estado: data.uf || ""
            }));
            setErro(""); // Limpa erro se houver

        } catch {
            setErro("Erro ao buscar CEP");
        }
    }

    // -------------------------------
    // 🚀 Função para enviar cadastro
    // -------------------------------
    async function handleSubmit(e: any) {
        e.preventDefault();
        setErro("");
        setSucesso("");

        if (formData.senha !== formData.confirmarSenha) {
            setErro("As senhas não coincidem!");
            return;
        }

        if (formData.senha.length < 6) {
            setErro("A senha deve ter pelo menos 6 caracteres!");
            return;
        }

        // Remove máscaras antes de enviar
        const cpfCnpjLimpo = formData.cpfCnpj.replace(/\D/g, '');
        const telefoneLimpo = formData.telefone.replace(/\D/g, '');
        const cepLimpo = formData.cep.replace(/\D/g, '');

        const usuarioData = {
            nome: formData.nome.trim(),
            email: formData.email.trim(),
            cpfCnpj: cpfCnpjLimpo,
            telefone: telefoneLimpo,
            rua: formData.rua.trim(),
            numero: formData.numero.trim(),
            cidade: formData.cidade.trim(),
            estado: formData.estado.trim().toUpperCase(),
            cep: cepLimpo,
            bairro: formData.bairro.trim(),
            senha: formData.senha
        };

        try {
            await authService.cadastrar(usuarioData);

            setSucesso("Cadastro realizado com sucesso!");
            setTimeout(() => navigate("/login"), 1500);

        } catch (error: any) {
            setErro(error.message || "Erro ao cadastrar usuário.");
        }
    }

    return (
        <>
            <div className="logo-container">
                <h1>AlugAki</h1>
            </div>

            <div className="signup-container">
                <div className="welcome">
                    <h2>Criar nova conta</h2>
                    <p>Preencha os dados abaixo para se cadastrar</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nome">Nome completo</label>
                            <input 
                                type="text" 
                                id="nome" 
                                className="input-field"
                                placeholder="Ex: João Silva Santos"
                                value={formData.nome} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email" 
                                id="email" 
                                className="input-field"
                                placeholder="Ex: joao.silva@email.com"
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cpfCnpj">CPF ou CNPJ</label>
                            <input 
                                type="text" 
                                id="cpfCnpj" 
                                className="input-field"
                                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                value={formData.cpfCnpj} 
                                onChange={handleChange}
                                maxLength={18}
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="telefone">Telefone</label>
                            <input 
                                type="tel" 
                                id="telefone" 
                                className="input-field"
                                placeholder="(00) 00000-0000"
                                value={formData.telefone} 
                                onChange={handleChange}
                                maxLength={15}
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="cep">CEP</label>
                        <input type="text" id="cep" className="input-field"
                            value={formData.cep} onChange={handleChange}
                            onBlur={buscarCEP}
                            placeholder="00000-000"
                            maxLength={9}
                            required />
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 2 }}>
                            <label htmlFor="rua">Rua</label>
                            <input 
                                type="text" 
                                id="rua" 
                                className="input-field"
                                placeholder="Ex: Rua das Flores"
                                value={formData.rua} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="numero">Número</label>
                            <input 
                                type="text" 
                                id="numero" 
                                className="input-field"
                                placeholder="Ex: 123"
                                value={formData.numero} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cidade">Cidade</label>
                            <input 
                                type="text" 
                                id="cidade" 
                                className="input-field"
                                placeholder="Ex: São Paulo"
                                value={formData.cidade} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="estado">Estado</label>
                            <input 
                                type="text" 
                                id="estado" 
                                className="input-field"
                                placeholder="Ex: SP"
                                value={formData.estado} 
                                onChange={handleChange} 
                                maxLength={2}
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="bairro">Bairro</label>
                            <input 
                                type="text" 
                                id="bairro" 
                                className="input-field"
                                placeholder="Ex: Centro"
                                value={formData.bairro} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="senha">Senha</label>
                            <input 
                                type="password" 
                                id="senha" 
                                className="input-field"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.senha} 
                                onChange={handleChange} 
                                minLength={6}
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmarSenha">Confirmar senha</label>
                            <input 
                                type="password" 
                                id="confirmarSenha" 
                                className="input-field"
                                placeholder="Digite a senha novamente"
                                value={formData.confirmarSenha} 
                                onChange={handleChange} 
                                minLength={6}
                                required 
                            />
                        </div>
                    </div>

                    {erro && <p style={{ color: "red" }}>{erro}</p>}
                    {sucesso && <p style={{ color: "green" }}>{sucesso}</p>}

                    <div className="divider"></div>

                    <button type="submit" className="btn btn-primary">Cadastrar</button>

                    <div className="login-link">
                        <p>Já tem uma conta? <a href="login">Faça login</a></p>
                    </div>
                </form>
            </div>
        </>
    );
}
