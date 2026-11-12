import {
  createInitialTickets,
  INITIAL_FAQ_ITEMS,
  INITIAL_ISSUED_DOCS,
} from '../data/mockData';
import {
  DocumentType,
  FaqItem,
  IssuedDocument,
  Ticket,
  TicketPriority,
  TicketStatus,
  UserSession,
} from '../types/cia';

export const STORAGE_KEYS = {
  SESSION: 'cia_unicatolica_session_v1',
  TICKETS: 'cia_unicatolica_tickets_v1',
  DOCS: 'cia_unicatolica_docs_v1',
  FAQ: 'cia_unicatolica_faq_v1',
  FAQ_VOTES: 'cia_unicatolica_faq_votes_v1',
};

export interface AuthResult {
  ok: boolean;
  user?: UserSession;
  errorTitle?: string;
  errorMessage?: string;
}

function formatDisplayNameFromEmail(localPart: string): string {
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function authenticateMicrosoftEmail(rawEmail: string): AuthResult {
  const email = rawEmail.trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return {
      ok: false,
      errorTitle: 'E-mail institucional inválido',
      errorMessage:
        'Informe seu endereço institucional Microsoft completo (ex.: nome.sobrenome@a.catolica-to.edu.br).',
    };
  }

  const [localPart, domain] = email.split('@');

  // Regra estrita: Docentes (@p.catolica-to.edu.br) não têm acesso ao módulo CIA
  if (domain === 'p.catolica-to.edu.br') {
    return {
      ok: false,
      errorTitle: 'Acesso não permitido ao módulo CIA',
      errorMessage:
        'Contas docentes (@p.catolica-to.edu.br) não possuem acesso ao módulo CIA 2.0. Utilize o Portal do Professor para demandas acadêmicas.',
    };
  }

  // Regra de Perfil: Alunos (@a.catolica-to.edu.br)
  if (domain === 'a.catolica-to.edu.br') {
    if (email === 'gabriel.vidal@a.catolica-to.edu.br') {
      return {
        ok: true,
        user: {
          email,
          name: 'Gabriel Vidal',
          role: 'student',
          matricula: '2024018472',
          curso: 'Engenharia de Software',
          periodo: '6º Período',
        },
      };
    }

    return {
      ok: true,
      user: {
        email,
        name: formatDisplayNameFromEmail(localPart) || 'Acadêmico UniCatólica',
        role: 'student',
        matricula: '2024091305',
        curso: 'Engenharia de Software',
        periodo: '6º Período',
      },
    };
  }

  // Regra de Perfil: Atendentes Administrativos (@catolica-to.edu.br ou @cia.catolica-to.edu.br)
  if (domain === 'catolica-to.edu.br' || domain === 'cia.catolica-to.edu.br') {
    const isAna = localPart === 'ana.souza' || localPart === 'atendimento';
    return {
      ok: true,
      user: {
        email,
        name: isAna ? 'Ana Souza' : formatDisplayNameFromEmail(localPart),
        role: 'attendant',
        setor: 'CIA · Atendimento Integrado',
      },
    };
  }

  return {
    ok: false,
    errorTitle: 'Domínio não reconhecido',
    errorMessage:
      'Apenas contas Microsoft institucionais da UniCatólica (@a.catolica-to.edu.br ou @catolica-to.edu.br) são aceitas.',
  };
}

export function loadSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }
}

export function loadTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (raw) {
      const parsed = JSON.parse(raw) as Ticket[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial seed
  }
  const initial = createInitialTickets();
  saveTickets(initial);
  return initial;
}

export function saveTickets(tickets: Ticket[]): void {
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
}

export function loadIssuedDocs(): IssuedDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCS);
    if (raw) {
      const parsed = JSON.parse(raw) as IssuedDocument[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback
  }
  localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(INITIAL_ISSUED_DOCS));
  return INITIAL_ISSUED_DOCS;
}

export function saveIssuedDocs(docs: IssuedDocument[]): void {
  localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
}

export function loadFaqItems(): FaqItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAQ);
    if (raw) {
      const parsed = JSON.parse(raw) as FaqItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Fallback
  }
  localStorage.setItem(STORAGE_KEYS.FAQ, JSON.stringify(INITIAL_FAQ_ITEMS));
  return INITIAL_FAQ_ITEMS;
}

