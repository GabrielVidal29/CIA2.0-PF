import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquarePlus,
  Receipt,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import {
  DocumentType,
  FaqItem,
  IssuedDocument,
  Ticket,
  TicketCategory,
  TicketPriority,
  UserSession,
} from '../types/cia';
import {
  formatDateTimeBr,
  formatSlaRemaining,
  triggerAttachmentDownload,
} from '../utils/storage';
import { BrandMark } from './BrandMark';
import { TicketTimeline } from './TicketTimeline';

type StudentSection = 'overview' | 'documents' | 'faq' | 'tickets';

interface StudentPortalProps {
  user: UserSession;
  tickets: Ticket[];
  issuedDocs: IssuedDocument[];
  faqItems: FaqItem[];
  faqVotes: Record<string, 'yes' | 'no'>;
  nowMs: number;
  onLogout: () => void;
  onIssueDocument: (type: DocumentType) => void;
  onOpenExistingDoc: (doc: IssuedDocument) => void;
  onVoteFaq: (faqId: string, vote: 'yes' | 'no') => void;
  onCreateTicket: (data: {
    category: TicketCategory;
    priority: TicketPriority;
    subject: string;
    description: string;
  }) => Ticket;
  onStudentReplyTicket: (ticketId: string, message: string) => void;
}

const CATEGORIES: Array<'Todas' | TicketCategory> = [
  'Todas',
  'Acadêmico',
  'Financeiro',
  'Requerimentos',
  'Bolsas e Benefícios',
];

const DOC_CARDS: Array<{
  type: DocumentType;
  title: string;
  subtitle: string;
  actionLabel: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    type: 'boleto',
    title: '2ª Via de Boleto',
    subtitle: 'Mensalidade 11/2026 · Venc. 18/11 · R$ 1.248,90',
    actionLabel: 'Emitir boleto agora',
    icon: Receipt,
  },
  {
    type: 'declaracao_matricula',
    title: 'Declaração de Matrícula',
    subtitle: 'Vínculo regular 2026/2 com autenticação digital',
    actionLabel: 'Gerar declaração',
    icon: FileCheck2,
  },
  {
    type: 'historico_escolar',
    title: 'Histórico Escolar',
    subtitle: 'Parcial oficial · CR 8,74 · 64,2% integralizado',
    actionLabel: 'Emitir histórico',
    icon: FileSpreadsheet,
  },
];

