export type UserRole = 'student' | 'attendant';

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  matricula?: string;
  curso?: string;
  periodo?: string;
  setor?: string;
}

export type TicketCategory =
  | 'Acadêmico'
  | 'Financeiro'
  | 'Requerimentos'
  | 'Bolsas e Benefícios';

export type TicketPriority = 'Alta' | 'Média' | 'Baixa';

export type TicketStatus =
  | 'Aberto'
  | 'Em Análise'
  | 'Encaminhado ao Financeiro'
  | 'Encaminhado à Secretaria'
  | 'Concluído';

export interface TicketMessage {
  id: string;
  authorName: string;
  authorRole: 'student' | 'attendant' | 'system';
  content: string;
  timestamp: string;
  attachmentName?: string;
}

export interface Ticket {
  id: string;
  protocol: string;
  studentName: string;
  studentEmail: string;
  studentMatricula: string;
  studentCurso: string;
  studentPeriodo: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  assignedTo?: string;
  messages: TicketMessage[];
}

export type DocumentType =
  | 'boleto'
  | 'declaracao_matricula'
  | 'historico_escolar';

export interface IssuedDocument {
  id: string;
  type: DocumentType;
  title: string;
  protocol: string;
  issuedAt: string;
  studentName: string;
  studentMatricula: string;
  studentCurso: string;
  verificationCode: string;
  sentToEmail?: string;
}

export interface FaqItem {
  id: string;
  category: TicketCategory;
  question: string;
  answer: string;
  helpfulYes: number;
  helpfulNo: number;
  relatedDoc?: DocumentType;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
