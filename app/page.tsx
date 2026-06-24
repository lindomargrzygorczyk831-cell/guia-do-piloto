'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Car, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      if (error.message === 'Invalid login credentials') {
        setErro('E-mail ou senha incorretos.')
      } else {
        setErro(error.message)
      }
      setCarregando(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-center items-center px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8 bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Car className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Guia do Piloto
          </h1>
          <p className="text-sm text-slate-400">
            A gestão financeira inteligente para motoristas de app
          </p>
        </div>

        {/* Alerta de Erro */}
        {erro && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            
            {/* Input de E-mail */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Input de Senha */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Senha
                </label>
                <a href="#" className="text-xs text-emerald-400 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-800 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            {carregando ? 'Entrando...' : 'Acessar Minha Conta'}
            {!carregando && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Rodapé do Card */}
        <div className="text-center pt-4 border-t border-slate-800/60">
          <p className="text-xs text-slate-500">
            Não tem uma conta?{' '}
            <a href="/cadastro" className="text-emerald-400 font-medium hover:underline">
              Criar conta grátis
            </a>
          </p>
        </div>

      </div>

      <div className="mt-8 flex items-center gap-1.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-500/40" />
        <span>Conexão segura via Supabase PostgreSQL</span>
      </div>
    </main>
  )
}