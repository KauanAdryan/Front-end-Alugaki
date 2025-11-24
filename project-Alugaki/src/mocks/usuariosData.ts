export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
  cpfCnpj?: string;
  rua: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;
  bairro: string;
  avatar: string | null;
  avaliacao: number;
  totalAlugueis: number;
  membroDesde: Date;
}

export const usuariosData: Usuario[] = [
  {
    id: 1,
    nome: "Kauan Cássia",
    email: "kauancassia91@gmail.com",
    senha: "123456",
    telefone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    cpfCnpj: "123.456.789-00",
    rua: "Rua das Flores",
    numero: "123",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    bairro: "Centro",
    avatar: null,
    avaliacao: 4.8,
    totalAlugueis: 15,
    membroDesde: new Date('2024-01-15')
  },
  {
    id: 2,
    nome: "Maria Silva",
    email: "maria@email.com",
    senha: "senha123",
    telefone: "(21) 98765-4321",
    cpf: "987.654.321-00",
    cpfCnpj: "987.654.321-00",
    rua: "Av. Atlântica",
    numero: "500",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    cep: "22010-000",
    bairro: "Copacabana",
    avatar: null,
    avaliacao: 4.9,
    totalAlugueis: 8,
    membroDesde: new Date('2024-02-20')
  }
];

export const usuarioLogado: Usuario = usuariosData[0];

