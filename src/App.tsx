import { useCallback, useEffect, useState } from 'react';
import { AttendantDashboard } from './components/AttendantDashboard';
import { DocumentModal } from './components/DocumentModal';
import { LoginScreen } from './components/LoginScreen';
import { StudentPortal } from './components/StudentPortal';
import { TicketResolutionModal } from './components/TicketResolutionModal';
import { ToastContainer } from './components/ToastContainer';
import {
  DocumentType,
  FaqItem,
  IssuedDocument,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  ToastMessage,
  UserSession,
} from './types/cia';
import {
  calculateSlaDeadline,
  generateNextProtocol,
  loadFaqItems,
  loadFaqVotes,
  loadIssuedDocs,
  loadSession,
  loadTickets,
  saveFaqItems,
  saveFaqVotes,
  saveIssuedDocs,
  saveSession,
  saveTickets,
  STORAGE_KEYS,
} from './utils/storage';

const DOC_TITLES: Record<DocumentType, string> = {
  boleto: '2ª Via de Boleto — Mensalidade 11/2026',
  declaracao_matricula: 'Declaração de Matrícula — 2026/2',
  historico_escolar: 'Histórico Escolar Parcial Oficial',
};

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => loadSession());
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const [issuedDocs, setIssuedDocs] = useState<IssuedDocument[]>(() =>
    loadIssuedDocs()
  );
  const [faqItems, setFaqItems] = useState<FaqItem[]>(() => loadFaqItems());
  const [faqVotes, setFaqVotes] = useState<Record<string, 'yes' | 'no'>>(() =>
    loadFaqVotes()
  );

  const [activeDocModal, setActiveDocModal] = useState<IssuedDocument | null>(
    null
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const addToast = useCallback(
    (
      type: 'success' | 'error' | 'info',
      title: string,
      description?: string
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Live SLA clock ticker (updates every 15s)
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Cross-tab real-time localStorage synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TICKETS) {
        setTickets(loadTickets());
      } else if (e.key === STORAGE_KEYS.DOCS) {
        setIssuedDocs(loadIssuedDocs());
      } else if (e.key === STORAGE_KEYS.FAQ) {
        setFaqItems(loadFaqItems());
      } else if (e.key === STORAGE_KEYS.FAQ_VOTES) {
        setFaqVotes(loadFaqVotes());
      } else if (e.key === STORAGE_KEYS.SESSION) {
        setSession(loadSession());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLoginSuccess = (user: UserSession) => {
    saveSession(user);
    setSession(user);
    // Reload latest shared state in case demo data was restored
    setTickets(loadTickets());
    setIssuedDocs(loadIssuedDocs());
    setFaqItems(loadFaqItems());
    setFaqVotes(loadFaqVotes());
  };

  const handleLogout = () => {
    saveSession(null);
    setSession(null);
    setActiveDocModal(null);
    setSelectedTicketId(null);
    addToast('info', 'Sessão encerrada com segurança.');
  };

  const handleIssueDocument = (type: DocumentType) => {
    if (!session) return;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newDoc: IssuedDocument = {
      id: `doc-${Date.now()}`,
      type,
      title: DOC_TITLES[type],
      protocol: `#DOC-2026-${randomNum}`,
      issuedAt: new Date().toISOString(),
      studentName: session.name,
      studentMatricula: session.matricula ?? '2024018472',
      studentCurso: session.curso ?? 'Engenharia de Software',
      verificationCode: `UCAT-${hash}-2026-${randomNum}`,
    };

    const updatedDocs = [newDoc, ...issuedDocs];
    setIssuedDocs(updatedDocs);
    saveIssuedDocs(updatedDocs);
    setActiveDocModal(newDoc);
    addToast(
      'success',
      'Documento gerado instantaneamente',
      `${newDoc.title} · Protocolo ${newDoc.protocol}`
    );
  };

  const handleSendDocEmail = (doc: IssuedDocument) => {
    if (!session) return;
    const updatedDocs = issuedDocs.map((item) =>
      item.id === doc.id ? { ...item, sentToEmail: session.email } : item
    );
    setIssuedDocs(updatedDocs);
    saveIssuedDocs(updatedDocs);
    setActiveDocModal((prev) =>
      prev && prev.id === doc.id ? { ...prev, sentToEmail: session.email } : prev
    );
    addToast(
      'success',
      'Cópia enviada para o e-mail institucional',
      `Enviado para ${session.email}`
    );
  };

  const handleVoteFaq = (faqId: string, vote: 'yes' | 'no') => {
    const previousVote = faqVotes[faqId];
    if (previousVote === vote) return;

    const updatedVotes = { ...faqVotes, [faqId]: vote };
    const updatedFaq = faqItems.map((item) => {
      if (item.id !== faqId) return item;
      let yes = item.helpfulYes;
      let no = item.helpfulNo;
      if (previousVote === 'yes') yes = Math.max(0, yes - 1);
      if (previousVote === 'no') no = Math.max(0, no - 1);
      if (vote === 'yes') yes += 1;
      if (vote === 'no') no += 1;
      return { ...item, helpfulYes: yes, helpfulNo: no };
    });

    setFaqVotes(updatedVotes);
    saveFaqVotes(updatedVotes);
    setFaqItems(updatedFaq);
    saveFaqItems(updatedFaq);
    addToast(
      'info',
      'Obrigado pela avaliação',
      vote === 'yes'
        ? 'Ficamos felizes que a resposta tenha resolvido sua dúvida.'
        : 'Caso ainda precise, você pode abrir um chamado direto na categoria.'
    );
  };

  const handleCreateTicket = (data: {
    category: TicketCategory;
    priority: TicketPriority;
    subject: string;
    description: string;
  }): Ticket => {
    if (!session) {
      throw new Error('Sessão inválida');
    }

    const nowIso = new Date().toISOString();
    const protocol = generateNextProtocol(tickets);
    const newTicket: Ticket = {
      id: `tkt-${Date.now()}`,
      protocol,
      studentName: session.name,
      studentEmail: session.email,
      studentMatricula: session.matricula ?? '2024018472',
      studentCurso: session.curso ?? 'Engenharia de Software',
      studentPeriodo: session.periodo ?? '6º Período',
      category: data.category,
      priority: data.priority,
      subject: data.subject,
      description: data.description,
      status: 'Aberto',
      createdAt: nowIso,
      updatedAt: nowIso,
      slaDeadline: calculateSlaDeadline(data.priority),
      messages: [
        {
          id: `msg-${Date.now()}`,
          authorName: session.name,
          authorRole: 'student',
          content: data.description,
          timestamp: nowIso,
        },
      ],
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    saveTickets(updatedTickets);
    addToast(
      'success',
      `Chamado protocolado: ${protocol}`,
      `Categoria ${data.category} · Criticidade ${data.priority}`
    );
    return newTicket;
  };

  const handleStudentReplyTicket = (ticketId: string, message: string) => {
    if (!session) return;
    const nowIso = new Date().toISOString();
    const updatedTickets = tickets.map((t) => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        updatedAt: nowIso,
        messages: [
          ...t.messages,
          {
            id: `msg-${Date.now()}`,
            authorName: session.name,
            authorRole: 'student' as const,
            content: message,
            timestamp: nowIso,
          },
        ],
      };
    });
    setTickets(updatedTickets);
    saveTickets(updatedTickets);
    addToast('success', 'Complemento registrado no protocolo.');
  };

  const handleAttendantUpdateTicket = (
    ticketId: string,
    newStatus: TicketStatus,
    replyMessage: string,
    attachmentName?: string
  ) => {
    if (!session) return;
    const nowIso = new Date().toISOString();
    let updatedProtocol = '';

    const updatedTickets = tickets.map((t) => {
      if (t.id !== ticketId) return t;
      updatedProtocol = t.protocol;
      return {
        ...t,
        status: newStatus,
        updatedAt: nowIso,
        assignedTo: `${session.name} (CIA)`,
        messages: [
          ...t.messages,
          {
            id: `msg-${Date.now()}`,
            authorName: session.name,
            authorRole: 'attendant' as const,
            content: replyMessage,
            timestamp: nowIso,
            attachmentName,
          },
        ],
      };
    });

    setTickets(updatedTickets);
    saveTickets(updatedTickets);
    addToast(
      'success',
      `Protocolo ${updatedProtocol} atualizado`,
      `Novo status: ${newStatus}${attachmentName ? ` · Anexo: ${attachmentName}` : ''}`
    );
  };

  const selectedTicket =
    selectedTicketId
      ? tickets.find((t) => t.id === selectedTicketId) ?? null
      : null;

  return (
    <>
      {!session ? (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNotify={addToast}
        />
      ) : session.role === 'student' ? (
        <>
          <StudentPortal
            user={session}
            tickets={tickets}
            issuedDocs={issuedDocs}
            faqItems={faqItems}
            faqVotes={faqVotes}
            nowMs={nowMs}
            onLogout={handleLogout}
            onIssueDocument={handleIssueDocument}
            onOpenExistingDoc={(doc) => setActiveDocModal(doc)}
            onVoteFaq={handleVoteFaq}
            onCreateTicket={handleCreateTicket}
            onStudentReplyTicket={handleStudentReplyTicket}
          />
          <DocumentModal
            document={activeDocModal}
            user={session}
            onClose={() => setActiveDocModal(null)}
            onSendEmail={handleSendDocEmail}
          />
        </>
      ) : (
        <>
          <AttendantDashboard
            user={session}
            tickets={tickets}
            faqItems={faqItems}
            nowMs={nowMs}
            onLogout={handleLogout}
            onSelectTicket={(tkt) => setSelectedTicketId(tkt.id)}
          />
          <TicketResolutionModal
            key={selectedTicket?.id ?? 'closed'}
            ticket={selectedTicket}
            attendant={session}
            nowMs={nowMs}
            onClose={() => setSelectedTicketId(null)}
            onUpdateTicket={handleAttendantUpdateTicket}
          />
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
