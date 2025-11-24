export interface Mensagem {
  id: string;
  title: string;
  content: string;
  sender: string;
  timestamp: Date;
  isRead: boolean;
  category: string;
}

export const mensagensData: Mensagem[] = [
  {
    id: '1',
    title: 'Nova Mensagem',
    content: 'Você recebeu uma nova mensagem importante do sistema. Seu equipamento foi alugado com sucesso!',
    sender: 'Sistema',
    timestamp: new Date(),
    isRead: false,
    category: 'Sistema'
  },
  {
    id: '2',
    title: 'Atualização Disponível',
    content: 'Uma nova versão do aplicativo está disponível para download. Atualize agora para ter acesso às novas funcionalidades.',
    sender: 'Suporte',
    timestamp: new Date(Date.now() - 3600000),
    isRead: true,
    category: 'Atualização'
  },
  {
    id: '3',
    title: 'Lembrete Importante',
    content: 'Não se esqueça de concluir suas tarefas pendentes. Você tem 2 itens aguardando confirmação.',
    sender: 'Lembretes',
    timestamp: new Date(Date.now() - 7200000),
    isRead: false,
    category: 'Lembrete'
  },
  {
    id: '4',
    title: 'Novo Aluguel Recebido',
    content: 'Seu equipamento "Guitarra Elétrica – Stratocaster" foi alugado por João Silva. O aluguel está agendado para os próximos 3 dias.',
    sender: 'Sistema',
    timestamp: new Date(Date.now() - 10800000),
    isRead: false,
    category: 'Aluguel'
  },
  {
    id: '5',
    title: 'Avaliação Recebida',
    content: 'Você recebeu uma nova avaliação de 5 estrelas do usuário Maria Santos. Obrigado por usar o AlugaKi!',
    sender: 'Sistema',
    timestamp: new Date(Date.now() - 86400000),
    isRead: true,
    category: 'Avaliação'
  },
  {
    id: '6',
    title: 'Pagamento Confirmado',
    content: 'O pagamento do aluguel do seu equipamento foi confirmado. O valor de R$ 35,00 foi creditado na sua conta.',
    sender: 'Financeiro',
    timestamp: new Date(Date.now() - 172800000),
    isRead: true,
    category: 'Financeiro'
  }
];

