import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/common/Sidebar'
import AppTopbar from '@/components/common/AppTopbar'
import Footer from '@/components/common/Footer'
import { SpotlightCard } from '@/components/common/spotlight-card'
import { Button } from '@/components/common/button'
import { Input } from '@/components/common/input'
import { Label } from '@/components/common/label'
import { ArrowLeft, ArrowRight, Check, Upload, CalendarDays, MapPin, Trophy } from 'lucide-react'
import { torneos, fetchTorneos } from '@/services/torneos'
import { fetchEquiposTorneo } from '@/services/equipos'
import { useAuth } from '@/hooks/auth/useAuth'
import type { Torneo } from '@/services/torneos'
import { getMiPerfil } from '@/api/usuarios'
import { crearEquipo } from '@/api/teams'
import { createChat } from '@/api/chat'
import { rememberTeamName } from '@/utils/teamNameCache'

const colores = ['#6D28D9','#F5A623','#22C55E','#EF4444','#3B82F6','#EC4899','#14B8A6','#F97316','#8B5CF6','#000000','#FFFFFF','#1F1F28']
const diseños = ['SF','TC','FC','🚀','⚡','🛡️','🐯','🔥']

/** Genera un logo placeholder a partir de los colores/diseño ya elegidos en el wizard. */
function generarLogoPlaceholder(colorP: string, colorS: string, diseno: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = colorP
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = colorS
  ctx.font = 'bold 96px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(diseno, 128, 128)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('No se pudo generar el logo'))), 'image/png')
  })
}

