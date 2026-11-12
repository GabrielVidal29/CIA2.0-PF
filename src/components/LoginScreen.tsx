import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FileCheck2,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { UserSession } from '../types/cia';
import { authenticateMicrosoftEmail, resetAllDemoData } from '../utils/storage';
import { BrandMark } from './BrandMark';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNotify,
}) => {
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const handleAuthenticate = (targetEmail: string) => {
    const result = authenticateMicrosoftEmail(targetEmail);
    if (!result.ok || !result.user) {
      setAuthError({
        title: result.errorTitle || 'Falha na autenticação',
        message: result.errorMessage || 'Verifique seu e-mail institucional.',
      });
      return;
    }

    setAuthError(null);
    onLoginSuccess(result.user);
    onNotify(
      'success',
      `Sessão iniciada como ${result.user.name}`,
      result.user.role === 'student'
        ? 'Redirecionado para o Portal do Aluno.'
        : 'Redirecionado para o Painel Operacional do Atendente CIA.'
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthenticate(email);
  };

  const handleResetDemo = () => {
    resetAllDemoData();
    setAuthError(null);
    onNotify(
      'info',
      'Dados de demonstração restaurados',
      'Chamados, documentos e avaliações de FAQ voltaram ao estado inicial.'
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col lg:flex-row">
      {/* Left Institutional Brand Column */}
      <aside className="lg:w-[46%] bg-[#0B1D3A] text-white px-8 py-10 lg:px-14 lg:py-14 flex flex-col justify-between">
        <div>
          <BrandMark variant="light" />

          <div className="mt-12 max-w-lg">
            <p className="text-xs font-medium tracking-wide text-slate-300">
              Centro Integrado de Atendimento ao Aluno
            </p>
            <h1 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white [text-wrap:balance]">
              Autoatendimento universitário e gestão de protocolos sem filas.
            </h1>
            <p className="mt-4 text-sm lg:text-base text-slate-300 leading-relaxed">
              Emita declarações, históricos e 2ª via de boletos em segundos ou
              acompanhe solicitações acadêmicas e financeiras com rastreamento
              transparente de SLA.
            </p>
          </div>

          <div className="mt-10 border-t border-white/15 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Clock className="w-4 h-4 text-sky-300 shrink-0" />
                <span>24/7 Online</span>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Emissão imediata sem espera presencial ou no WhatsApp.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileCheck2 className="w-4 h-4 text-sky-300 shrink-0" />
                <span>1-Clique</span>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Boletos, declarações e histórico com código verificável.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
                <span>SLA Visível</span>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Cada chamado gera protocolo único e prazo acompanhado.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <span>Centro Universitário Católica do Tocantins</span>
          <span>Autenticação via Microsoft Entra ID</span>
        </div>
      </aside>

      {/* Right Authentication Workspace */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 lg:px-14">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8">
          <div>
            <h2 className="text-xl font-bold text-[#0B1D3A] tracking-tight">
              Acesso Institucional
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Entre com sua conta Microsoft da UniCatólica para roteamento
              automático de perfil.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="mt-5 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  {authError.title}
                </p>
                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                  {authError.message}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="sso-email"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                E-mail institucional Microsoft
              </label>
              <input
                id="sso-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="gabriel.vidal@a.catolica-to.edu.br"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#164273]/30 focus:border-[#164273]"
                required
              />
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <p>
                  Alunos: <span className="font-mono text-slate-700">@a.catolica-to.edu.br</span>
                </p>
                <p>
                  Atendentes CIA: <span className="font-mono text-slate-700">@catolica-to.edu.br</span> ou{' '}
                  <span className="font-mono text-slate-700">@cia.catolica-to.edu.br</span>
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0B1D3A] hover:bg-[#164273] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {/* Microsoft 4-square emblem */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              <span>Entrar com Microsoft</span>
            </button>
          </form>

          {/* Seletor rápido de demonstração */}
          <div className="mt-7 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-3">
              Acesso rápido para demonstração
            </p>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleAuthenticate('gabriel.vidal@a.catolica-to.edu.br')}
                className="w-full px-3.5 py-2.5 border border-slate-200 hover:border-[#164273] hover:bg-slate-50 rounded-lg text-left transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserCheck className="w-4 h-4 text-[#164273] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      Logar como Aluno — Gabriel Vidal
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate">
                      gabriel.vidal@a.catolica-to.edu.br
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleAuthenticate('ana.souza@catolica-to.edu.br')}
                className="w-full px-3.5 py-2.5 border border-slate-200 hover:border-[#164273] hover:bg-slate-50 rounded-lg text-left transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Users className="w-4 h-4 text-[#0B1D3A] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      Logar como Atendente CIA
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate">
                      ana.souza@catolica-to.edu.br
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('prof.carlos@p.catolica-to.edu.br');
                    handleAuthenticate('prof.carlos@p.catolica-to.edu.br');
                  }}
                  className="text-slate-500 hover:text-slate-800 underline underline-offset-2 cursor-pointer"
                >
                  Simular bloqueio docente (@p.catolica-to.edu.br)
                </button>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="text-slate-500 hover:text-[#164273] cursor-pointer whitespace-nowrap"
                >
                  Restaurar dados
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
