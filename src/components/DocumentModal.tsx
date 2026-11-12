import React from 'react';
import {
  CheckCircle2,
  Download,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react';
import { IssuedDocument, UserSession } from '../types/cia';
import {
  formatDateTimeBr,
  triggerPrintableDocumentDownload,
} from '../utils/storage';

interface DocumentModalProps {
  document: IssuedDocument | null;
  user: UserSession;
  onClose: () => void;
  onSendEmail: (doc: IssuedDocument) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  document: doc,
  user,
  onClose,
  onSendEmail,
}) => {
  if (!doc) return null;

  const isSent = Boolean(doc.sentToEmail);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-[#0B1D3A] text-white">
          <div className="min-w-0">
            <div className="text-xs text-slate-300 font-mono">
              {doc.protocol} · Emitido em {formatDateTimeBr(doc.issuedAt)}
            </div>
            <h3
              id="doc-modal-title"
              className="text-base font-semibold text-white truncate mt-0.5"
            >
              {doc.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar visualização do documento"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulated Official Document Sheet */}
        <div className="p-6 overflow-y-auto bg-[#F4F6F9] flex-1">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <p className="text-sm font-bold text-[#0B1D3A]">
                  UniCatólica — Centro Universitário Católica do Tocantins
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secretaria Geral e Tesouraria · Documento Eletrônico Oficial
                </p>
              </div>
              <div className="text-right text-xs text-slate-600 font-mono tabular-nums">
                <div>RA: {user.matricula ?? doc.studentMatricula}</div>
                <div>{user.curso ?? doc.studentCurso}</div>
              </div>
            </div>

            {doc.type === 'boleto' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 block">Competência</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      11/2026
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Vencimento</span>
                    <span className="font-semibold text-slate-900 font-mono tabular-nums mt-0.5 block">
                      18/11/2026
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Valor Nominal</span>
                    <span className="font-semibold text-slate-900 font-mono tabular-nums mt-0.5 block">
                      R$ 1.248,90
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Situação</span>
                    <span className="font-semibold text-[#164273] mt-0.5 block">
                      Em aberto
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1.5">
                    Linha Digitável (Copia e Cola Bancário)
                  </p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs sm:text-sm text-slate-900 select-all break-all">
                    23793.38128 60082.910248 07000.063308 1 99040000124890
                  </div>
                </div>

                {/* Crisp vector barcode representation */}
                <div className="pt-2">
                  <svg
                    viewBox="0 0 360 44"
                    className="w-full h-11 text-slate-900"
                    aria-label="Representação visual do código de barras do boleto"
                  >
                    {Array.from({ length: 72 }).map((_, idx) => {
                      const width = idx % 5 === 0 ? 3 : idx % 2 === 0 ? 2 : 1;
                      const x = idx * 5;
                      return (
                        <rect
                          key={idx}
                          x={x}
                          y={2}
                          width={width}
                          height={40}
                          fill="currentColor"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {doc.type === 'declaracao_matricula' && (
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <h4 className="font-display text-base font-bold text-[#0B1D3A]">
                  Declaração de Matrícula Ativa — 2026/2
                </h4>
                <p>
                  Declaramos, para os devidos fins comprobatórios junto a órgãos
                  públicos, empresas concedentes de estágio ou instituições
                  financeiras, que{' '}
                  <strong className="text-slate-900">{user.name}</strong>,
                  portador(a) do Registro Acadêmico (RA) nº{' '}
                  <strong className="font-mono text-slate-900">
                    {user.matricula ?? doc.studentMatricula}
                  </strong>
                  , encontra-se regularmente matriculado(a) no curso de graduação
                  em <strong className="text-slate-900">{user.curso ?? doc.studentCurso}</strong>{' '}
                  ({user.periodo ?? '6º Período'}), turno Noturno, no período
                  letivo 2026/2 do Centro Universitário Católica do Tocantins.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block">Situação</span>
                    <span className="font-semibold text-[#16A34A] mt-0.5 block">
                      Matrícula Regular Ativa
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block">Campus</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      Unidade I — Palmas/TO
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block">Validade</span>
                    <span className="font-semibold text-slate-900 font-mono tabular-nums mt-0.5 block">
                      90 dias a partir da emissão
                    </span>
                  </div>
                </div>
              </div>
            )}

            {doc.type === 'historico_escolar' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-display text-base font-bold text-[#0B1D3A]">
                    Histórico Escolar Parcial
                  </h4>
                  <div className="text-xs text-slate-600 font-mono tabular-nums">
                    CR: <strong className="text-slate-900">8,74</strong> ·
                    Integralização: <strong className="text-slate-900">64,2%</strong>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="py-2.5 px-3 font-semibold">Código</th>
                        <th className="py-2.5 px-3 font-semibold">Disciplina</th>
                        <th className="py-2.5 px-3 font-semibold text-right">CH</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Média</th>
                        <th className="py-2.5 px-3 font-semibold">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      <tr>
                        <td className="py-2.5 px-3 font-mono">ESW301</td>
                        <td className="py-2.5 px-3">Arquitetura de Software</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">80h</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">9,2</td>
                        <td className="py-2.5 px-3 text-[#16A34A] font-medium">Aprovado</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono">ESW304</td>
                        <td className="py-2.5 px-3">Engenharia de Requisitos</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">60h</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">8,9</td>
                        <td className="py-2.5 px-3 text-[#16A34A] font-medium">Aprovado</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono">ESW402</td>
                        <td className="py-2.5 px-3">Sistemas Distribuídos</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">80h</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">8,5</td>
                        <td className="py-2.5 px-3 text-[#16A34A] font-medium">Aprovado</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono">ESW501</td>
                        <td className="py-2.5 px-3">Qualidade e Testes de Software</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">60h</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">—</td>
                        <td className="py-2.5 px-3 text-[#164273] font-medium">Cursando</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#164273]" />
                <span>Autenticidade digital:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {doc.verificationCode}
                </span>
              </div>
              <span>Validação online UniCatólica</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onSendEmail(doc)}
            disabled={isSent}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              isSent
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 cursor-default'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
            }`}
          >
            {isSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Cópia enviada para {doc.sentToEmail}</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-[#164273]" />
                <span>Enviar cópia para o e-mail institucional</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => triggerPrintableDocumentDownload(doc.type, doc, user)}
            className="px-4 py-2 bg-[#0B1D3A] hover:bg-[#164273] text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Comprovante / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