export default function CrearEquipo() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [paso, setPaso] = useState(0)
  const [torneoElegido, setTorneoElegido] = useState<Torneo | null>(null)
  const [nombre, setNombre] = useState('')
  const [colorP, setColorP] = useState('#6D28D9')
  const [colorS, setColorS] = useState('#F5A623')
  const [diseno, setDiseno] = useState('SF')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null)
  const [torneosLocal, setTorneosLocal] = useState<Torneo[]>(torneos)
  const navigate = useNavigate()
  const { user } = useAuth()
  const isCaptain = user?.isCaptain ?? false

  useEffect(() => {
    fetchTorneos().then(() => setTorneosLocal([...torneos]))
  }, [])

  const torneosActivos = torneosLocal.filter(t => t.estado === 'upcoming' || t.estado === 'live')

  async function crearChatDelEquipo(teamId: string) {
    const miPerfil = await getMiPerfil()
    await createChat('GROUP', teamId, [{ userId: miPerfil.id, role: 'MODERATOR' }])
  }

  async function handleCrearEquipo() {
    setCreating(true)
    setCreateError(null)
    try {
      const miPerfil = await getMiPerfil()
      const logo = await generarLogoPlaceholder(colorP, colorS, diseno)
      const team = await crearEquipo(miPerfil.nombreCompleto, nombre, `${colorP},${colorS}`, logo)
      if (!team || !team.id) throw new Error('No se pudo crear el equipo')
      const teamId = team.id
      setCreatedTeamId(teamId)
      rememberTeamName(teamId, team.name)
      await crearChatDelEquipo(teamId)
      navigate('/inscribir-equipo', { state: { teamId } })
    } catch {
      setCreateError('No pudimos crear el equipo. Intentá de nuevo.')
    } finally {
      setCreating(false)
    }
  }

  const preview = (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-black/50 border border-border">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black shadow-lg" style={{ backgroundColor: colorP, color: colorS }}>
        {diseno}
      </div>
      <div>
        <p className="font-[family-name:var(--font-display)] text-lg uppercase" style={{ color: colorP }}>{nombre || 'Mi equipo'}</p>
        <p className="text-xs text-text-muted">Preview en vivo</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <AppTopbar title="Crear equipo" onMenuClick={() => setSidebarOpen(true)} />
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-mid/15 blur-[150px] pointer-events-none" />
        
        <main className="max-w-[600px] mx-auto px-8 py-8 pb-[60px] relative z-10">
          <SpotlightCard accent="gold" className="bg-surface border border-border rounded-2xl p-8">
            {/* Progress: Torneo → Nombre → Colores → Escudo */}
            <div className="flex items-center justify-between mb-6">
              {[1,2,3,4].map(p => (
                <div key={p} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${paso >= p ? 'bg-gold text-[#1A1206]' : 'bg-surface text-text-muted border border-border'}`}>{p}</div>
                  <span className={`text-xs font-semibold hidden md:block ${paso >= p ? 'text-gold' : 'text-text-muted'}`}>
                    {p === 1 ? 'Torneo' : p === 2 ? 'Nombre' : p === 3 ? 'Colores' : 'Escudo'}
                  </span>
                  {p < 4 && <div className={`w-8 h-px mx-1 ${paso > p ? 'bg-gold' : 'bg-border'}`} />}
                </div>
              ))}
            </div>

            {createdTeamId ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-green-400" />
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase mb-2">
                  Equipo <span className="text-gold">creado</span>
                </h2>
                <p className="text-text-muted text-sm mb-8">"{nombre}" ya está listo para el torneo "{torneoElegido?.nombre}".</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate('/dashboard/jugador')} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark h-12 px-8">
                    Ir al panel
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/mi-equipo')} className="rounded-full border-gold text-gold hover:bg-gold/10 h-12 px-8">
                    Ver mi equipo
                  </Button>
                </div>
              </motion.div>
            ) : (
            <AnimatePresence mode="wait">
              {(() => {
                if (!isCaptain) return (
                  <motion.div key="no-captain" initial={{opacity:0}} animate={{opacity:1}} className="text-center py-10">
                    <span className="text-5xl mb-4 block">👑</span>
                    <h2 className="font-[family-name:var(--font-display)] text-xl uppercase mb-2">Solo capitanes</h2>
                    <p className="text-sm text-text-muted mb-6">Necesitás ser capitán para crear un equipo. Activá la opción desde tu perfil.</p>
                    <Button onClick={() => navigate('/perfil')} className="rounded-full bg-gold/15 border border-gold/40 text-gold hover:bg-gold/25 h-12 px-8">Ir a mi perfil</Button>
                  </motion.div>
                )
                if (paso === 0) return (
                  <motion.div key="p0" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                    <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase mb-1">Elegí un <span className="text-gold">torneo</span></h2>
                    <p className="text-sm text-text-muted mb-6">Seleccioná el torneo al que querés inscribir tu equipo.</p>
                    <div className="space-y-3">
                      {torneosActivos.length === 0 && <p className="text-center py-6 text-text-muted">No hay torneos activos disponibles.</p>}
                      {torneosActivos.map(t => (
                        <button key={t.id} onClick={() => { setTorneoElegido(t); setPaso(1) }}
                          className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                            torneoElegido?.id === t.id
                              ? 'border-gold/50 bg-gold/5'
                              : 'border-border bg-black/30 hover:border-purple-mid/50'
                          }`}>
                          <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-xl shrink-0"><Trophy size={22} className="text-gold" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{t.nombre}</p>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
                              <span className="flex items-center gap-1"><CalendarDays size={11} /> {t.fecha}</span>
                              <span className="flex items-center gap-1"><MapPin size={11} /> {t.categoria}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            t.estado === 'live' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gold/10 text-gold border border-gold/30'
                          }`}>{t.estado === 'live' ? 'En curso' : 'Abierto'}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )
                if (paso === 1) return (
                <motion.div key="p1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase mb-1">Nombre del <span className="text-gold">equipo</span></h2>
                  <p className="text-sm text-text-muted mb-6">Elegí un nombre único para tu equipo.</p>
                  <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Nombre</Label>
                  <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Sistemas FC" className="bg-black border-border text-white rounded-xl h-12 mt-1.5 mb-6 focus-visible:border-gold" />
                  {preview}
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setPaso(0)} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1"><ArrowLeft size={16} /> Anterior</Button>
                    <Button onClick={() => setPaso(2)} disabled={!nombre.trim()} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark h-12 flex-1 disabled:opacity-40">
                      Siguiente <ArrowRight size={16} />
                    </Button>
                  </div>
                </motion.div>
              )

              if (paso === 2) return (
                <motion.div key="p2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase mb-1">Colores del <span className="text-gold">equipo</span></h2>
                  <p className="text-sm text-text-muted mb-6">Elegí los colores que representen a tu equipo.</p>
                  <div className="mb-4">
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Color primario</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {colores.map(c => (
                        <button key={c} onClick={() => setColorP(c)} className={`w-9 h-9 rounded-xl border-2 transition-all ${colorP === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Color secundario</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {colores.map(c => (
                        <button key={c} onClick={() => setColorS(c)} className={`w-9 h-9 rounded-xl border-2 transition-all ${colorS === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  {preview}
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setPaso(2)} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1"><ArrowLeft size={16} /> Anterior</Button>
                    <Button onClick={() => setPaso(3)} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark h-12 flex-1">Siguiente <ArrowRight size={16} /></Button>
                  </div>
                </motion.div>
              )
              if (paso === 3) return (
                <motion.div key="p4" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase mb-1">Escudo del <span className="text-gold">equipo</span></h2>
                  <p className="text-sm text-text-muted mb-6">Elegí un diseño o subí tu propio escudo.</p>
                  <div className="mb-4">
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Elegir diseño</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {diseños.map(d => (
                        <button key={d} onClick={() => setDiseno(d)} className={`h-14 rounded-xl flex items-center justify-center text-lg font-black transition-all ${diseno === d ? 'ring-2 ring-gold bg-gold/10' : 'bg-black/50 border border-border hover:border-gold/50'}`} style={{ backgroundColor: colorP, color: colorS }}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" disabled className="w-full rounded-full border-border text-gray-light hover:bg-white/5 h-12 mb-6 gap-2 opacity-50">
                    <Upload size={16} /> Subir escudo propio (próximamente)
                  </Button>
                  {preview}
                  {createError && <p className="text-sm text-red-400 mt-4">{createError}</p>}
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setPaso(2)} disabled={creating} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1"><ArrowLeft size={16} /> Anterior</Button>
                    <Button onClick={handleCrearEquipo} disabled={creating} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark h-12 flex-1 disabled:opacity-60">
                      <Check size={16} /> {creating ? 'Creando…' : createdTeamId ? 'Ir a inscribir' : 'Crear equipo'}
                    </Button>
                  </div>
                </motion.div>
              )
              return null
              })()}
            </AnimatePresence>
            )}
          </SpotlightCard>
        </main>
        <Footer />
      </div>
    </div>
  )
}
