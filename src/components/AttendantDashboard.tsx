import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Inbox,
  LogOut,
  Menu,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Timer,
  X,
} from 'lucide-react';
import {
  FaqItem,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UserSession,
} from '../types/cia';
import { formatDateTimeBr, formatSlaRemaining } from '../utils/storage';
import { BrandMark } from './BrandMark';

type AttendantSection = 'queue' | 'sla_alerts' | 'faq_ref';

interface AttendantDashboardProps {
  user: UserSession;
  tickets: Ticket[];
  faqItems: FaqItem[];
  nowMs: number;
  onLogout: () => void;
  onSelectTicket: (ticket: Ticket) => void;
}

const PRIORITY_WEIGHT: Record<TicketPriority, number> = {
  Alta: 3,
  Média: 2,
  Baixa: 1,
};

const CATEGORY_FILTERS: Array<'Todas' | TicketCategory> = [
  'Todas',
  'Acadêmico',
  'Financeiro',
  'Requerimentos',
  'Bolsas e Benefícios',
];

const STATUS_FILTERS: Array<'Pendentes' | 'Todos' | TicketStatus> = [
  'Pendentes',
  'Todos',
  'Aberto',
  'Em Análise',
  'Encaminhado ao Financeiro',
  'Encaminhado à Secretaria',
  'Concluído',
];

