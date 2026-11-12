import { FaqItem, IssuedDocument, Ticket } from '../types/cia';

const hoursFromNow = (hours: number): string =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const minutesFromNow = (minutes: number): string =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();

export const createInitialTickets = (): Ticket[] => [
  {
    id: 'tkt-101',
    protocol: '#CIA-2026-0041',
    studentName: 'Gabriel Vidal',
    studentEmail: 'gabriel.vidal@a.catolica-to.edu.br',
    studentMatricula: '2024018472',
    studentCurso: 'Engenharia de Software',
    studentPeriodo: '6º Período',
    category: 'Financeiro',
    priority: 'Alta',
    subject: 'Divergência no desconto de pontualidade do boleto de Novembro',
    description:
      'O boleto referente à parcela 11/2026 foi gerado sem o desconto de 15% previsto no convênio corporativo, mesmo com o pagamento das parcelas anteriores em dia. Solicito recálculo antes do vencimento.',
    status: 'Encaminhado ao Financeiro',
    createdAt: hoursFromNow(-6.5),
    updatedAt: hoursFromNow(-2.1),
    slaDeadline: minutesFromNow(46),
    assignedTo: 'Ana Souza (CIA)',
    messages: [
      {
        id: 'msg-101-1',
        authorName: 'Gabriel Vidal',
        authorRole: 'student',
        content:
          'Protocolo aberto pelo Portal do Aluno. Aguardo revisão do valor para efetuar o pagamento dentro do prazo.',
        timestamp: hoursFromNow(-6.5),
      },
      {
        id: 'msg-101-2',
        authorName: 'Ana Souza',
        authorRole: 'attendant',
        content:
          'Documentação de convênio validada na triagem. Chamado encaminhado ao setor Financeiro para aplicação da faixa de desconto e emissão de guia atualizada.',
        timestamp: hoursFromNow(-2.1),
      },
    ],
  },
  {
    id: 'tkt-102',
    protocol: '#CIA-2026-0039',
    studentName: 'Mariana Alencar',
    studentEmail: 'mariana.alencar@a.catolica-to.edu.br',
    studentMatricula: '2023041190',
    studentCurso: 'Direito',
    studentPeriodo: '8º Período',
    category: 'Financeiro',
    priority: 'Alta',
    subject: 'Liberação de matrícula após compensação de acordo financeiro',
    description:
      'Realizei a quitação da entrada do acordo via PIX ontem às 16h20, porém o portal acadêmico ainda consta bloqueio financeiro para inscrição em estágio supervisionado.',
    status: 'Em Análise',
    createdAt: hoursFromNow(-5.4),
    updatedAt: hoursFromNow(-3.0),
    slaDeadline: minutesFromNow(-78),
    assignedTo: 'Ana Souza (CIA)',
    messages: [
      {
        id: 'msg-102-1',
        authorName: 'Mariana Alencar',
        authorRole: 'student',
        content:
          'Preciso da baixa do bloqueio hoje para assinar o termo de estágio obrigatório no NPJ.',
        timestamp: hoursFromNow(-5.4),
      },
      {
        id: 'msg-102-2',
        authorName: 'Ana Souza',
        authorRole: 'attendant',
        content:
          'Recebemos o comprovante de compensação. Conferindo baixa bancária junto à tesouraria.',
        timestamp: hoursFromNow(-3.0),
      },
    ],
  },
  {
    id: 'tkt-103',
    protocol: '#CIA-2026-0042',
    studentName: 'Gabriel Vidal',
    studentEmail: 'gabriel.vidal@a.catolica-to.edu.br',
    studentMatricula: '2024018472',
    studentCurso: 'Engenharia de Software',
    studentPeriodo: '6º Período',
    category: 'Acadêmico',
    priority: 'Média',
    subject: 'Aproveitamento de horas complementares — Maratona de Programação',
    description:
      'Envio certificado de participação e premiação na Maratona Regional de Programação (24h) para cômputo no módulo de Atividades Acadêmicas Complementares.',
    status: 'Em Análise',
    createdAt: hoursFromNow(-11),
    updatedAt: hoursFromNow(-4.5),
    slaDeadline: hoursFromNow(13),
    assignedTo: 'Ana Souza (CIA)',
    messages: [
      {
        id: 'msg-103-1',
        authorName: 'Gabriel Vidal',
        authorRole: 'student',
        content:
          'Certificado emitido pela SBC com carga horária total de 24 horas anexa ao requerimento.',
        timestamp: hoursFromNow(-11),
      },
      {
        id: 'msg-103-2',
        authorName: 'Ana Souza',
        authorRole: 'attendant',
        content:
          'Certificado recebido e conferido. Em análise pela coordenação do curso de Engenharia de Software.',
        timestamp: hoursFromNow(-4.5),
      },
    ],
  },
  {
    id: 'tkt-104',
    protocol: '#CIA-2026-0043',
    studentName: 'Lucas Ferreira Mendes',
    studentEmail: 'lucas.mendes@a.catolica-to.edu.br',
    studentMatricula: '2025029811',
    studentCurso: 'Medicina Veterinária',
    studentPeriodo: '4º Período',
    category: 'Bolsas e Benefícios',
    priority: 'Alta',
    subject: 'Assinatura de termo aditivo de renovação ProUni 2026/2',
    description:
      'Solicito agendamento ou envio digital do termo de atualização de usufruto da bolsa integral ProUni referente ao segundo semestre.',
    status: 'Aberto',
    createdAt: hoursFromNow(-1.2),
    updatedAt: hoursFromNow(-1.2),
    slaDeadline: hoursFromNow(2.8),
    messages: [
      {
        id: 'msg-104-1',
        authorName: 'Lucas Ferreira Mendes',
        authorRole: 'student',
        content:
          'Recebi notificação do MEC para assinatura até sexta-feira. Gostaria de confirmar se já está disponível.',
        timestamp: hoursFromNow(-1.2),
      },
    ],
  },
  {
    id: 'tkt-105',
    protocol: '#CIA-2026-0040',
    studentName: 'Beatriz Nogueira Costa',
    studentEmail: 'beatriz.costa@a.catolica-to.edu.br',
    studentMatricula: '2022015540',
    studentCurso: 'Arquitetura e Urbanismo',
    studentPeriodo: '9º Período',
    category: 'Requerimentos',
    priority: 'Baixa',
    subject: 'Emissão de ementas assinadas para mobilidade acadêmica',
    description:
      'Necessito das ementas das disciplinas cursadas entre 2022 e 2025 com assinatura digital da secretaria para candidatura em edital de intercâmbio.',
    status: 'Encaminhado à Secretaria',
    createdAt: hoursFromNow(-22),
    updatedAt: hoursFromNow(-8),
    slaDeadline: hoursFromNow(26),
    assignedTo: 'Ana Souza (CIA)',
    messages: [
      {
        id: 'msg-105-1',
        authorName: 'Beatriz Nogueira Costa',
        authorRole: 'student',
        content:
          'São 18 disciplinas listadas no plano de estudos em anexo.',
        timestamp: hoursFromNow(-22),
      },
      {
        id: 'msg-105-2',
        authorName: 'Ana Souza',
        authorRole: 'attendant',
        content:
          'Pedido encaminhado à Secretaria Acadêmica para compilação e assinatura ICP-Brasil.',
        timestamp: hoursFromNow(-8),
      },
    ],
  },
  {
    id: 'tkt-106',
    protocol: '#CIA-2026-0035',
    studentName: 'Gabriel Vidal',
    studentEmail: 'gabriel.vidal@a.catolica-to.edu.br',
    studentMatricula: '2024018472',
    studentCurso: 'Engenharia de Software',
    studentPeriodo: '6º Período',
    category: 'Requerimentos',
    priority: 'Baixa',
    subject: 'Atualização cadastral de endereço residencial e telefone',
    description:
      'Atualizei meu endereço residencial em Palmas-TO e solicito sincronização na base cadastral da secretaria para emissão de documentos.',
    status: 'Concluído',
    createdAt: hoursFromNow(-54),
    updatedAt: hoursFromNow(-38),
    slaDeadline: hoursFromNow(-6),
    assignedTo: 'Ana Souza (CIA)',
    messages: [
      {
        id: 'msg-106-1',
        authorName: 'Gabriel Vidal',
        authorRole: 'student',
        content:
          'Comprovante de residência da Quadra 108 Sul enviado para atualização.',
        timestamp: hoursFromNow(-54),
      },
      {
        id: 'msg-106-2',
        authorName: 'Ana Souza',
        authorRole: 'attendant',
        content:
          'Cadastro atualizado com sucesso no sistema acadêmico. Segue comprovante oficial de atualização cadastral.',
        timestamp: hoursFromNow(-38),
        attachmentName: 'Comprovante_Atualizacao_Cadastral_2024018472.pdf',
      },
    ],
  },
];

