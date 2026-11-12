import React from 'react';
import { Check, CircleDot, Clock } from 'lucide-react';
import { TicketCategory, TicketStatus } from '../types/cia';

interface TicketTimelineProps {
  status: TicketStatus;
  category: TicketCategory;
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({
  status,
  category,
}) => {
  const thirdStepLabel =
    status === 'Encaminhado ao Financeiro'
      ? 'Encaminhado ao Financeiro'
      : status === 'Encaminhado à Secretaria'
      ? 'Encaminhado à Secretaria'
      : category === 'Financeiro' || category === 'Bolsas e Benefícios'
      ? 'Encaminhado ao Financeiro'
      : 'Encaminhado à Secretaria';

  const steps = [
    { key: 'open', label: 'Aberto' },
    { key: 'analysis', label: 'Em Análise' },
    { key: 'forwarded', label: thirdStepLabel },
    { key: 'done', label: 'Concluído' },
  ];

  const activeIndex =
    status === 'Aberto'
      ? 0
      : status === 'Em Análise'
      ? 1
      : status === 'Encaminhado ao Financeiro' ||
        status === 'Encaminhado à Secretaria'
      ? 2
      : 3;

  return (
    <div aria-label="Linha do tempo do protocolo" className="w-full py-2">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-2">
        {steps.map((step, index) => {
          const isCompleted =
            activeIndex === 3 ? index <= 3 : index < activeIndex;
          const isCurrent = activeIndex !== 3 && index === activeIndex;

          return (
            <div key={step.key} className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 relative">
              <div className="flex items-center w-auto sm:w-full">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-[#16A34A] border-[#16A34A] text-white'
                      : isCurrent
                      ? 'bg-[#0B1D3A] border-[#0B1D3A] text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <CircleDot className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block h-px flex-1 mx-2 ${
                      index < activeIndex ? 'bg-[#16A34A]' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-medium leading-snug ${
                    isCompleted
                      ? 'text-[#16A34A]'
                      : isCurrent
                      ? 'text-[#0B1D3A] font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
