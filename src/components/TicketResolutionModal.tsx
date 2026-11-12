import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Paperclip,
  Send,
  User,
  X,
} from 'lucide-react';
import { Ticket, TicketStatus, UserSession } from '../types/cia';
import {
  formatDateTimeBr,
  formatSlaRemaining,
  triggerAttachmentDownload,
} from '../utils/storage';
import { TicketTimeline } from './TicketTimeline';

interface TicketResolutionModalProps {
  ticket: Ticket | null;
  attendant: UserSession;
  nowMs: number;
  onClose: () => void;
  onUpdateTicket: (
    ticketId: string,
    newStatus: TicketStatus,
    replyMessage: string,
    attachmentName?: string
  ) => void;
}

const OFFICIAL_DOC_TEMPLATES = [
  'Nenhum anexo',
  'Boleto_Atualizado_UniCatolica.pdf',
  'Declaracao_Matricula_Assinada.pdf',
  'Comprovante_Isencao_Financeira.pdf',
  'Termo_Aditivo_Bolsa_2026_2.pdf',
  'Historico_Escolar_Oficial_Assinado.pdf',
];

export const TicketResolutionModal: React.FC<TicketResolutionModalProps> = ({
  ticket,
  attendant,
  nowMs,
  onClose,
  onUpdateTicket,
}) => {
  const [status, setStatus] = useState<TicketStatus>(
    ticket?.status ?? 'Em Análise'
  );
  const [replyText, setReplyText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('Nenhum anexo');
  const [customFileName, setCustomFileName] = useState('');

  if (!ticket) return null;

  const slaInfo = formatSlaRemaining(ticket.slaDeadline, ticket.status, nowMs);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFileName(file.name);
      setSelectedTemplate('Nenhum anexo');
    }
  };

  const handleSubmit = (e: React.FormEvent, forceConclude = false) => {
    e.preventDefault();
    const targetStatus: TicketStatus = forceConclude ? 'Concluído' : status;
    const attachment =
      customFileName.trim() ||
      (selectedTemplate !== 'Nenhum anexo' ? selectedTemplate : undefined);

    const finalReply =
      replyText.trim() ||
      (forceConclude
        ? `Atendimento concluído por ${attendant.name}. Demanda finalizada no sistema.`
        : `Status atualizado para "${targetStatus}" por ${attendant.name}.`);

    onUpdateTicket(ticket.id, targetStatus, finalReply, attachment);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolution-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B1D3A] text-white flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono">
              <span>{ticket.protocol}</span>
              <span aria-hidden="true">·</span>
              <span>{ticket.category}</span>
              <span aria-hidden="true">·</span>
              <span>Criticidade {ticket.priority}</span>
            </div>
            <h3
              id="resolution-modal-title"
              className="text-base font-semibold text-white truncate mt-0.5"
            >
              {ticket.subject}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de tratativa"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F4F6F9]">
          {/* Student Dossier + SLA Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0B1D3A]/5 border border-slate-200 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#164273]" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="text-sm font-semibold text-slate-900">
                  {ticket.studentName}
                </p>
                <p className="text-slate-600">
                  RA <span className="font-mono text-slate-800">{ticket.studentMatricula}</span> ·{' '}
                  {ticket.studentCurso} · {ticket.studentPeriodo}
                </p>
                <p className="font-mono text-slate-500">{ticket.studentEmail}</p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1 shrink-0">
              <div
                className={`inline-flex items-center gap-1.5 font-semibold font-mono tabular-nums ${
                  slaInfo.state === 'overdue'
                    ? 'text-[#DC2626]'
                    : slaInfo.state === 'critical'
                    ? 'text-[#D97706]'
                    : slaInfo.state === 'completed'
                    ? 'text-[#16A34A]'
                    : 'text-[#164273]'
                }`}
              >
                {slaInfo.state === 'overdue' || slaInfo.state === 'critical' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                ) : slaInfo.state === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 shrink-0" />
                )}
                <span>{slaInfo.label}</span>
              </div>
              <p className="text-slate-500 font-mono tabular-nums">
                Aberto em {formatDateTimeBr(ticket.createdAt)}
              </p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">
              Fluxo de Atendimento Atual
            </p>
            <TicketTimeline status={ticket.status} category={ticket.category} />
          </div>

          {/* Original Request & Conversation History */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Descrição inicial do solicitante
              </p>
              <p className="text-sm text-slate-800 leading-relaxed">
                {ticket.description}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500">
                Histórico de tratativas ({ticket.messages.length})
              </p>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {ticket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg border text-sm ${
                      msg.authorRole === 'attendant'
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">
                        {msg.authorName}{' '}
                        <span className="font-normal text-slate-500">
                          ({msg.authorRole === 'attendant' ? 'Atendente CIA' : 'Aluno'})
                        </span>
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatDateTimeBr(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                      {msg.content}
                    </p>
                    {msg.attachmentName && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerAttachmentDownload(
                            msg.attachmentName!,
                            ticket.protocol,
                            ticket.studentName
                          )
                        }
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#164273] hover:underline cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{msg.attachmentName}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Form */}
          <form
            id="resolution-form"
            onSubmit={(e) => handleSubmit(e, false)}
            className="bg-white border border-slate-200 rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ticket-status-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Atualizar etapa do chamado
                </label>
                <select
                  id="ticket-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Em Análise">Em Análise</option>
                  <option value="Encaminhado ao Financeiro">
                    Encaminhado ao Financeiro
                  </option>
                  <option value="Encaminhado à Secretaria">
                    Encaminhado à Secretaria
                  </option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="doc-template-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Anexar documento oficial (Opcional)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="doc-template-select"
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      if (e.target.value !== 'Nenhum anexo') {
                        setCustomFileName('');
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                  >
                    {OFFICIAL_DOC_TEMPLATES.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                  </select>
                  <label className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Arquivo</span>
                    <input
                      type="file"
                      onChange={handleFilePick}
                      className="sr-only"
                    />
                  </label>
                </div>
                {customFileName && (
                  <p className="mt-1 text-xs text-[#164273] font-mono truncate">
                    Selecionado: {customFileName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="attendant-reply"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Resposta oficial ao aluno
              </label>
              <textarea
                id="attendant-reply"
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Descreva a providência adotada, orientações ou parecer sobre a solicitação..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              form="resolution-form"
              className="px-4 py-2 border border-[#0B1D3A] text-[#0B1D3A] hover:bg-slate-50 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Salvar Atualização</span>
            </button>

            {ticket.status !== 'Concluído' && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Concluir Atendimento</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
