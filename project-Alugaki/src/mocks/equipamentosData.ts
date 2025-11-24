export interface Equipamento {
  id: number;
  nome: string;
  preco: number;
  local: string;
  categoria: string;
  imagem: string;
  disponivel: boolean;
  avaliacao: number;
  descricao?: string;
  proprietario?: string;
}

export const equipamentosData: Equipamento[] = [
  { 
    id: 1, 
    nome: "Guitarra Elétrica – Stratocaster", 
    preco: 35, 
    local: "São Paulo",
    categoria: "cordas",
    imagem: "/images/guitarra.jpg",
    disponivel: true,
    avaliacao: 4.8,
    descricao: "Guitarra elétrica profissional com captadores de alta qualidade",
    proprietario: "João Silva"
  },
  { 
    id: 2, 
    nome: "Baixo – 4003", 
    preco: 45, 
    local: "Rio de Janeiro",
    categoria: "cordas",
    imagem: "/images/baixo.jpg",
    disponivel: true,
    avaliacao: 4.6,
    descricao: "Baixo elétrico de 4 cordas, ideal para shows ao vivo",
    proprietario: "Maria Santos"
  },
  { 
    id: 3, 
    nome: "Amplificador – JCM800", 
    preco: 25, 
    local: "São Paulo",
    categoria: "amplificadores",
    imagem: "/images/amplificador.jpg",
    disponivel: true,
    avaliacao: 4.9,
    descricao: "Amplificador valvulado de 50W, som cristalino",
    proprietario: "Pedro Costa"
  },
  { 
    id: 4, 
    nome: "Sistema de PA – L1 Pro8", 
    preco: 60, 
    local: "Belo Horizonte",
    categoria: "som",
    imagem: "/images/pa.jpg",
    disponivel: false,
    avaliacao: 4.7,
    descricao: "Sistema de som completo para eventos médios",
    proprietario: "Ana Oliveira"
  },
  { 
    id: 5, 
    nome: "Teclado – Korg X50", 
    preco: 50, 
    local: "Curitiba",
    categoria: "teclas",
    imagem: "/images/teclado.jpg",
    disponivel: true,
    avaliacao: 4.5,
    descricao: "Teclado sintetizador com 61 teclas e múltiplos timbres",
    proprietario: "Carlos Mendes"
  },
  { 
    id: 6, 
    nome: "Bateria Acústica – Pearl", 
    preco: 70, 
    local: "Porto Alegre",
    categoria: "percussao",
    imagem: "/images/bateria.jpg",
    disponivel: true,
    avaliacao: 4.8,
    descricao: "Bateria completa com pratos incluídos",
    proprietario: "Fernanda Lima"
  },
  { 
    id: 7, 
    nome: "Violão Acústico – Yamaha", 
    preco: 30, 
    local: "São Paulo",
    categoria: "cordas",
    imagem: "/images/violao.jpg",
    disponivel: true,
    avaliacao: 4.7,
    descricao: "Violão acústico de cordas de aço",
    proprietario: "Roberto Alves"
  },
  { 
    id: 8, 
    nome: "Microfone Condensador – Shure SM58", 
    preco: 20, 
    local: "Rio de Janeiro",
    categoria: "som",
    imagem: "/images/microfone.jpg",
    disponivel: true,
    avaliacao: 4.9,
    descricao: "Microfone profissional para vocais",
    proprietario: "Juliana Rocha"
  },
  { 
    id: 9, 
    nome: "Piano Digital – Casio", 
    preco: 55, 
    local: "Brasília",
    categoria: "teclas",
    imagem: "/images/piano.jpg",
    disponivel: true,
    avaliacao: 4.6,
    descricao: "Piano digital com 88 teclas pesadas",
    proprietario: "Lucas Ferreira"
  },
  { 
    id: 10, 
    nome: "Amplificador de Baixo – Ampeg", 
    preco: 40, 
    local: "São Paulo",
    categoria: "amplificadores",
    imagem: "/images/ampbaixo.jpg",
    disponivel: false,
    avaliacao: 4.8,
    descricao: "Amplificador específico para baixo elétrico",
    proprietario: "Patricia Souza"
  }
];

export const categorias: string[] = [
  "Todos",
  "cordas",
  "amplificadores",
  "som",
  "teclas",
  "percussao"
];

export const locais: string[] = [
  "Todos",
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Porto Alegre"
];

