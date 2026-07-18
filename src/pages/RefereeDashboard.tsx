import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '@/components/common/Sidebar'
import AppTopbar from '@/components/common/AppTopbar'
import Footer from '@/components/common/Footer'
import ManchasFloating from '@/components/common/ManchasFloating'
import { SpotlightCard } from '@/components/common/spotlight-card'
import { Button } from '@/components/common/button'
import { CalendarDays, MapPin, Clock, Shield } from 'lucide-react'
import { partidos, fetchPartidos } from '@/services/partidos'

const SIDEBAR_KEY = 'techcup_sidebar_collapsed'

export default function RefereeDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY)
    return stored ? JSON.parse(stored) : false
  })
  const navigate = useNavigate()

  useEffect(() => { fetchPartidos() }, [])

  const partidosAsignados = partidos.map((p, i) => ({
    id: i + 1,
    eq1: p.eq1, eq2: p.eq2,
    fecha: `${p.dia} ${p.mes}`,
    hora: p.hora,
    cancha: p.lugar,
    estado: p.status === 'IN_PROGRESS' ? 'live' : p.status === 'FINISHED' ? 'final' : 'upcoming',
    torneo: 'TechCup 2026',
    resultado: p.homeScore != null ? `${p.homeScore} - ${p.awayScore}` : undefined,
  }))

  const handleCollapse = (val: boolean) => {
    setSidebarCollapsed(val)
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(val))
  }

  const sidebarWidth = sidebarOpen ? (sidebarCollapsed ? '72px' : '260px') : '0px'

  const badgeConfig = (estado: string) => {
    if (estado === 'live') return { text: '🔴 En vivo', style: 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse' }
    if (estado === 'upcoming') return { text: '📅 Próximo', style: 'bg-gold/20 text-gold border border-gold/40' }
    return { text: '✅ Finalizado', style: 'bg-white/10 text-text-muted border border-white/15' }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onCollapse={handleCollapse} />
      <div className="min-w-0 flex-1 transition-all duration-300" style={{ marginLeft: sidebarWidth }}>
        <AppTopbar title="Panel de árbitro" sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-mid/15 blur-[150px] pointer-events-none" />

        <main className="max-w-[1000px] mx-auto px-8 py-8 pb-[60px] relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/20 to-purple-mid/20 border border-gold/30 flex items-center justify-center">
              <Shield size={24} className="text-gold" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl uppercase">Panel de <span className="text-gold">árbitro</span></h1>
              <p className="text-sm text-text-muted">Tus partidos asignados — Gestioná cuando inicie el encuentro.</p>
            </div>
          </div>

          {/* Partido destacado - en vivo */}
          {partidosAsignados.filter(p => p.estado === 'live').map(p => (
            <SpotlightCard key={p.id} accent="gold" className="bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between max-md:flex-col gap-4">
                <div>
                  <span className="inline-block rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold tracking-[.4px] px-2.5 py-0.5 mb-2 flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> EN VIVO
                  </span>
                  <p className="text-xs text-text-faint uppercase tracking-[.4px]">{p.torneo}</p>
                  <h2 className="font-[family-name:var(--font-display)] text-xl uppercase mt-1">{p.eq1} <span className="text-gold">VS</span> {p.eq2}</h2>
                  <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {p.fecha}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {p.hora}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {p.cancha}</span>
                  </div>
                </div>
                <Button onClick={() => navigate('/arbitraje')} className="rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-6 py-3 h-auto shadow-lg shadow-green-900/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Gestionar partido
                </Button>
              </div>
            </SpotlightCard>
          ))}

          {/* Lista de partidos en formato tarjeta con imagen */}
          <h3 className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[.3px] mb-4">
            Mis partidos <span className="text-gold">asignados</span>
          </h3>
          <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-5 mb-10">
            {partidosAsignados.map((p, i) => {
              const badge = badgeConfig(p.estado)
              const imgSrc = `/images/fondo-${(i % 6) + 1}.png`
              return (
                <button key={p.id} onClick={() => p.estado === 'live' && navigate('/arbitraje')} className="block group w-full text-left">
                  <div className="relative overflow-hidden rounded-2xl border border-[#D4C8E8]/40 dark:border-white/5 bg-[#E8DFF5]/70 dark:bg-black/30 transition-all duration-300 hover:border-[#D4AF37]/60 hover:shadow-[0_0_25px_rgba(212,175,55,0.12)]">
                    <div className="absolute inset-0">
                      <img src={imgSrc} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0614] via-[#0A0614]/50 to-transparent" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full min-h-[260px] flex flex-col justify-between p-5 z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-block rounded-full text-[10px] font-bold uppercase tracking-[.4px] px-2.5 py-0.5 ${badge.style}`}>{badge.text}</span>
                        </div>
                        <span className="block text-[10px] tracking-[1.2px] text-gold font-bold uppercase mb-1">{p.torneo}</span>
                        <h3 className="font-[family-name:var(--font-display)] text-xl uppercase text-white leading-tight">{p.eq1}</h3>
                        <h3 className="font-[family-name:var(--font-display)] text-lg uppercase text-gold leading-tight">VS</h3>
                        <h3 className="font-[family-name:var(--font-display)] text-xl uppercase text-white leading-tight mb-1">{p.eq2}</h3>
                        {p.resultado && <span className="text-lg font-bold text-gold">{p.resultado}</span>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-white/50 mb-2">
                          <CalendarDays size={12} /> {p.fecha} · {p.hora}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-white/60 flex items-center gap-1">
                            <MapPin size={12} /> {p.cancha}
                          </span>
                          <span className="text-[11px] font-bold text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded-full group-hover:bg-gold/20 group-hover:border-gold/60 transition-all duration-300">
                            {p.estado === 'live' ? 'Gestionar' : p.estado === 'upcoming' ? 'Ver detalle' : 'Ver resumen'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </main>
        <Footer />
      </div>
      <ManchasFloating />
    </div>
  )
}