export function saveFaqItems(items: FaqItem[]): void {
  localStorage.setItem(STORAGE_KEYS.FAQ, JSON.stringify(items));
}

export function loadFaqVotes(): Record<string, 'yes' | 'no'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAQ_VOTES);
    return raw ? (JSON.parse(raw) as Record<string, 'yes' | 'no'>) : {};
  } catch {
    return {};
  }
}

export function saveFaqVotes(votes: Record<string, 'yes' | 'no'>): void {
  localStorage.setItem(STORAGE_KEYS.FAQ_VOTES, JSON.stringify(votes));
}

export function resetAllDemoData(): void {
  const initialTickets = createInitialTickets();
  saveTickets(initialTickets);
  saveIssuedDocs(INITIAL_ISSUED_DOCS);
  saveFaqItems(INITIAL_FAQ_ITEMS);
  localStorage.removeItem(STORAGE_KEYS.FAQ_VOTES);
}

export function calculateSlaDeadline(priority: TicketPriority): string {
  const hoursMap: Record<TicketPriority, number> = {
    Alta: 4,
    Média: 24,
    Baixa: 48,
  };
  return new Date(Date.now() + hoursMap[priority] * 60 * 60 * 1000).toISOString();
}

export function generateNextProtocol(existingTickets: Ticket[]): string {
  let maxNumber = 43;
  for (const ticket of existingTickets) {
    const match = ticket.protocol.match(/(\d+)$/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!Number.isNaN(parsed) && parsed > maxNumber) {
        maxNumber = parsed;
      }
    }
  }
  const next = String(maxNumber + 1).padStart(4, '0');
  return `#CIA-2026-${next}`;
}

export interface SlaStatusInfo {
  label: string;
  shortLabel: string;
  state: 'overdue' | 'critical' | 'warning' | 'normal' | 'completed';
  msRemaining: number;
}

export function formatSlaRemaining(
  slaDeadlineIso: string,
  status: TicketStatus,
  nowMs: number
): SlaStatusInfo {
  if (status === 'Concluído') {
    return {
      label: 'SLA Encerrado',
      shortLabel: 'Concluído',
      state: 'completed',
      msRemaining: Number.MAX_SAFE_INTEGER,
    };
  }

  const deadlineMs = new Date(slaDeadlineIso).getTime();
  const diffMs = deadlineMs - nowMs;

  if (diffMs <= 0) {
    const absMin = Math.floor(Math.abs(diffMs) / 60000);
    const hrs = Math.floor(absMin / 60);
    const mins = absMin % 60;
    const formatted = hrs > 0 ? `${hrs}h ${String(mins).padStart(2, '0')}m` : `${mins}m`;
    return {
      label: `SLA Estourado (-${formatted})`,
      shortLabel: `-${formatted}`,
      state: 'overdue',
      msRemaining: diffMs,
    };
  }

  const totalMin = Math.floor(diffMs / 60000);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const formatted = hrs > 0 ? `${hrs}h ${String(mins).padStart(2, '0')}m` : `${mins}m`;

  if (diffMs <= 2 * 60 * 60 * 1000) {
    return {
      label: `Crítico · Vence em ${formatted}`,
      shortLabel: formatted,
      state: 'critical',
      msRemaining: diffMs,
    };
  }

  if (diffMs <= 6 * 60 * 60 * 1000) {
    return {
      label: `Atenção · Restam ${formatted}`,
      shortLabel: formatted,
      state: 'warning',
      msRemaining: diffMs,
    };
  }

  return {
    label: `No prazo · Restam ${formatted}`,
    shortLabel: formatted,
    state: 'normal',
    msRemaining: diffMs,
  };
}