export const AttendantDashboard: React.FC<AttendantDashboardProps> = ({
  user,
  tickets,
  faqItems,
  nowMs,
  onLogout,
  onSelectTicket,
}) => {
  const [activeSection, setActiveSection] = useState<AttendantSection>('queue');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Todas' | TicketCategory>(
    'Todas'
  );
  const [statusFilter, setStatusFilter] = useState<
    'Pendentes' | 'Todos' | TicketStatus
  >('Pendentes');

  // Dynamic KPIs & Capacity calculation
  const kpis = useMemo(() => {
    const pending = tickets.filter((t) => t.status !== 'Concluído');
    const criticalSla = pending.filter((t) => {
      const info = formatSlaRemaining(t.slaDeadline, t.status, nowMs);
      return info.state === 'overdue' || info.state === 'critical';
    });

    const financialPending = pending.filter(
      (t) =>
        t.category === 'Financeiro' ||
        t.status === 'Encaminhado ao Financeiro'
    );
    const financialCritical = financialPending.filter((t) => {
      const info = formatSlaRemaining(t.slaDeadline, t.status, nowMs);
      return info.state === 'overdue' || info.state === 'critical';
    });

    // Dynamic capacity evaluation by sector
    const isFinancialOverloaded =
      financialPending.length >= 2 || financialCritical.length >= 1;
    const isGeneralOverloaded = criticalSla.length >= 3 || pending.length >= 8;

    // Average first-response calculation from messages
    let totalResponseMs = 0;
    let responseCount = 0;
    for (const t of tickets) {
      const firstReply = t.messages.find((m) => m.authorRole === 'attendant');
      if (firstReply) {
        const diff =
          new Date(firstReply.timestamp).getTime() -
          new Date(t.createdAt).getTime();
        if (diff > 0) {
          totalResponseMs += diff;
          responseCount += 1;
        }
      }
    }
    const avgMin =
      responseCount > 0
        ? Math.round(totalResponseMs / responseCount / 60000)
        : 94;
    const avgHours = Math.floor(avgMin / 60);
    const avgRemMin = avgMin % 60;
    const avgFormatted =
      avgHours > 0 ? `${avgHours}h ${String(avgRemMin).padStart(2, '0')}m` : `${avgMin}m`;

    return {
      pendingCount: pending.length,
      criticalCount: criticalSla.length,
      avgResponse: avgFormatted,
      isFinancialOverloaded,
      isGeneralOverloaded,
      financialPendingCount: financialPending.length,
      criticalList: criticalSla,
    };
  }, [tickets, nowMs]);

  // Sorted prioritized queue
  const filteredSortedTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const baseList =
      activeSection === 'sla_alerts'
        ? tickets.filter((t) => {
            if (t.status === 'Concluído') return false;
            const sla = formatSlaRemaining(t.slaDeadline, t.status, nowMs);
            return (
              sla.state === 'overdue' ||
              sla.state === 'critical' ||
              sla.state === 'warning'
            );
          })
        : tickets;

    return baseList
      .filter((t) => {
        if (activeSection !== 'sla_alerts') {
          if (statusFilter === 'Pendentes' && t.status === 'Concluído') {
            return false;
          }
          if (
            statusFilter !== 'Pendentes' &&
            statusFilter !== 'Todos' &&
            t.status !== statusFilter
          ) {
            return false;
          }
        }

        if (categoryFilter !== 'Todas' && t.category !== categoryFilter) {
          return false;
        }

        if (!q) return true;
        return (
          t.protocol.toLowerCase().includes(q) ||
          t.studentName.toLowerCase().includes(q) ||
          t.studentMatricula.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // 1. Concluded tickets always go to the bottom
        const aDone = a.status === 'Concluído' ? 1 : 0;
        const bDone = b.status === 'Concluído' ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;

        // 2. Priority weight (Alta > Média > Baixa)
        const pDiff =
          PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (pDiff !== 0) return pDiff;

        // 3. Nearest / most overdue SLA deadline first
        return (
          new Date(a.slaDeadline).getTime() -
          new Date(b.slaDeadline).getTime()
        );
      });
  }, [
    tickets,
    activeSection,
    statusFilter,
    categoryFilter,
    searchQuery,
    nowMs,
  ]);

  const navItems: Array<{
    id: AttendantSection;
    label: string;
    icon: React.FC<{ className?: string }>;
    count?: number;
  }> = [
    {
      id: 'queue',
      label: 'Fila Priorizada',
      icon: Inbox,
      count: kpis.pendingCount,
    },
    {
      id: 'sla_alerts',
      label: 'Alertas de SLA',
      icon: ShieldAlert,
      count: kpis.criticalCount,
    },
    {
      id: 'faq_ref',
      label: 'Base FAQ (Consulta)',
      icon: BookOpen,
    },
  ];

  const sectionTitle =
    navItems.find((n) => n.id === activeSection)?.label ?? 'Painel Operacional';

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-[#0B1D3A] text-white flex-col justify-between shrink-0">
        <div>
          <div className="px-6 py-5 border-b border-white/10">
            <BrandMark variant="light" />
          </div>

          <nav aria-label="Navegação do Atendente CIA" className="p-4 space-y-1">
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
                    <span
                      className={`font-mono tabular-nums text-xs ${
                        item.id === 'sla_alerts'
                          ? 'text-amber-300 font-semibold'
                          : 'text-sky-200'
                      }`}
                    >
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
            <p className="text-slate-400 truncate">
              {user.setor ?? 'CIA · Atendimento Integrado'}
            </p>
            <p className="font-mono text-slate-400 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 w-full px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair do painel</span>
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
                        <span className="font-mono tabular-nums text-xs">
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

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract */}
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
                <span>Painel Operacional CIA</span>
                <span aria-hidden="true">/</span>
                <span className="text-slate-800 font-medium">{sectionTitle}</span>
              </div>
              <h1 className="text-lg font-bold text-[#0B1D3A] tracking-tight truncate">
                Gestão de Chamados e SLA — {user.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 whitespace-nowrap">
              <span>{user.setor ?? 'Atendimento Integrado'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-800">{user.email}</span>
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

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* 4-Column KPI & Capacity Strip */}
          <section
            aria-label="Indicadores operacionais em tempo real"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {/* KPI 1: Pendentes */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Total de Tickets Pendentes</span>
                <Inbox className="w-4 h-4 text-[#164273]" />
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-[#0B1D3A] font-mono tabular-nums">
                  {kpis.pendingCount}
                </span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {tickets.length} totais na base
                </span>
              </div>
            </div>

            {/* KPI 2: SLA Crítico */}
            <div
              className={`bg-white border rounded-xl p-5 flex flex-col justify-between gap-2 ${
                kpis.criticalCount > 0
                  ? 'border-red-300 bg-red-50/40'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Tickets com SLA Crítico</span>
                <AlertTriangle
                  className={`w-4 h-4 ${
                    kpis.criticalCount > 0 ? 'text-[#DC2626]' : 'text-slate-400'
                  }`}
                />
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    kpis.criticalCount > 0 ? 'text-[#DC2626]' : 'text-[#0B1D3A]'
                  }`}
                >
                  {kpis.criticalCount}
                </span>
                <span className="text-xs text-slate-600">
                  Estourado ou &lt; 2h
                </span>
              </div>
            </div>

            {/* KPI 3: Tempo Médio de Resposta */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Tempo Médio de Resposta</span>
                <Timer className="w-4 h-4 text-[#164273]" />
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-[#0B1D3A] font-mono tabular-nums">
                  {kpis.avgResponse}
                </span>
                <span className="text-xs text-slate-500">
                  1ª triagem no ciclo atual
                </span>
              </div>
            </div>

            {/* KPI 4: Indicador de Capacidade da Equipe */}
            <div
              className={`border rounded-xl p-5 flex flex-col justify-between gap-2 ${
                kpis.isFinancialOverloaded || kpis.isGeneralOverloaded
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-emerald-50/50 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Capacidade da Equipe</span>
                {kpis.isFinancialOverloaded || kpis.isGeneralOverloaded ? (
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-bold leading-snug ${
                    kpis.isFinancialOverloaded || kpis.isGeneralOverloaded
                      ? 'text-amber-900'
                      : 'text-emerald-900'
                  }`}
                >
                  {kpis.isFinancialOverloaded
                    ? 'Alerta de Sobrecarga — Necessário reforço no setor Financeiro'
                    : kpis.isGeneralOverloaded
                    ? 'Alerta de Volume — Priorizar triagem imediata'
                    : 'Operação Normal — Fila dentro da capacidade'}
                </p>
                <p className="text-xs text-slate-600 mt-1 font-mono tabular-nums">
                  {kpis.financialPendingCount} pendente(s) no Financeiro
                </p>
              </div>
            </div>
          </section>

          {/* QUEUE & SLA ALERTS VIEW */}
          {activeSection !== 'faq_ref' ? (
            <section
              aria-labelledby="queue-heading"
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              {/* Toolbar: Search & Filters */}
              <div className="p-5 border-b border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2
                      id="queue-heading"
                      className="text-base font-bold text-[#0B1D3A]"
                    >
                      {activeSection === 'sla_alerts'
                        ? 'Chamados com Alerta ou Vencimento de SLA'
                        : 'Fila de Atendimento Priorizada'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ordenação automática por criticidade (Alta → Baixa) e
                      menor prazo de SLA restante.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar protocolo, aluno, RA ou assunto..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Category Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    {CATEGORY_FILTERS.map((cat) => {
                      const active = categoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategoryFilter(cat)}
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

                  {activeSection === 'queue' && (
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                      <label htmlFor="status-filter" className="sr-only">
                        Filtrar por status
                      </label>
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value as 'Pendentes' | 'Todos' | TicketStatus
                          )
                        }
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                      >
                        {STATUS_FILTERS.map((st) => (
                          <option key={st} value={st}>
                            Status: {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Priority Table */}
              {filteredSortedTickets.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-800">
                    Nenhum chamado encontrado com os filtros atuais.
                  </p>
                  <p className="text-xs text-slate-500">
                    Limpe a pesquisa ou altere o filtro de status para
                    visualizar outros protocolos.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                        <th className="py-3 px-4 whitespace-nowrap">Protocolo</th>
                        <th className="py-3 px-4">Solicitante</th>
                        <th className="py-3 px-4">Categoria & Assunto</th>
                        <th className="py-3 px-4 whitespace-nowrap">Criticidade</th>
                        <th className="py-3 px-4 whitespace-nowrap">Status Atual</th>
                        <th className="py-3 px-4 whitespace-nowrap">Prazo SLA</th>
                        <th className="py-3 px-4 text-right whitespace-nowrap">
                          Ação
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {filteredSortedTickets.map((tkt) => {
                        const sla = formatSlaRemaining(
                          tkt.slaDeadline,
                          tkt.status,
                          nowMs
                        );
                        const rowHighlight =
                          sla.state === 'overdue'
                            ? 'bg-red-50/50 hover:bg-red-50/80'
                            : sla.state === 'critical'
                            ? 'bg-amber-50/50 hover:bg-amber-50/80'
                            : 'hover:bg-slate-50';

                        return (
                          <tr
                            key={tkt.id}
                            onClick={() => onSelectTicket(tkt)}
                            className={`transition-colors cursor-pointer ${rowHighlight}`}
                          >
                            <td className="py-3 px-4 font-mono tabular-nums text-xs font-semibold text-[#164273] whitespace-nowrap">
                              {tkt.protocol}
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-900 text-sm whitespace-nowrap">
                                {tkt.studentName}
                              </div>
                              <div className="text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
                                RA {tkt.studentMatricula} · {tkt.studentCurso}
                              </div>
                            </td>

                            <td className="py-3 px-4 max-w-xs">
                              <div className="text-xs text-slate-500">
                                {tkt.category}
                              </div>
                              <div className="text-sm font-medium text-slate-900 truncate">
                                {tkt.subject}
                              </div>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`text-xs font-semibold ${
                                  tkt.priority === 'Alta'
                                    ? 'text-[#DC2626]'
                                    : tkt.priority === 'Média'
                                    ? 'text-[#D97706]'
                                    : 'text-slate-600'
                                }`}
                              >
                                {tkt.priority}
                              </span>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`text-xs font-medium ${
                                  tkt.status === 'Concluído'
                                    ? 'text-[#16A34A]'
                                    : 'text-slate-800'
                                }`}
                              >
                                {tkt.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <div
                                className={`text-xs font-mono tabular-nums font-semibold flex items-center gap-1.5 ${
                                  sla.state === 'overdue'
                                    ? 'text-[#DC2626]'
                                    : sla.state === 'critical'
                                    ? 'text-[#D97706]'
                                    : sla.state === 'warning'
                                    ? 'text-amber-700'
                                    : sla.state === 'completed'
                                    ? 'text-[#16A34A]'
                                    : 'text-slate-700'
                                }`}
                              >
                                {sla.state === 'overdue' ||
                                sla.state === 'critical' ? (
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                ) : sla.state === 'completed' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span>{sla.label}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                                {formatDateTimeBr(tkt.createdAt)}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectTicket(tkt);
                                }}
                                className="px-3 py-1.5 bg-[#0B1D3A] hover:bg-[#164273] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                              >
                                Tratar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            /* FAQ REFERENCE TAB FOR ATTENDANTS */
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#0B1D3A]">
                  Base de Conhecimento Institucional (Consulta Rápida)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Artigos publicados aos alunos no Portal de Autoatendimento e
                  respectivos índices de resolução.
                </p>
              </div>
              <div className="divide-y divide-slate-200">
                {faqItems.map((item) => (
                  <div key={item.id} className="py-4 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#164273]">
                        {item.category}
                      </span>
                      <span className="font-mono tabular-nums">
                        Útil: {item.helpfulYes} Sim · {item.helpfulNo} Não
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {item.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