export const StudentPortal: React.FC<StudentPortalProps> = ({
  user,
  tickets,
  issuedDocs,
  faqItems,
  faqVotes,
  nowMs,
  onLogout,
  onIssueDocument,
  onOpenExistingDoc,
  onVoteFaq,
  onCreateTicket,
  onStudentReplyTicket,
}) => {
  const [activeSection, setActiveSection] = useState<StudentSection>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // FAQ state
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState<'Todas' | TicketCategory>('Todas');
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqItems[0]?.id ?? null);

  // New Ticket Form state
  const [newCategory, setNewCategory] = useState<TicketCategory>('Acadêmico');
  const [newPriority, setNewPriority] = useState<TicketPriority>('Média');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const studentTickets = useMemo(() => {
    return tickets
      .filter(
        (t) =>
          t.studentEmail.toLowerCase() === user.email.toLowerCase() ||
          t.studentMatricula === user.matricula
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [tickets, user.email, user.matricula]);

  const activeTicketsCount = useMemo(
    () => studentTickets.filter((t) => t.status !== 'Concluído').length,
    [studentTickets]
  );

  const filteredFaq = useMemo(() => {
    const query = faqSearch.trim().toLowerCase();
    return faqItems.filter((item) => {
      const matchesCat =
        faqCategory === 'Todas' || item.category === faqCategory;
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }, [faqItems, faqCategory, faqSearch]);

  const handleOpenTicketFromFaq = (category: TicketCategory) => {
    setNewCategory(category);
    setActiveSection('tickets');
  };

  const handleTicketFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;
    const created = onCreateTicket({
      category: newCategory,
      priority: newPriority,
      subject: newSubject.trim(),
      description: newDescription.trim(),
    });
    setNewSubject('');
    setNewDescription('');
    setExpandedTicketId(created.id);
    setActiveSection('tickets');
  };

  const handleSendReply = (ticketId: string) => {
    const msg = (replyDrafts[ticketId] ?? '').trim();
    if (!msg) return;
    onStudentReplyTicket(ticketId, msg);
    setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
  };

  const navItems: Array<{
    id: StudentSection;
    label: string;
    icon: React.FC<{ className?: string }>;
    count?: number;
  }> = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'documents', label: 'Documentos 1-Clique', icon: FileText },
    { id: 'faq', label: 'FAQ Inteligente', icon: BookOpen },
    {
      id: 'tickets',
      label: 'Meus Chamados',
      icon: MessageSquarePlus,
      count: activeTicketsCount,
    },
  ];

  const sectionTitle =
    navItems.find((n) => n.id === activeSection)?.label ?? 'Portal do Aluno';

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-[#0B1D3A] text-white flex-col justify-between shrink-0">
        <div>
          <div className="px-6 py-5 border-b border-white/10">
            <BrandMark variant="light" />
          </div>

          <nav aria-label="Navegação do Portal do Aluno" className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#164273] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="font-mono tabular-nums text-xs text-sky-200">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-slate-300 space-y-0.5">
            <p className="font-semibold text-white truncate">{user.name}</p>
            <p className="font-mono text-slate-400">RA {user.matricula}</p>
            <p className="text-slate-400 truncate">{user.curso}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 w-full px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#0B1D3A] text-white flex flex-col justify-between p-4 z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <BrandMark variant="light" />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Fechar menu"
                  className="p-1.5 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#164273] text-white'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </span>
                      {typeof item.count === 'number' && item.count > 0 && (
                        <span className="font-mono tabular-nums text-xs text-sky-200">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb/Greeting — Student Info — Logout Action */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Abrir navegação"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                <span>Portal do Aluno</span>
                <span aria-hidden="true">/</span>
                <span className="text-slate-800 font-medium">{sectionTitle}</span>
              </div>
              <h1 className="text-lg font-bold text-[#0B1D3A] tracking-tight truncate">
                Olá, {user.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 whitespace-nowrap">
              <span className="font-mono tabular-nums font-medium text-slate-900">
                RA {user.matricula}
              </span>
              <span aria-hidden="true">·</span>
              <span>{user.curso}</span>
              {user.periodo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{user.periodo}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#0B1D3A] border border-slate-300 hover:border-slate-400 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Workspace Viewport */}
        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-8">
          {/* SECTION: OVERVIEW & DOCUMENTS */}
          {(activeSection === 'overview' || activeSection === 'documents') && (
            <section aria-labelledby="quick-docs-heading" className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2
                    id="quick-docs-heading"
                    className="text-xl font-bold text-[#0B1D3A] tracking-tight"
                  >
                    Acesso Rápido — Autoatendimento 1-Clique
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Emita documentos oficiais e guias financeiras em tempo real,
                    sem necessidade de abrir chamado.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DOC_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.type}
                      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-5 hover:border-[#164273]/50 transition-colors"
                    >
                      <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#0B1D3A]/5 border border-slate-200 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#164273]" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {card.subtitle}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onIssueDocument(card.type)}
                        className="w-full py-2 px-4 bg-[#0B1D3A] hover:bg-[#164273] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {card.actionLabel}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Recent Issued Documents History */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Documentos emitidos recentemente
                  </h3>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {issuedDocs.length} registro(s)
                  </span>
                </div>
                {issuedDocs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Nenhum documento emitido nesta conta ainda. Utilize os
                    cartões acima para gerar na hora.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {issuedDocs
                      .slice(0, activeSection === 'documents' ? 20 : 3)
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {doc.title}
                            </p>
                            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5 font-mono tabular-nums">
                              <span>{doc.protocol}</span>
                              <span aria-hidden="true">·</span>
                              <span>{formatDateTimeBr(doc.issuedAt)}</span>
                              {doc.sentToEmail && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-[#16A34A] font-sans font-medium">
                                    Enviado para e-mail institucional
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenExistingDoc(doc)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#164273] hover:bg-[#164273]/5 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Visualizar / Baixar
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* OVERVIEW: COMPACT SUMMARY OF ACTIVE TICKETS + FAQ JUMP */}
          {activeSection === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Active Tickets Preview */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0B1D3A]">
                      Acompanhamento de Chamados
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Atualizações em tempo real do atendimento CIA
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('tickets')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#0B1D3A] hover:bg-[#164273] text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Abrir chamado / Ver todos
                  </button>
                </div>

                {studentTickets.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <p className="text-sm text-slate-600">
                      Você não possui protocolos abertos no momento.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSection('tickets')}
                      className="px-4 py-2 text-xs font-semibold bg-[#0B1D3A] text-white rounded-lg cursor-pointer"
                    >
                      Criar primeira solicitação
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {studentTickets.slice(0, 3).map((tkt) => {
                      const sla = formatSlaRemaining(
                        tkt.slaDeadline,
                        tkt.status,
                        nowMs
                      );
                      return (
                        <div
                          key={tkt.id}
                          className="p-5 space-y-3 hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                                <span className="font-mono font-semibold text-[#164273]">
                                  {tkt.protocol}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{tkt.category}</span>
                                <span aria-hidden="true">·</span>
                                <span>Criticidade {tkt.priority}</span>
                              </div>
                              <h4 className="text-sm font-semibold text-slate-900 mt-1">
                                {tkt.subject}
                              </h4>
                            </div>

                            <div
                              className={`text-xs font-mono tabular-nums font-medium flex items-center gap-1.5 shrink-0 ${
                                sla.state === 'overdue'
                                  ? 'text-[#DC2626]'
                                  : sla.state === 'critical'
                                  ? 'text-[#D97706]'
                                  : sla.state === 'completed'
                                  ? 'text-[#16A34A]'
                                  : 'text-slate-600'
                              }`}
                            >
                              {sla.state === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : sla.state === 'overdue' ||
                                sla.state === 'critical' ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              <span>{sla.shortLabel}</span>
                            </div>
                          </div>

                          <TicketTimeline
                            status={tkt.status}
                            category={tkt.category}
                          />

                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedTicketId(tkt.id);
                                setActiveSection('tickets');
                              }}
                              className="text-xs font-semibold text-[#164273] hover:underline cursor-pointer"
                            >
                              Ver detalhes e mensagens
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick FAQ Panel */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-[#0B1D3A]">
                    Dúvidas Frequentes (FAQ)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSection('faq')}
                    className="text-xs font-semibold text-[#164273] hover:underline whitespace-nowrap cursor-pointer"
                  >
                    Ver base completa
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={faqSearch}
                    onChange={(e) => {
                      setFaqSearch(e.target.value);
                      if (e.target.value.trim().length > 1) {
                        setActiveSection('faq');
                      }
                    }}
                    placeholder="Pesquisar dúvida antes de abrir ticket..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                  />
                </div>

                <div className="divide-y divide-slate-200">
                  {faqItems.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setOpenFaqId(item.id);
                        setActiveSection('faq');
                      }}
                      className="w-full py-3 text-left flex items-start justify-between gap-3 hover:text-[#164273] transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="text-xs text-slate-500 block">
                          {item.category}
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {item.question}
                        </span>
                      </div>
                      <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: FAQ INTELIGENTE */}
          {activeSection === 'faq' && (
            <section aria-labelledby="faq-heading" className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2
                    id="faq-heading"
                    className="text-xl font-bold text-[#0B1D3A] tracking-tight"
                  >
                    Base de Conhecimento (FAQ Inteligente)
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Consulte orientações oficiais por área ou pesquise por
                    palavra-chave antes de abrir um chamado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('tickets')}
                  className="px-4 py-2 text-xs font-semibold bg-[#0B1D3A] hover:bg-[#164273] text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Não encontrei · Abrir chamado
                </button>
              </div>

              {/* Search + Category Segmented Controls */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Buscar por boleto, declaração, ProUni, FIES, revisão de nota, aproveitamento..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                  />
                </div>

                <div
                  role="tablist"
                  aria-label="Filtrar FAQ por categoria"
                  className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit"
                >
                  {CATEGORIES.map((cat) => {
                    const active = faqCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setFaqCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-white text-[#0B1D3A] shadow-sm font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accordion List */}
              {filteredFaq.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
                  <p className="text-sm font-medium text-slate-800">
                    Nenhuma resposta encontrada para "{faqSearch}".
                  </p>
                  <p className="text-xs text-slate-500">
                    Nossa equipe do CIA pode analisar sua dúvida diretamente via
                    protocolo.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenTicketFromFaq(
                        faqCategory === 'Todas' ? 'Acadêmico' : faqCategory
                      )
                    }
                    className="px-4 py-2 bg-[#0B1D3A] hover:bg-[#164273] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Abrir chamado para equipe CIA
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
                  {filteredFaq.map((item) => {
                    const isOpen = openFaqId === item.id;
                    const userVote = faqVotes[item.id];
                    return (
                      <div key={item.id} className="transition-colors">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() =>
                            setOpenFaqId(isOpen ? null : item.id)
                          }
                          className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <span className="text-xs text-[#164273] font-medium block">
                              {item.category}
                            </span>
                            <span className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5 block">
                              {item.question}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-[#0B1D3A]' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-5 pt-1 space-y-4 bg-slate-50/50">
                            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
                              {item.answer}
                            </p>

                            {item.relatedDoc && (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => onIssueDocument(item.relatedDoc!)}
                                  className="px-3.5 py-2 bg-[#0B1D3A] hover:bg-[#164273] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
                                >
                                  <FileCheck2 className="w-4 h-4" />
                                  <span>Emitir documento automaticamente agora</span>
                                </button>
                              </div>
                            )}

                            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-medium text-slate-600">
                                  Essa resposta ajudou?
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onVoteFaq(item.id, 'yes')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                                      userVote === 'yes'
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    <span>Sim</span>
                                    <span className="font-mono tabular-nums text-slate-500">
                                      ({item.helpfulYes})
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onVoteFaq(item.id, 'no')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                                      userVote === 'no'
                                        ? 'bg-red-50 border-red-300 text-red-800'
                                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                    <span>Não</span>
                                    <span className="font-mono tabular-nums text-slate-500">
                                      ({item.helpfulNo})
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {userVote === 'no' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenTicketFromFaq(item.category)
                                  }
                                  className="text-xs font-semibold text-[#164273] hover:underline cursor-pointer"
                                >
                                  Abrir chamado em {item.category} →
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* SECTION: MEUS CHAMADOS & ABERTURA DE TICKET */}
          {activeSection === 'tickets' && (
            <section
              aria-labelledby="tickets-heading"
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* New Ticket Form */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div>
                  <h2
                    id="tickets-heading"
                    className="text-lg font-bold text-[#0B1D3A] tracking-tight"
                  >
                    Abrir Nova Solicitação
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Gera protocolo único e prazo de SLA monitorado pela equipe
                    CIA.
                  </p>
                </div>

                <form onSubmit={handleTicketFormSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="ticket-category"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Categoria do atendimento
                    </label>
                    <select
                      id="ticket-category"
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(e.target.value as TicketCategory)
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                    >
                      <option value="Acadêmico">Acadêmico</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Requerimentos">Requerimentos</option>
                      <option value="Bolsas e Benefícios">
                        Bolsas e Benefícios
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-priority"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Criticidade / Urgência (SLA)
                    </label>
                    <select
                      id="ticket-priority"
                      value={newPriority}
                      onChange={(e) =>
                        setNewPriority(e.target.value as TicketPriority)
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                    >
                      <option value="Baixa">Baixa — Prazo SLA 48 horas</option>
                      <option value="Média">Média — Prazo SLA 24 horas</option>
                      <option value="Alta">
                        Alta — Prazo SLA 4 horas (Bloqueio/Vencimento hoje)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-subject"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Assunto resumido
                    </label>
                    <input
                      id="ticket-subject"
                      type="text"
                      required
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Ex.: Correção de desconto no boleto de Dezembro"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-description"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Descrição detalhada
                    </label>
                    <textarea
                      id="ticket-description"
                      required
                      rows={4}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Informe detalhes, disciplinas, competência do boleto ou datas para agilizar a análise..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#0B1D3A] hover:bg-[#164273] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Protocolar Chamado</span>
                  </button>
                </form>
              </div>

              {/* Ticket List + Timelines */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0B1D3A]">
                    Meus Chamados ({studentTickets.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Clique em um protocolo para ver respostas
                  </span>
                </div>

                {studentTickets.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
                    Nenhum chamado registrado para {user.name}. Utilize o
                    formulário ao lado para protocolar sua primeira solicitação.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentTickets.map((tkt) => {
                      const isExpanded = expandedTicketId === tkt.id;
                      const sla = formatSlaRemaining(
                        tkt.slaDeadline,
                        tkt.status,
                        nowMs
                      );

                      return (
                        <div
                          key={tkt.id}
                          className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTicketId(isExpanded ? null : tkt.id)
                            }
                            className="w-full p-5 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                                  <span className="font-mono font-semibold text-[#164273]">
                                    {tkt.protocol}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>{tkt.category}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>Criticidade {tkt.priority}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">
                                    {formatDateTimeBr(tkt.createdAt)}
                                  </span>
                                </div>
                                <h4 className="text-base font-bold text-slate-900 mt-1">
                                  {tkt.subject}
                                </h4>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span
                                  className={`text-xs font-mono tabular-nums font-semibold flex items-center gap-1.5 ${
                                    sla.state === 'overdue'
                                      ? 'text-[#DC2626]'
                                      : sla.state === 'critical'
                                      ? 'text-[#D97706]'
                                      : sla.state === 'completed'
                                      ? 'text-[#16A34A]'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {sla.state === 'completed' ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : sla.state === 'overdue' ||
                                    sla.state === 'critical' ? (
                                    <AlertTriangle className="w-4 h-4" />
                                  ) : (
                                    <Clock className="w-4 h-4" />
                                  )}
                                  <span>{sla.label}</span>
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 text-slate-400 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <TicketTimeline
                                status={tkt.status}
                                category={tkt.category}
                              />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-5 pb-5 pt-4 border-t border-slate-200 bg-slate-50/60 space-y-4">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 mb-1">
                                  Descrição da solicitação
                                </p>
                                <p className="text-sm text-slate-800 leading-relaxed">
                                  {tkt.description}
                                </p>
                              </div>

                              <div className="space-y-2.5">
                                <p className="text-xs font-semibold text-slate-500">
                                  Histórico de atendimento ({tkt.messages.length})
                                </p>
                                {tkt.messages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={`p-3.5 rounded-lg border text-sm ${
                                      msg.authorRole === 'attendant'
                                        ? 'bg-white border-[#164273]/30'
                                        : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                                      <span className="font-semibold text-slate-900">
                                        {msg.authorName}{' '}
                                        <span className="font-normal text-slate-500">
                                          (
                                          {msg.authorRole === 'attendant'
                                            ? 'Atendente CIA'
                                            : 'Você'}
                                          )
                                        </span>
                                      </span>
                                      <span className="font-mono tabular-nums">
                                        {formatDateTimeBr(msg.timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                                      {msg.content}
                                    </p>
                                    {msg.attachmentName && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          triggerAttachmentDownload(
                                            msg.attachmentName!,
                                            tkt.protocol,
                                            tkt.studentName
                                          )
                                        }
                                        className="mt-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md inline-flex items-center gap-2 text-xs font-semibold text-[#164273] cursor-pointer"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Baixar {msg.attachmentName}</span>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {tkt.status !== 'Concluído' && (
                                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    value={replyDrafts[tkt.id] ?? ''}
                                    onChange={(e) =>
                                      setReplyDrafts((prev) => ({
                                        ...prev,
                                        [tkt.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Adicionar informação complementar ao protocolo..."
                                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSendReply(tkt.id)}
                                    className="px-4 py-2 bg-[#0B1D3A] hover:bg-[#164273] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    Enviar complemento
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