export function formatDateTimeBr(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function triggerPrintableDocumentDownload(
  docType: DocumentType,
  doc: IssuedDocument,
  user: UserSession
): void {
  const issuedStr = formatDateTimeBr(doc.issuedAt);
  const bodyContent =
    docType === 'boleto'
      ? `
      <h2>2ª Via de Boleto — Mensalidade Acadêmica (11/2026)</h2>
      <p><strong>Beneficiário:</strong> Centro Universitário Católica do Tocantins — UniCatólica (CNPJ 00.000.000/0001-91)</p>
      <p><strong>Pagador:</strong> ${user.name} · RA ${user.matricula ?? '2024018472'} · ${user.curso ?? 'Engenharia de Software'}</p>
      <p><strong>Vencimento:</strong> 18/11/2026 &nbsp;|&nbsp; <strong>Valor:</strong> R$ 1.248,90</p>
      <div class="box">
        <strong>Linha Digitável:</strong><br/>
        <code>23793.38128 60082.910248 07000.063308 1 99040000124890</code>
      </div>
    `
      : docType === 'declaracao_matricula'
      ? `
      <h2>Declaração de Vínculo e Matrícula Ativa — 2026/2</h2>
      <p>A Secretaria Acadêmica do Centro Universitário Católica do Tocantins (UniCatólica) declara, para os devidos fins, que <strong>${user.name}</strong>, portador(a) do Registro Acadêmico (RA) nº <strong>${user.matricula ?? '2024018472'}</strong>, encontra-se regularmente matriculado(a) no curso de graduação em <strong>${user.curso ?? 'Engenharia de Software'}</strong> (${user.periodo ?? '6º Período'}), no período letivo 2026/2.</p>
      <p>Turno: Noturno · Campus I — Palmas/TO · Situação: Matrícula Ativa.</p>
    `
      : `
      <h2>Histórico Escolar Parcial Oficial</h2>
      <p><strong>Discente:</strong> ${user.name} · <strong>RA:</strong> ${user.matricula ?? '2024018472'} · <strong>Curso:</strong> ${user.curso ?? 'Engenharia de Software'}</p>
      <p><strong>Coeficiente de Rendimento (CR):</strong> 8,74 &nbsp;|&nbsp; <strong>Integralização:</strong> 64,2%</p>
      <table>
        <thead><tr><th>Código</th><th>Disciplina</th><th>CH</th><th>Média</th><th>Situação</th></tr></thead>
        <tbody>
          <tr><td>ESW301</td><td>Arquitetura de Software</td><td>80h</td><td>9,2</td><td>Aprovado</td></tr>
          <tr><td>ESW304</td><td>Engenharia de Requisitos</td><td>60h</td><td>8,9</td><td>Aprovado</td></tr>
          <tr><td>ESW402</td><td>Sistemas Distribuídos</td><td>80h</td><td>8,5</td><td>Aprovado</td></tr>
          <tr><td>ESW501</td><td>Qualidade e Testes de Software</td><td>60h</td><td>—</td><td>Cursando</td></tr>
        </tbody>
      </table>
    `;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${doc.title} - ${doc.protocol}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; max-width: 780px; margin: 40px auto; padding: 32px; border: 1px solid #cbd5e1; }
  header { border-bottom: 2px solid #0B1D3A; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
  h1 { margin: 0; font-size: 18px; color: #0B1D3A; }
  h2 { font-size: 16px; color: #164273; margin-top: 0; }
  p { line-height: 1.6; font-size: 14px; }
  .meta { font-size: 12px; color: #475569; text-align: right; }
  .box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 14px; margin: 16px 0; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
  th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
  th { background: #0B1D3A; color: #ffffff; }
  footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #475569; }
</style>
</head>
<body>
  <header>
    <div>
      <h1>UniCatólica — Centro Universitário Católica do Tocantins</h1>
      <div style="font-size:12px;color:#475569;">Centro Integrado de Atendimento ao Aluno (CIA 2.0)</div>
    </div>
    <div class="meta">
      Protocolo: <strong>${doc.protocol}</strong><br/>
      Emitido em: ${issuedStr}
    </div>
  </header>
  ${bodyContent}
  <footer>
    Documento emitido eletronicamente via Autoatendimento CIA 2.0.<br/>
    Código de Autenticidade: <strong>${doc.verificationCode}</strong>
  </footer>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${doc.type}_${user.matricula ?? 'aluno'}_${doc.protocol.replace('#', '')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerAttachmentDownload(
  attachmentName: string,
  protocol: string,
  studentName: string
): void {
  const content = `UniCatólica — Centro Integrado de Atendimento ao Aluno (CIA 2.0)\nProtocolo: ${protocol}\nDiscente: ${studentName}\nArquivo oficial: ${attachmentName}\nEmitido em: ${new Date().toLocaleString('pt-BR')}\n\nEste arquivo representa o documento oficial anexado pelo atendente do CIA ao protocolo ${protocol}.`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = attachmentName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
