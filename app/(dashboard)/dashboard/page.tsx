'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { 
  Car, 
  DollarSign, 
  TrendingDown, 
  LogOut, 
  User,
  Plus,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Clock,
  Milestone,
  PieChart,
  Settings,
  Calendar,
  UserCheck,
  Phone,
  Download
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  
  // Controles dos Modais
  const [modalAberto, setModalAberto] = useState(false)
  const [modalGaragemAberto, setModalGaragemAberto] = useState(false)
  const [modalMetaAberto, setModalMetaAberto] = useState(false) 
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false) 
  const [abaAtiva, setAbaAtiva] = useState<'ganho' | 'despesa'>('ganho')
  
  // Controles de Filtros
  const [filtroAtivo, setFiltroAtivo] = useState<'tudo' | 'ganho' | 'despesa'>('tudo')
  const [periodoAtivo, setPeriodoAtivo] = useState<'hoje' | 'semana' | 'mes' | 'tudo'>('tudo')
  
  // Campos do Lançamento
  const [valor, setValor] = useState('')
  const [app, setApp] = useState('Uber')
  const [horas, setHoras] = useState('')
  const [km, setKm] = useState('')       
  const [categoriaDespesa, setCategoriaDespesa] = useState('Combustível')
  const [dataLancamento, setDataLancamento] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Campos da Garagem
  const [carroModelo, setCarroModelo] = useState('Não cadastrado')
  const [carroConsumo, setCarroConsumo] = useState(10)
  const [inputModelo, setInputModelo] = useState('')
  const [inputConsumo, setInputConsumo] = useState('')
  const [salvandoGaragem, setSalvandoGaragem] = useState(false)

  // Campos da Meta Diária
  const [metaDiaria, setMetaDiaria] = useState(180)
  const [inputMeta, setInputMeta] = useState('180') 

  // Campos do Cadastro / Perfil
  const [nomeCompleto, setNomeCompleto] = useState('Motorista')
  const [celular, setCelular] = useState('')
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)

  // Listas Brutas do banco
  const [ganhosBrutos, setGanhosBrutos] = useState<any[]>([])
  const [despesasBrutas, setDespesasBrutas] = useState<any[]>([])

  // Estados Financeiros Filtrados para Exibição
  const [ganhosTotais, setGanhosTotais] = useState(0)
  const [despesasTotais, setDespesasTotais] = useState(0)
  const [horasTotais, setHorasTotais] = useState(0)
  const [kmTotais, setKmTotais] = useState(0)
  const [historico, setHistorico] = useState<any[]>([])

  const [ganhosPorApp, setGanhosPorApp] = useState<Record<string, number>>({ Uber: 0, '99App': 0, InDrive: 0, Particular: 0 })
  const [despesasPorCat, setDespesasPorCat] = useState<Record<string, number>>({ Combustível: 0, Alimentação: 0, Manutenção: 0, Taxa: 0, Outros: 0 })

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0]
    setDataLancamento(hoje)

    const buscarUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
      } else {
        setUsuario(user)
        
        if (user.user_metadata?.full_name) setNomeCompleto(user.user_metadata.full_name)
        if (user.user_metadata?.celular) setCelular(user.user_metadata.celular)
        if (user.user_metadata?.carro_modelo) {
          setCarroModelo(user.user_metadata.carro_modelo)
          setInputModelo(user.user_metadata.carro_modelo)
        }
        if (user.user_metadata?.carro_consumo) {
          setCarroConsumo(Number(user.user_metadata.carro_consumo))
          setInputConsumo(user.user_metadata.carro_consumo.toString())
        }
        if (user.user_metadata?.meta_diaria) {
          setMetaDiaria(Number(user.user_metadata.meta_diaria))
          setInputMeta(user.user_metadata.meta_diaria.toString())
        }
        
        buscarDadosDoBanco(user.id)
      }
      setCarregando(false)
    }

    buscarUsuario()
  }, [router])

  const buscarDadosDoBanco = async (userId: string) => {
    const { data: ganhos } = await supabase
      .from('ganhos')
      .select('id, valor, plataforma, data, horas_online, quilometros_rodados')
      .eq('user_id', userId)
    
    const { data: despesas } = await supabase
      .from('despesas')
      .select('id, valor, categoria, data')
      .eq('user_id', userId)

    setGanhosBrutos(ganhos || [])
    setDespesasBrutas(despesas || [])
  }

  useEffect(() => {
    if (!usuario) return

    const hojeStr = new Date().toISOString().split('T')[0]
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
    
    const inicioDoMes = new Date()
    inicioDoMes.setDate(1)
    const inicioDoMesStr = inicioDoMes.toISOString().split('T')[0]

    const filtrarPorData = (itemData: string) => {
      if (periodoAtivo === 'hoje') return itemData === hojeStr
      if (periodoAtivo === 'semana') return new Date(itemData) >= seteDiasAtras
      if (periodoAtivo === 'mes') return itemData >= inicioDoMesStr
      return true
    }

    const ganhosFiltrados = ganhosBrutos.filter(g => filtrarPorData(g.data))
    const despesasFiltradas = despesasBrutas.filter(d => filtrarPorData(d.data))

    const totalG = ganhosFiltrados.reduce((acc, atual) => acc + atual.valor, 0)
    const totalH = ganhosFiltrados.reduce((acc, atual) => acc + (atual.horas_online || 0), 0)
    const totalK = ganhosFiltrados.reduce((acc, atual) => acc + (atual.quilometros_rodados || 0), 0)
    const totalD = despesasFiltradas.reduce((acc, atual) => acc + atual.valor, 0)

    setGanhosTotais(totalG)
    setHorasTotais(totalH)
    setKmTotais(totalK)
    setDespesasTotais(totalD)

    const appsAcumulado: Record<string, number> = { Uber: 0, '99App': 0, InDrive: 0, Particular: 0 }
    ganhosFiltrados.forEach(g => {
      if (g.plataforma && appsAcumulado[g.plataforma] !== undefined) appsAcumulado[g.plataforma] += g.valor
    })
    setGanhosPorApp(appsAcumulado)

    const catAcumulado: Record<string, number> = { Combustível: 0, Alimentação: 0, Manutenção: 0, Taxa: 0, Outros: 0 }
    despesasFiltradas.forEach(d => {
      if (d.categoria && catAcumulado[d.categoria] !== undefined) catAcumulado[d.categoria] += d.valor
    })
    setDespesasPorCat(catAcumulado)

    const listaGanhos = ganhosFiltrados.map(g => ({
      id: `g-${g.id}`, tipo: 'ganho', descricao: g.plataforma, valor: g.valor, data: g.data, detalhe: `${g.horas_online || 0}h | ${g.quilometros_rodados || 0}km`
    }))

    const listaDespesas = despesasFiltradas.map(d => ({
      id: `d-${d.id}`, tipo: 'despesa', descricao: d.categoria, valor: d.valor, data: d.data, detalhe: '-'
    }))

    const unificado = [...listaGanhos, ...listaDespesas].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    )
    setHistorico(unificado)

  }, [periodoAtivo, ganhosBrutos, despesasBrutas, usuario])

  const handleSair = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // FUNÇÃO MÁGICA: EXPORTAR PARA EXCEL/CSV
  const handleExportarDados = () => {
    if (historico.length === 0) {
      alert('Nenhum dado encontrado no período selecionado para exportar.')
      return
    }

    let csvContent = '\uFEFF' // Garante caracteres corretos no Excel (BOM UTF-8)
    csvContent += 'DriverProfit - Relatório Financeiro Operacional\n'
    csvContent += `Período Filtrado: ;${periodoAtivo.toUpperCase()}\n\n`
    csvContent += 'RESUMO OPERACIONAL\n'
    csvContent += `Faturamento Bruto:;R$ ${ganhosTotais.toFixed(2)}\n`
    csvContent += `Total Despesas:;R$ ${despesasTotais.toFixed(2)}\n`
    csvContent += `Lucro Líquido Real:;R$ ${(ganhosTotais - despesasTotais).toFixed(2)}\n`
    csvContent += `KM Rodados Totais:;${kmTotais} km\n`
    csvContent += `Tempo Online Total:;${horasTotais}h\n\n`

    csvContent += 'EXTRATO DETALHADO DE LANÇAMENTOS\n'
    csvContent += 'Data;Tipo;Descrição / Categoria;Valor (R$);Métricas Extra (Horas/KM)\n'

    historico.forEach(item => {
      const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})
      const tipoFormatado = item.tipo === 'ganho' ? 'Faturamento (+)' : 'Despesa (-)'
      csvContent += `${dataFormatada};${tipoFormatado};${item.descricao};${item.valor.toFixed(2)};${item.detalhe}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `DriverProfit_Relatorio_${periodoAtivo}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmeter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valor || isNaN(Number(valor))) return

    setSalvando(true)
    const dataAlvo = dataLancamento || new Date().toISOString().split('T')[0]

    if (abaAtiva === 'ganho') {
      const { error } = await supabase.from('ganhos').insert([
        { 
          user_id: usuario.id, 
          valor: Number(valor), 
          plataforma: app, 
          horas_online: horas ? Number(horas) : 0, 
          quilometros_rodados: km ? Number(km) : 0, 
          data: dataAlvo
        }
      ])
      if (error) alert('Erro ao salvar ganho: ' + error.message)
    } else {
      const { error } = await supabase.from('despesas').insert([
        { 
          user_id: usuario.id, 
          valor: Number(valor), 
          categoria: categoriaDespesa, 
          data: dataAlvo
        }
      ])
      if (error) alert('Erro ao salvar despesa: ' + error.message)
    }

    setValor('')
    setHoras('')
    setKm('')
    setDataLancamento(new Date().toISOString().split('T')[0])
    setModalAberto(false)
    await buscarDadosDoBanco(usuario.id)
    setSalvando(false)
  }

  const handleSalvarGaragem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputModelo || !inputConsumo || isNaN(Number(inputConsumo))) return
    setSalvandoGaragem(true)

    const { error } = await supabase.auth.updateUser({
      data: { ...usuario?.user_metadata, carro_modelo: inputModelo, carro_consumo: Number(inputConsumo) }
    })

    if (!error) {
      setCarroModelo(inputModelo)
      setCarroConsumo(Number(inputConsumo))
      setModalGaragemAberto(false)
    } else {
      alert('Erro ao salvar veículo: ' + error.message)
    }
    setSalvandoGaragem(false)
  }

  const handleSalvarMeta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMeta || isNaN(Number(inputMeta))) return

    const { error } = await supabase.auth.updateUser({
      data: { ...usuario?.user_metadata, meta_diaria: Number(inputMeta) }
    })

    if (!error) {
      setMetaDiaria(Number(inputMeta))
      setModalMetaAberto(false)
    } else {
      alert('Erro ao salvar meta: ' + error.message)
    }
  }

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeCompleto) return
    setSalvandoPerfil(true)

    const { error } = await supabase.auth.updateUser({
      data: { ...usuario?.user_metadata, full_name: nomeCompleto, celular: celular }
    })

    if (!error) {
      setModalPerfilAberto(false)
    } else {
      alert('Erro ao atualizar cadastro: ' + error.message)
    }
    setSalvandoPerfil(false)
  }

  const lucroLiquido = ganhosTotais - despesasTotais
  const porcentagemMeta = Math.min(Math.round((ganhosTotais / metaDiaria) * 100), 100)
  const quantoFalta = Math.max(metaDiaria - ganhosTotais, 0)
  const ganhoPorKm = kmTotais > 0 ? (ganhosTotais / kmTotais) : 0
  const litrosConsumidos = carroConsumo > 0 ? (kmTotais / carroConsumo) : 0

  const historicoFiltrado = historico
    .filter(item => filtroAtivo === 'tudo' || item.tipo === filtroAtivo)
    .slice(0, 5)

  // Variáveis auxiliares para a lógica do Alerta de Gastos
  const percentualDespesa = ganhosTotais > 0 ? (despesasTotais / ganhosTotais) * 100 : 0
  const acimaDoLimiteGastos = percentualDespesa > 30

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative pb-24">
      {/* Barra de Navegação */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Car className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Guia do Piloto</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setModalPerfilAberto(true)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer group">
              <User className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              <span className="hidden sm:inline underline decoration-dotted decoration-slate-600 group-hover:decoration-emerald-400">{nomeCompleto}</span>
            </button>
            <button onClick={handleSair} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Olá, {nomeCompleto.split(' ')[0]}!</h1>
            <p className="text-xs sm:text-sm text-slate-400">Acompanhe as métricas de sua operação.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            {/* Seletor de Período */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <div className="pl-2 text-slate-500"><Calendar className="w-3.5 h-3.5" /></div>
              {(['hoje', 'semana', 'mes', 'tudo'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodoAtivo(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                    periodoAtivo === p ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p === 'mes' ? 'Mês' : p === 'semana' ? 'Semana' : p}
                </button>
              ))}
            </div>

            {/* NOVO BOTÃO DE EXPORTAR DATA */}
            <button 
              onClick={handleExportarDados} 
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-800 transition-all cursor-pointer shadow-sm"
              title="Exportar dados para Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" /> Exportar Dados
            </button>
            
            <button onClick={() => setModalAberto(true)} className="hidden sm:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Novo Lançamento
            </button>
          </div>
        </div>

        {/* ⚠️ NOVO BANNER: ALERTA DE RALO DE DINHEIRO DETECTADO */}
        {ganhosTotais > 0 && (
          <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            acimaDoLimiteGastos 
              ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-lg shadow-red-500/5' 
              : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${acimaDoLimiteGastos ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {acimaDoLimiteGastos ? <TrendingDown className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold tracking-wide uppercase">
                  {acimaDoLimiteGastos ? '⚠️ ALERTA: Ralo de Dinheiro Detectado!' : '✅ Saúde Financeira Protegida'}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  {acimaDoLimiteGastos 
                    ? `As suas despesas atingiram ${percentualDespesa.toFixed(1)}% do faturamento bruto. Está acima do limite recomendado de 30%!` 
                    : `Excelente! Os seus gastos operacionais estão controlados em apenas ${percentualDespesa.toFixed(1)}% do faturamento bruto.`}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right self-start sm:self-center">
              <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">Gasto / Bruto</span>
              <span className="text-base sm:text-lg font-black">{percentualDespesa.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* META + GARAGEM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider">Meta Diária (Alvo: R$ {metaDiaria})</span>
              </div>
              <button type="button" onClick={() => setModalMetaAberto(true)} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700 transition-all cursor-pointer">
                Ajustar Meta
              </button>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 my-2">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" style={{ width: `${porcentagemMeta}%` }}></div>
            </div>
            <p className="text-xs text-slate-400">
              {quantoFalta > 0 ? `Faltam R$ ${quantoFalta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para bater a meta diária hoje.` : 'Sensacional! Meta diária batida com sucesso! 🚀'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400">
                <Car className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wider">Minha Garagem</span>
              </div>
              <button type="button" onClick={() => setModalGaragemAberto(true)} className="text-slate-400 hover:text-purple-400 transition-all cursor-pointer"><Settings className="w-3.5 h-3.5" /></button>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200 tracking-tight">{carroModelo}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Consumo Médio: <span className="text-purple-400 font-semibold">{carroConsumo} KM/L</span></p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px] text-slate-500">
              <span>Combustível estimado:</span>
              <span className="font-bold text-slate-300">{litrosConsumidos.toFixed(1)} Litros</span>
            </div>
          </div>
        </div>

        {/* Grid de Cards Finanças */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lucro Líquido Real</p>
            <h3 className={`text-2xl sm:text-3xl font-black mt-2 ${lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500 mt-2 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
              Eficiência: R$ {ganhoPorKm.toFixed(2)} / km rodado
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex justify-between items-start text-slate-400"><span className="text-xs font-semibold uppercase tracking-wider">Faturamento</span><DollarSign className="w-4 h-4 text-blue-400" /></div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 mt-2">R$ {ganhosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex justify-between items-start text-slate-400"><span className="text-xs font-semibold uppercase tracking-wider">Despesas</span><TrendingDown className="w-4 h-4 text-red-400" /></div>
            <h3 className="text-lg sm:text-xl font-bold text-red-400 mt-2">R$ {despesasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex justify-between items-start text-slate-400"><span className="text-xs font-semibold uppercase tracking-wider">Tempo Online</span><Clock className="w-4 h-4 text-amber-400" /></div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 mt-2">{horasTotais}h 00min</h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex justify-between items-start text-slate-400"><span className="text-xs font-semibold uppercase tracking-wider">Distância</span><Milestone className="w-4 h-4 text-purple-400" /></div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 mt-2">{kmTotais.toLocaleString('pt-BR')} km</h3>
          </div>
        </div>

        {/* SEÇÃO DE GRÁFICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2"><PieChart className="w-4 h-4 text-blue-400" /><h3 className="text-xs font-bold uppercase tracking-wider">Faturamento por App</h3></div>
            <div className="space-y-3.5">
              {Object.entries(ganhosPorApp).map(([nomeApp, valorApp]) => {
                const porcentagemBarra = ganhosTotais > 0 ? (valorApp / ganhosTotais) * 100 : 0;
                return (
                  <div key={nomeApp} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium"><span className="text-slate-300">{nomeApp}</span><span className="text-slate-400">R$ {valorApp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${porcentagemBarra}%` }}></div></div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2"><PieChart className="w-4 h-4 text-red-400" /><h3 className="text-xs font-bold uppercase tracking-wider">Distribuição de Gastos</h3></div>
            <div className="space-y-3.5">
              {Object.entries(despesasPorCat).map(([nomeCat, valorCat]) => {
                const porcentagemBarra = despesasTotais > 0 ? (valorCat / despesasTotais) * 100 : 0;
                return (
                  <div key={nomeCat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium"><span className="text-slate-300">{nomeCat}</span><span className="text-slate-400 text-red-400">R$ {valorCat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${porcentagemBarra}%` }}></div></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* SEÇÃO DO EXTRATO DE ATIVIDADES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Últimas Atividades</h3>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/60 max-w-xs">
              <button type="button" onClick={() => setFiltroAtivo('tudo')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${filtroAtivo === 'tudo' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>Tudo</button>
              <button type="button" onClick={() => setFiltroAtivo('ganho')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${filtroAtivo === 'ganho' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>Ganhos</button>
              <button type="button" onClick={() => setFiltroAtivo('despesa')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${filtroAtivo === 'despesa' ? 'bg-red-500/10 text-red-400' : 'text-slate-400 hover:text-slate-200'}`}>Despesas</button>
            </div>
          </div>
          {historicoFiltrado.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-2">Nenhum lançamento encontrado para este filtro.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {historicoFiltrado.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${item.tipo === 'ganho' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {item.tipo === 'ganho' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{item.descricao}</p>
                      <p className="text-xs text-slate-500">{new Date(item.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${item.tipo === 'ganho' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.tipo === 'ganho' ? '+' : '-'} R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Botão Celular */}
      <button onClick={() => setModalAberto(true)} className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-95 transition-all z-40 cursor-pointer">
        <Plus className="w-6 h-6" />
      </button>

      {/* MODAL LANÇAMENTOS COM DATA DINÂMICA */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex gap-4">
                <button type="button" onClick={() => setAbaAtiva('ganho')} className={`text-sm font-bold pb-1 transition-all cursor-pointer ${abaAtiva === 'ganho' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400'}`}>+ Ganho</button>
                <button type="button" onClick={() => setAbaAtiva('despesa')} className={`text-sm font-bold pb-1 transition-all cursor-pointer ${abaAtiva === 'despesa' ? 'text-red-400 border-b-2 border-red-400' : 'text-slate-400'}`}>- Despesa</button>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmeter} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data do Registro</label>
                <input 
                  type="date" 
                  required 
                  value={dataLancamento} 
                  onChange={(e) => setDataLancamento(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium scheme-dark" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor do Lançamento (R$)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-semibold text-sm">R$</span>
                  <input type="number" step="0.01" required placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium" />
                </div>
              </div>

              {abaAtiva === 'ganho' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aplicativo / Origem</label>
                    <select value={app} onChange={(e) => setApp(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium">
                      <option value="Uber">Uber</option>
                      <option value="99App">99App</option>
                      <option value="InDrive">InDrive</option>
                      <option value="Particular">Corrida Particular</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tempo Online (Horas)</label>
                      <input type="number" placeholder="Ex: 8" value={horas} onChange={(e) => setHoras(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Distância (KM)</label>
                      <input type="number" placeholder="Ex: 120" value={km} onChange={(e) => setKm(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoria do Gasto</label>
                  <select value={categoriaDespesa} onChange={(e) => setCategoriaDespesa(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium">
                    <option value="Combustível">Combustível</option>
                    <option value="Alimentação">Alimentação na rua</option>
                    <option value="Manutenção">Oficina / Manutenção</option>
                    <option value="Taxa">Taxas ou Parcelas</option>
                    <option value="Outros">Outros gastos</option>
                  </select>
                </div>
              )}
              <button type="submit" disabled={salvando} className={`w-full py-3 font-semibold rounded-xl text-sm transition-all shadow-lg cursor-pointer ${abaAtiva === 'ganho' ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' : 'bg-red-500 hover:bg-red-600 text-slate-50'}`}>
                {salvando ? 'Salvando...' : 'Confirmar Lançamento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GARAGEM */}
      {modalGaragemAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Configurar Veículo</h3>
              <button onClick={() => setModalGaragemAberto(false)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarGaragem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modelo do Carro</label>
                <input type="text" required placeholder="Ex: Chevrolet Onix 1.0" value={inputModelo} onChange={(e) => setInputModelo(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consumo Médio (KM/L)</label>
                <input type="number" step="0.1" required placeholder="Ex: 12.5" value={inputConsumo} onChange={(e) => setInputConsumo(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium" />
              </div>
              <button type="submit" disabled={salvandoGaragem} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-slate-50 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/10 cursor-pointer">
                {salvandoGaragem ? 'Salvando...' : 'Salvar Veículo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL META */}
      {modalMetaAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Ajustar Objetivo Diário</h3>
              <button onClick={() => setModalMetaAberto(false)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarMeta} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nova Meta de Faturamento (R$)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-semibold text-sm">R$</span>
                  <input type="number" required placeholder="180" value={inputMeta} onChange={(e) => setInputMeta(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer">Definir Novo Alvo</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERFIL */}
      {modalPerfilAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400"><UserCheck className="w-4 h-4" /><h3 className="text-sm font-bold uppercase tracking-wider">Editar Meu Cadastro</h3></div>
              <button onClick={() => setModalPerfilAberto(false)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarPerfil} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><User className="w-4 h-4" /></span><input type="text" required placeholder="Seu nome" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium" /></div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp / Celular</label>
                <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Phone className="w-4 h-4" /></span><input type="text" placeholder="(00) 99999-0000" value={celular} onChange={(e) => setCellular(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none text-sm text-slate-100 font-medium" /></div>
              </div>
              <button type="submit" disabled={salvandoPerfil} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer">{salvandoPerfil ? 'Atualizando...' : 'Salvar Alterações'}</button>
            </form>
          </div>
        </div>
      )}
      {/* 🏁 RODAPÉ: ASSINATURA DO DESENVOLVEDOR */}
      <footer className="w-full text-center py-8 border-t border-slate-900 bg-slate-950 mt-12 text-xs text-slate-500 font-medium tracking-wide">
        <p>© {new Date().getFullYear()} Guia do Piloto. Todos os direitos reservados.</p>
        <p className="mt-1.5 text-slate-600">
          Desenvolvido e Idealizado por <span className="text-purple-400 font-semibold hover:text-purple-300 transition-colors cursor-pointer">Lindomar Grzygorczyk</span>
        </p>
      </footer>

    </div>
  )
}