import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '@/components/common/Sidebar'
import AppTopbar from '@/components/common/AppTopbar'
import Footer from '@/components/common/Footer'
import { SpotlightCard } from '@/components/common/spotlight-card'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/common/button'
import { CalendarDays, Users, Download, ArrowLeft, Trophy, Settings, Trash2, PlusCircle, Edit } from 'lucide-react'
import { getTorneoPorId } from '@/services/torneos'
import type { Torneo } from '@/services/torneos'

type Tab = 'info' | 'equipos' | 'calendario' | 'tabla' | 'llaves'

const equiposMock = [
  { nom: 'Tigres FC', emoji: '🐯', color: '#EF4444' },
  { nom: 'Sistemas FC', emoji: '⚙️', color: '#22C55E' },
  { nom: 'Code United', emoji: '🔵', color: '#3B82F6' },
  { nom: 'IA Warriors', emoji: '🦁', color: '#8B5CF6' },
  { nom: 'Dragones FC', emoji: '🐉', color: '#F97316' },
  { nom: 'Los Bits', emoji: '⚡', color: '#F5A623' },
]

export default function DetalleTorneo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('info')
  const [torneo, setTorneo] = useState<Torneo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      getTorneoPorId(id).then(t => {
        setTorneo(t ?? null)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-text-muted">Cargando...</p>
    </div>
  )

  if (!torneo) return (
    <div className="min-h-screen bg-black flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <AppTopbar title="Detalle del torneo" onMenuClick={() => setSidebarOpen(true)} />
        <main className="max-w-[900px] mx-auto px-8 py-8 pb-[60px] text-center">
          <p className="text-text-muted mb-4">Torneo no encontrado</p>
          <Link to="/torneos" className="text-gold hover:text-gold-dark">← Volver a torneos</Link>
        </main>
        <Footer />
      </div>
    </div>
  )

  const isClosed = torneo.estado === 'closed'
  const isUpcoming = torneo.estado === 'upcoming'

  return (
    <div className="min-h-screen bg-black">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-mid/15 blur-[150px] pointer-events-none" />
      <div className="min-w-0 relative z-10">
        <AppTopbar title="Detalle del torneo" onMenuClick={() => setSidebarOpen(true)} />

        <main className="max-w-[900px] mx-auto px-8 py-8 pb-[60px]">
          <Link to="/torneos" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-gold-ink transition-colors mb-4">
            <ArrowLeft size={16} /> Volver a torneos
          </Link>

          {/* Banner */}
          <SpotlightCard accent="gold" className="bg-gradient-to-br from-purple-deep to-purple-black border border-border rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-between max-md:flex-col max-md:text-center gap-4">
              <div>
                <Badge className={`rounded-full text-[11px] mb-3 ${
                  torneo.estado === 'live' ? 'bg-purple-mid/20 text-purple-300 border-purple-500/30'
                  : torneo.estado === 'upcoming' ? 'bg-gold/15 text-gold border-gold/40'
                  : 'bg-white/10 text-white/60 border-white/20'
                }`}>
                  {torneo.estado === 'live' ? '🔴 En curso' : torneo.estado === 'upcoming' ? '📅 Próximo' : '✅ Finalizado'}
                </Badge>
                <h1 className="font-[family-name:var(--font-display)] text-3xl uppercase text-white mb-1">{torneo.nombre}</h1>
                <p className="text-sm text-white/60">{torneo.categoria} — {torneo.semestre}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-full border-gold/40 text-gold hover:bg-gold/10 text-xs h-10">
                  <Download size={14} /> Reglamento
                </Button>
              </div>
            </div>
          </SpotlightCard>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: '🏆', label: 'Equipos', value: torneo.equipos },
              { icon: '👥', label: 'Jugadores', value: torneo.jugadores },
              { icon: '🏟️', label: 'Canchas', value: torneo.canchas },
            ].map((s, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4 text-center">
                <span className="text-2xl block mb-1">{s.icon}</span>
                <div className="font-[family-name:var(--font-display)] text-xl text-gold">{s.value}</div>
                <div className="text-xs text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6 overflow-x-auto">
            {(['info','equipos','calendario','tabla','llaves'] as Tab[]).filter(t => !(isUpcoming && (t === 'tabla' || t === 'llaves'))).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`py-3 px-5 text-xs font-bold uppercase tracking-[1px] transition-all whitespace-nowrap ${
                  tab === t ? 'text-gold border-b-2 border-gold' : 'text-text-muted hover:text-gold'
                }`}>
                {t === 'info' ? 'Información' : t === 'equipos' ? 'Equipos' : t === 'calendario' ? 'Calendario' : t === 'tabla' ? 'Tabla' : 'Llaves'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'info' && (
            <>
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
              {[
                { label: 'Formato', value: 'Todos contra todos + Eliminatorias' },
                { label: 'Categoría', value: torneo.categoria },
                { label: 'Duración', value: torneo.fecha || 'Por definir' },
                { label: 'Equipos', value: `${torneo.equipos} equipos — ${torneo.jugadores} jugadores` },
                { label: 'Canchas', value: `${torneo.canchas} canchas` },
                { label: 'Estado', value: torneo.estado === 'live' ? '🔴 En curso' : torneo.estado === 'upcoming' ? '📅 Próximo' : '✅ Finalizado' },
              ].map((info, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-[10px] text-text-faint uppercase tracking-[.4px] font-semibold mb-1">{info.label}</p>
                  <p className="text-sm font-semibold text-white">{info.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <Button onClick={() => navigate(`/crear-partido?torneo=${torneo.id}`)} size="sm" className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark font-bold text-xs h-9 px-4">
                <PlusCircle size={14} className="mr-1" /> Crear partido
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-white/20 text-gray-900 dark:text-white hover:bg-white/10 text-xs h-9 px-4">
                <Edit size={14} className="mr-1" /> Editar torneo
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-9 px-4">
                <Trash2 size={14} className="mr-1" /> Eliminar
              </Button>
            </div>
            </>
          )}

          {tab === 'equipos' && (
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
              {equiposMock.map(eq => (
                <div key={eq.nom} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-gold/30 transition-all">
                  <span className="text-2xl">{eq.emoji}</span>
                  <span className="font-semibold text-[13px] text-white">{eq.nom}</span>
                  <span className="w-3 h-3 rounded-full ml-auto" style={{ backgroundColor: eq.color }} />
                </div>
              ))}
            </div>
          )}

          {tab === 'calendario' && (
            <div className="space-y-3">
              <p className="text-xs text-text-muted mb-4">Calendario de partidos del torneo</p>
              {[
                { dia:'24', mes:'MAY', eq1:'Tigres FC', emoji1:'🐯', eq2:'IA Warriors', emoji2:'🦁', hora:'8:00 PM', lugar:'Cancha Principal', resultado:'3 - 1' },
                { dia:'24', mes:'MAY', eq1:'Code United', emoji1:'💻', eq2:'Sistemas FC', emoji2:'⚙️', hora:'9:30 PM', lugar:'Cancha Principal', resultado:'2 - 2' },
                { dia:'25', mes:'MAY', eq1:'Dragones FC', emoji1:'🐉', eq2:'Los Bits', emoji2:'⚡', hora:'5:00 PM', lugar:'Auditorio Principal' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-gold/30 transition-all">
                  <div className="w-[44px] text-center flex-shrink-0">
                    <b className="block font-[family-name:var(--font-display)] text-base text-white">{m.dia}</b>
                    <span className="text-[8px] text-text-faint uppercase">{m.mes}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[12.5px]">
                      <span>{m.emoji1}</span>
                      <span className="font-semibold text-white truncate">{m.eq1}</span>
                      <span className="text-[9px] text-text-faint font-bold">VS</span>
                      <span className="font-semibold text-white truncate">{m.eq2}</span>
                      <span>{m.emoji2}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/50 mt-0.5">
                      <span>⏰ {m.hora}</span>
                      <span>📍 {m.lugar}</span>
                    </div>
                  </div>
                  {m.resultado && <span className="text-sm font-bold text-gold">{m.resultado}</span>}
                </div>
              ))}
            </div>
          )}

          {tab === 'tabla' && !isUpcoming && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-text-faint uppercase tracking-[.5px] border-b border-border">
                    <th className="text-left py-3 px-4">#</th>
                    <th className="text-left py-3 px-4">Equipo</th>
                    <th className="text-center py-3 px-3">PJ</th>
                    <th className="text-center py-3 px-3">G</th>
                    <th className="text-center py-3 px-3">E</th>
                    <th className="text-center py-3 px-3">P</th>
                    <th className="text-center py-3 px-3">DG</th>
                    <th className="text-right py-3 px-4">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { eq: 'Tigres FC', emoji: '🐯', pj: 12, g: 9, e: 2, p: 1, dg: 18, pts: 29 },
                    { eq: 'Code United', emoji: '🔵', pj: 12, g: 8, e: 2, p: 2, dg: 12, pts: 26 },
                    { eq: 'IA Warriors', emoji: '🦁', pj: 12, g: 7, e: 3, p: 2, dg: 8, pts: 24 },
                    { eq: 'Sistemas FC', emoji: '⚙️', pj: 12, g: 6, e: 2, p: 4, dg: 4, pts: 20 },
                  ].map((r, i) => (
                    <tr key={i} className="border-t border-border hover:bg-white/5">
                      <td className="py-3 px-4 text-text-muted w-8">{i + 1}</td>
                      <td className="py-3 px-4 font-semibold text-white">{i === 0 ? '🏆 ' : ''}{r.emoji} {r.eq}</td>
                      <td className="py-3 px-3 text-center text-white/60">{r.pj}</td>
                      <td className="py-3 px-3 text-center text-green-500">{r.g}</td>
                      <td className="py-3 px-3 text-center text-yellow-400">{r.e}</td>
                      <td className="py-3 px-3 text-center text-red-400">{r.p}</td>
                      <td className="py-3 px-3 text-center text-green-400">+{r.dg}</td>
                      <td className="py-3 px-4 text-right font-bold text-gold">{r.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'llaves' && !isUpcoming && (
            <div className="bg-surface border border-border rounded-2xl p-6 overflow-x-auto">
              <div className="flex items-center justify-center gap-8 min-w-[500px]">
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-sm font-semibold text-white">🐯 Tigres FC <span className="text-gold">2</span></span></div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-sm font-semibold text-white">⚙️ Sistemas FC <span className="text-gold">1</span></span></div>
                  <div className="text-center text-[10px] text-text-faint uppercase tracking-wider mt-1">Cuartos</div>
                </div>
                <div className="text-gold text-2xl">⟶</div>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl border border-gold/30 bg-gold/10"><span className="text-sm font-semibold text-white">🐯 Tigres FC <span className="text-gold">1</span></span></div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-sm font-semibold text-white">🔵 Code United <span className="text-gold">0</span></span></div>
                  <div className="text-center text-[10px] text-text-faint uppercase tracking-wider mt-1">Semifinal</div>
                </div>
                <div className="text-gold text-2xl">⟶</div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-b from-gold/20 to-gold/5 border border-gold/40">
                    <span className="text-sm font-semibold text-white">🏆🐯 Tigres FC <span className="text-gold">3</span></span>
                  </div>
                  <div className="text-center text-[10px] text-text-faint uppercase tracking-wider mt-1">Final</div>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  )
}