export const INITIAL_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Financeiro',
    question: 'Como emitir a 2ª via do boleto da mensalidade com código atualizado?',
    answer:
      'Você pode emitir a 2ª via instantaneamente pelo módulo de Autoatendimento 1-Clique na página inicial do Portal do Aluno. Boletos vencidos em até 30 dias são recalculados automaticamente com juros e multa proporcionais na nova guia.',
    helpfulYes: 142,
    helpfulNo: 4,
    relatedDoc: 'boleto',
  },
  {
    id: 'faq-2',
    category: 'Acadêmico',
    question: 'Onde obtenho minha Declaração de Matrícula assinada digitalmente?',
    answer:
      'A Declaração de Matrícula com código de autenticidade digital (QR Code e hash verificável) está disponível 24 horas por dia nos cartões de Acesso Rápido. Basta clicar em "Declaração de Matrícula" para baixar o comprovante ou enviá-lo diretamente ao seu e-mail institucional.',
    helpfulYes: 198,
    helpfulNo: 3,
    relatedDoc: 'declaracao_matricula',
  },
  {
    id: 'faq-3',
    category: 'Acadêmico',
    question: 'Qual o prazo para lançamento de notas e solicitação de revisão de prova?',
    answer:
      'Os docentes possuem até 5 dias úteis após a aplicação da avaliação para publicar as notas no diário eletrônico. Caso identifique divergência, o pedido de revisão deve ser protocolado via Requerimento Acadêmico em até 48 horas após a divulgação oficial.',
    helpfulYes: 89,
    helpfulNo: 9,
  },
  {
    id: 'faq-4',
    category: 'Financeiro',
    question: 'Como funciona a negociação de débitos em atraso ou parcelamento?',
    answer:
      'Débitos com mais de 30 dias podem ser renegociados em até 6 parcelas no cartão de crédito ou mediante entrada via PIX e saldo em boletos mensais. Abra um chamado na categoria Financeiro informando as competências em aberto para receber a simulação formal.',
    helpfulYes: 76,
    helpfulNo: 11,
  },
  {
    id: 'faq-5',
    category: 'Bolsas e Benefícios',
    question: 'Quais são os prazos de renovação do ProUni e aditamento do FIES?',
    answer:
      'O aditamento do FIES e a atualização de usufruto do ProUni ocorrem semestralmente conforme calendário divulgado pelo MEC e pela Central de Bolsas da UniCatólica. Alunos contemplados recebem notificação no e-mail @a.catolica-to.edu.br com link para assinatura digital.',
    helpfulYes: 114,
    helpfulNo: 6,
  },
  {
    id: 'faq-6',
    category: 'Bolsas e Benefícios',
    question: 'Como solicitar desconto de convênio empresa ou bolsa egresso?',
    answer:
      'Para vincular um convênio empresarial ou benefício egresso, abra um chamado na categoria Bolsas e Benefícios anexando a declaração de vínculo empregatício atualizada (emitida há no máximo 30 dias) ou diploma de graduação UniCatólica.',
    helpfulYes: 63,
    helpfulNo: 5,
  },
  {
    id: 'faq-7',
    category: 'Requerimentos',
    question: 'Como protocolar aproveitamento de disciplinas cursadas em outra IES?',
    answer:
      'O pedido de dispensa/aproveitamento de disciplina deve ser aberto na categoria Requerimentos até a 2ª semana letiva do semestre, informando as disciplinas cursadas, histórico escolar oficial da instituição de origem e planos de ensino com carga horária.',
    helpfulYes: 54,
    helpfulNo: 4,
  },
  {
    id: 'faq-8',
    category: 'Requerimentos',
    question: 'Como solicitar o Histórico Escolar parcial ou integral?',
    answer:
      'O Histórico Escolar Parcial para fins de estágio, transferência ou conferência de integralização é gerado na hora no card de Autoatendimento 1-Clique. Para histórico de conclusão com selo para registro externo após colação de grau, abra um requerimento específico.',
    helpfulYes: 121,
    helpfulNo: 2,
    relatedDoc: 'historico_escolar',
  },
];

export const INITIAL_ISSUED_DOCS: IssuedDocument[] = [
  {
    id: 'doc-901',
    type: 'declaracao_matricula',
    title: 'Declaração de Matrícula — 2026/2',
    protocol: '#DOC-2026-8814',
    issuedAt: hoursFromNow(-72),
    studentName: 'Gabriel Vidal',
    studentMatricula: '2024018472',
    studentCurso: 'Engenharia de Software',
    verificationCode: 'UCAT-9F4B-2026-8814',
    sentToEmail: 'gabriel.vidal@a.catolica-to.edu.br',
  },
  {
    id: 'doc-902',
    type: 'boleto',
    title: '2ª Via de Boleto — Mensalidade 10/2026',
    protocol: '#DOC-2026-8702',
    issuedAt: hoursFromNow(-310),
    studentName: 'Gabriel Vidal',
    studentMatricula: '2024018472',
    studentCurso: 'Engenharia de Software',
    verificationCode: 'UCAT-3A19-2026-8702',
  },
];
