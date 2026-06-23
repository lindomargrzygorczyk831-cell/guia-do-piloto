'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { Car, Mail, Lock, User, Phone, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Cadastro() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro(null)

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          full_name: nome,
          phone: telefone,
        }
      }
    })

    if (error) {
      if (error.message === 'User already registered') {
        setErro('Este e-mail já está cadastrado.')
      } else {
        setErro(error.message)
      }
      setCarregando(false)
    } else {
      setSucesso(true)
      setCarregando(false)
      setTimeout(() => {
        router.push('/')
      }, 2500)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-8 bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Car className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Criar Nova Conta
          </h1>
          <p className="text-sm text-slate-400">
            Comece a controlar o seu lucro real hoje mesmo
          </p>
        </div>

        {/* Alerta de Erro */}
        {erro && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Alerta de Sucesso */}
        {sucesso && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Conta criada! Redirecionando para o login...</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleCadastro} className="space-y-5">
          <div className="space-y-4">
            
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nome Completo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><User className="w-5 h-5" /></span>
                <input type="text" required placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all text-slate-100" />
              </div>
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Mail className="w-5 h-5" /></span>
                <input type="email" required placeholder="motorista@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all text-slate-100" />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telefone / WhatsApp</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Phone className="w-5 h-5" /></span>
                <input type="tel" required placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all text-slate-100" />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Lock className="w-5 h-5" /></span>
                <input type="password" required placeholder="Mínimo 6 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all text-slate-100" />
              </div>
            </div>

          </div>

          {/* Botão Cadastrar */}
          <button type="submit" disabled={carregando || sucesso} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-800 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer mt-2" >
            {carregando ? 'Criando Conta...' : 'Cadastrar e Começar'}
          </button>
        </form>

        {/* Voltar para o Login */}
        <div className="text-center pt-4 border-t border-slate-800/60">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium hover:underline transition-colors" >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login
          </a>
        </div>

      </div>

      <div className="mt-8 flex items-center gap-1.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-500/40" />
        <span>Dados protegidos pela criptografia do Supabase</span>
      </div>
    </main>
  )
}