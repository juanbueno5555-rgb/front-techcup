import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/common/Sidebar'
import AppTopbar from '@/components/common/AppTopbar'
import Footer from '@/components/common/Footer'
import { SpotlightCard } from '@/components/common/spotlight-card'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/common/button'
import { ArrowLeft, ArrowRight, XCircle, CreditCard, Users, Check } from 'lucide-react'
import { PaymentBrick } from '@/components/PaymentBrick'
import { createPaymentOrder } from '@/api/pagos'
import { inscribirEnTorneo } from '@/services/equipos'
import { torneos } from '@/services/torneos'
import type { PaymentOrderResponse } from '@/types/pagos'
import type { Torneo } from '@/api/tipos'

export default function InscribirEquipo() {
  const { state } = useLocation()
  const teamId = (state as any)?.teamId
  const torneoSuggested = (state as any)?.torneoId

  const torneosAbiertos = torneos.filter(t => t.estado === 'upcoming' || t.estado === 'live')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [paso, setPaso] = useState(1)
  const [selectedTorneo, setSelectedTorneo] = useState<string | null>(torneoSuggested || null)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentOrderResponse | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const torneo: Torneo | undefined = torneosAbiertos.find(t => t.id === selectedTorneo)

  const handleEnroll = async () => {
    if (!torneo || !teamId) return
    setEnrolling(true)
    setEnrollError(null)
    try {
      console.log('[Pago] Creando orden de pago...')
      const data = await createPaymentOrder({
        enrollmentId: `ENR-${Date.now()}`,
        teamId: 'team-001',
        tournamentId: `TOR-${torneo.id}`,
        amount: 50000,
      })
      console.log('[Pago] Orden creada:', data)
      if (!data.preferenceId) {
        throw new Error('El servidor no devolvió un preferenceId')
      }
      setPaymentData(data)
      setPaso(3)
    } catch (err) {
      console.error('[Pago] Error creando orden:', err)
      const msg = err instanceof Error ? err.message : 'Error al crear la orden de pago'
      setPaymentError(`${msg} — Si el error es de red, el Payment Service (20.12.84.133) no está accesible desde tu entorno local.`)
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <AppTopbar title="Inscribir equipo" onMenuClick={() => setSidebarOpen(true)} />
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-mid/15 blur-[150px] pointer-events-none" />

        <main className="max-w-[600px] mx-auto px-8 py-8 pb-[60px] relative z-10">
          <SpotlightCard accent="gold" className="bg-surface border border-border rounded-2xl p-8">
            {/* Progress */}
            <div className="flex items-center gap-1 mb-6">
              {[1,2,3,4].map(p => (
                <div key={p} className="flex items-center gap-1 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${paso > p ? 'bg-green-500/20 text-green-400 border border-green-500/30' : paso === p ? 'bg-gold text-[#1A1206]' : 'bg-surface text-text-muted border border-border'}`}>
                    {paso > p ? '✓' : p}
                  </div>
                  {p < 4 && <div className={`flex-1 h-px ${paso > p ? 'bg-green-500/50' : 'bg-border'}`} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {paso === 1 && (
                <motion.div key="p1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase mb-1">Seleccionar <span className="text-gold">torneo</span></h2>
                  <p className="text-sm text-text-muted mb-6">Elegí el torneo en el que querés inscribir a tu equipo.</p>
                    <div className="space-y-3 mb-6">
                    {torneosAbiertos.length === 0 && <p className="text-center py-6 text-text-muted">No hay torneos abiertos actualmente.</p>}
                    {torneosAbiertos.map(t => (
                      <button key={t.id} onClick={() => setSelectedTorneo(t.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedTorneo === t.id ? 'border-gold bg-gold/10' : 'border-border bg-black/50 hover:border-purple-mid/50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{t.nombre}</span>
                          <Badge className="rounded-full bg-green-500/15 text-green-400 border border-green-500/30 text-[10px]">{t.estado === 'live' ? 'En curso' : 'Abierto'}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <span>📅 {t.fecha || 'Por definir'}</span>
                          <span>👥 {t.equipos} equipos</span>
                          <span>🏟️ {t.categoria}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button onClick={() => setPaso(2)} disabled={!selectedTorneo} className="w-full rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark h-12 disabled:opacity-40">
                    Siguiente <ArrowRight size={16} />
                  </Button>
                </motion.div>
              )}

              {paso === 2 && (
                <motion.div key="p2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase mb-1">Confirmar <span className="text-gold">inscripción</span></h2>
                  <p className="text-sm text-text-muted mb-6">Revisá la información antes de inscribirte.</p>
                  <div className="bg-black/50 border border-border rounded-xl p-5 space-y-3 mb-6">
                    {[
                      { label: 'Torneo', value: torneo?.nombre },
                      { label: 'Categoría', value: torneo?.categoria },
                      { label: 'Estado', value: torneo?.estado === 'live' ? 'En curso' : 'Próximo' },
                      { label: 'Equipos', value: `${torneo?.equipos} equipos` },
                    ].map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">{d.label}</span>
                        <span className="font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                  {!teamId && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2 text-sm text-yellow-400 mb-4">
                      <Users size={16} /> Creá un equipo primero antes de inscribirte.
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setPaso(1)} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1"><ArrowLeft size={16} /> Anterior</Button>
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling || !teamId}
                      className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark h-12 flex-1 disabled:opacity-40"
                    >
                      {enrolling ? 'Inscribiendo...' : enrolled ? '✓ Inscripto' : 'Inscribir equipo'} <Users size={16} />
                    </Button>
                  </div>
                  {enrollError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-sm text-red-400">
                      <XCircle size={16} /> {enrollError}
                    </div>
                  )}
                  {enrolled && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-sm text-green-400">
                      <Check size={16} /> Inscripción exitosa! Te notificaremos cuando sea aprobada.
                    </div>
                  )}
                </motion.div>
              )}

              {paso === 3 && paymentData && (
                <motion.div key="p3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase mb-1">Realizar <span className="text-gold">pago</span></h2>
                  <p className="text-sm text-text-muted mb-6">Paga con tarjeta, PSE o cuenta de Mercado Pago.</p>

                  <PaymentBrick
                    preferenceId={paymentData.preferenceId}
                    amount={50000}
                    onSubmit={async () => {
                      setPaso(4)
                    }}
                    onError={(err) => {
                      console.error('[Pago] Error del Brick:', err)
                      setPaymentError(typeof err === 'string' ? err : 'Error al cargar el medio de pago. Revisá la consola para más detalles.')
                    }}
                  />

                  <div className="mt-4">
                    <Button variant="outline" onClick={() => { setPaso(2); setPaymentData(null); setPaymentError(null) }}
                      className="rounded-full border-border text-gray-light hover:bg-white/5 h-12">
                      Cancelar y volver
                    </Button>
                  </div>
                </motion.div>
              )}

              {paso === 4 && (
                <motion.div key="p4" initial={{opacity:0}} animate={{opacity:1}} className="text-center py-6">
                  <motion.div initial={{scale:0.9}} animate={{scale:1}}>
                    <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                      <Check size={32} className="text-green-400" />
                    </div>
                    <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase mb-2">Pago <span className="text-green-400">procesado</span></h2>
                    <p className="text-sm text-text-muted mb-6">Tu inscripcion esta en revision. Te notificaremos cuando sea aprobada.</p>
                    <div className="bg-surface border border-border rounded-xl p-4 text-left space-y-2 mb-6">
                      {[
                        { label: 'Torneo', value: torneo?.nombre },
                        { label: 'Equipo', value: 'Sistemas FC' },
                        { label: 'Orden', value: paymentData?.paymentOrderId },
                        { label: 'Monto', value: `$50,000` },
                        { label: 'Estado', value: 'Pago recibido' },
                      ].map((d,i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-text-muted">{d.label}</span>
                          <span className="font-semibold">{d.value}</span>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => { setPaso(1); setSelectedTorneo(null); setPaymentData(null); setPaymentError(null) }}
                      className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark h-12 px-8">
                      Inscribir otro equipo
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </SpotlightCard>
        </main>
        <Footer />
      </div>
    </div>
  )
}
