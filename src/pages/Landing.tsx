import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Users, Calendar, BarChart3, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import { Button } from '@/components/common/button'
import { Badge } from '@/components/common/badge'
import { SpotlightCard } from '@/components/common/spotlight-card'
import { Marquee } from '@/components/common/marquee'
import { torneos, fetchTorneos } from '@/services/torneos'
import { partidos, fetchPartidos } from '@/services/partidos'

const featureSlides = [
  { title: 'Torneos organizados', desc: 'Compite en torneos temáticos con reglas claras y justas.', color: '#FFD700', icon: Trophy },
  { title: 'Equipos comprometidos', desc: 'Únete a una comunidad de jugadores apasionados y competitivos.', color: '#FFD700', icon: Users },
  { title: 'Calendario actualizado', desc: 'Consulta fechas, horarios y resultados en tiempo real.', color: '#FFD700', icon: Calendar },
  { title: 'Estadísticas en vivo', desc: 'Sigue el desempeño de los equipos y jugadores en cada torneo.', color: '#FFD700', icon: BarChart3 },
]

const heroFondos = [
  '/images/landing-arquero2.png',
  '/images/landing-futbol2.png',
]

const torneosDestacados = [
  {
    img: '/images/1.png',
    badgeLabel: 'Finalizado',
    badgeClass: 'bg-white/15 text-white border border-white/20 backdrop-blur-sm',
    categoria: 'Torneo oficial',
    titulo: 'TechCup 2026-I',
    fecha: 'Mar 3 – Jun 14, 2026',
    equipos: 32,
    jugadores: 384,
    canchas: 4,
  },
  {
    img: '/images/2.png',
    badgeLabel: 'Próximo',
    badgeClass: 'bg-purple-mid text-white',
    categoria: 'Torneo oficial',
    titulo: 'TechCup 2026-II',
    fecha: 'Ago 20 – Nov 30, 2026',
    equipos: 32,
    jugadores: 384,
    canchas: 4,
  },
  {
    img: '/images/3.png',
    badgeLabel: 'Relámpago',
    badgeClass: 'bg-purple-mid/20 text-purple-mid border border-purple-mid/40 backdrop-blur-sm',
    categoria: 'Torneo relámpago',
    titulo: 'TechCup Relámpago 2026',
    fecha: 'Sep 2026',
    equipos: 16,
    jugadores: 192,
    canchas: 2,
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [activeFeature, setActiveFeature] = useState(0)
  const [heroImg, setHeroImg] = useState(0)
  const [activeTorneo, setActiveTorneo] = useState(0)
  const [torneoDir, setTorneoDir] = useState(1)

  useEffect(() => { fetchTorneos(); fetchPartidos() }, [])

  const prevTorneo = () => {
    setTorneoDir(-1)
    setActiveTorneo(i => (i - 1 + torneosDestacados.length) % torneosDestacados.length)
  }
  const nextTorneo = () => {
    setTorneoDir(1)
    setActiveTorneo(i => (i + 1) % torneosDestacados.length)
  }

  const nextFeature = useCallback(() => {
    setActiveFeature(i => (i + 1) % featureSlides.length)
  }, [])

  useEffect(() => {
    const t = setInterval(nextFeature, 5000)
    return () => clearInterval(t)
  }, [nextFeature])

  useEffect(() => {
    const t = setInterval(() => {
      setTorneoDir(1)
      setActiveTorneo(i => (i + 1) % torneosDestacados.length)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setHeroImg(i => (i + 1) % heroFondos.length)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#E5ECE9] dark:bg-[#0A0614]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Fondo difuminado — fondo.jpg */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="/images/fondo.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-50" style={{ filter: 'blur(40px) saturate(1.8)' }} draggable={false} />
          <div className="absolute inset-0 bg-white/30 dark:bg-[#0A0614]/40" />
        </div>

        {/* Diagonal gold/purple lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[5%] -right-[8%] w-[55%] h-[45%] origin-top-right opacity-[0.12] dark:opacity-[0.18]" style={{ background: 'linear-gradient(135deg, transparent 30%, #F5A623 48%, #F5A623 52%, transparent 70%)', transform: 'skewX(-20deg)' }} />
          <div className="absolute top-[8%] -right-[3%] w-[45%] h-[35%] origin-top-right opacity-[0.08] dark:opacity-[0.12]" style={{ background: 'linear-gradient(135deg, transparent 28%, #F5A623 46%, transparent 65%)', transform: 'skewX(-22deg)' }} />
          <div className="absolute -top-[2%] right-[5%] w-[40%] h-[50%] origin-top-right opacity-[0.06] dark:opacity-[0.10]" style={{ background: 'linear-gradient(135deg, transparent 25%, #8B5CF6 45%, #6D28D9 55%, transparent 75%)', transform: 'skewX(-18deg)' }} />
          <div className="absolute top-[15%] -right-[10%] w-[50%] h-[30%] origin-top-right opacity-[0.04] dark:opacity-[0.07]" style={{ background: 'linear-gradient(135deg, transparent 20%, #A78BFA 40%, transparent 60%)', transform: 'skewX(-25deg)' }} />
          <div className="absolute top-[5%] right-[15%] w-[30%] h-[25%] origin-top-right opacity-[0.06] dark:opacity-[0.09]" style={{ background: 'linear-gradient(135deg, transparent 40%, #F5A623 50%, transparent 60%)', transform: 'skewX(-15deg)' }} />
          <div className="absolute bottom-[10%] -left-[5%] w-[35%] h-[20%] opacity-[0.03] dark:opacity-[0.05]" style={{ background: 'linear-gradient(115deg, transparent 20%, #6D28D9 45%, transparent 70%)', transform: 'skewX(-20deg)' }} />
        </div>

        {/* Mallas de puntos — dorado abajo-izq, morado derecha */}
        <div className="absolute bottom-8 left-8 w-[200px] h-[200px] opacity-20 dark:opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F5A623 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute top-[20%] right-12 w-[160px] h-[300px] opacity-15 dark:opacity-25 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6D28D9 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Radial glows */}
        <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-100" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.15) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-100" style={{ background: 'radial-gradient(ellipse at 70% 60%, rgba(245,166,35,0.08) 0%, transparent 50%)' }} />
        {/* Glow intenso detrás del jugador */}
        <div className="absolute left-[10%] top-[20%] w-[400px] h-[400px] rounded-full bg-gold/20 blur-[120px] pointer-events-none opacity-60" />
        <div className="absolute left-[5%] top-[30%] w-[250px] h-[250px] rounded-full bg-purple-mid/30 blur-[100px] pointer-events-none opacity-40" />

        {/* Fondo de pantalla completo — según modo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src="/images/fondo.png" alt="" className="absolute inset-0 w-full h-full object-cover dark:block hidden" />
          <img src="/images/fondo-blanco.png" alt="" className="absolute inset-0 w-full h-full object-cover block dark:hidden" />
          <div className="absolute inset-0 dark:block hidden" style={{ boxShadow: 'inset 0 0 150px 80px rgba(10,6,20,0.95)' }} />
          <div className="absolute inset-0 block dark:hidden" style={{ boxShadow: 'inset 0 0 150px 80px rgba(229,236,233,0.95)' }} />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-8 pt-[95px] pb-10 min-h-[620px] flex items-start">

          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute top-[5%] left-[-10%] w-[60%] h-[80%] rounded-full border border-[#8B5CF6]/10 dark:border-white/5 max-lg:hidden" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }} className="absolute bottom-[10%] right-[-5%] w-[50%] h-[60%] rounded-full border border-[#F5A623]/15 dark:border-gold/10 max-lg:hidden" />
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-14 items-center w-full max-lg:grid-cols-1 max-lg:text-center relative z-[2]">
            {/* Imagen — IZQUIERDA */}
            <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }} className="relative flex items-center justify-center max-lg:hidden">
              <div className="relative w-full max-w-[700px] aspect-[4/3]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={heroImg}
                    src={heroFondos[heroImg]}
                    alt="Jugador TechCup"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                </AnimatePresence>
                <motion.div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[200px] h-[20px] rounded-full bg-black/30 blur-xl"
                  animate={{ scaleX: [1, 0.8, 1], opacity: [0.3, 0.15, 0.3] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              {/* Dots del carrusel */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                {heroFondos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroImg(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === heroImg ? 'bg-gold w-5' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Texto — DERECHA */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }} className="@container">
              <div className="overflow-x-visible overflow-y-hidden pb-4 mb-4">
                <motion.h1 initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }} className="font-[family-name:var(--font-display-alt)] font-bold text-[clamp(52px,20cqw,110px)] leading-[1.3] tracking-[.5px] uppercase italic w-full">                  <span className="text-[#3D1A6B] dark:text-[#F7EDE2]">TECH</span>
                  <span style={{ background: 'linear-gradient(135deg, #A5610A 0%, #BD7712 25%, #F5A623 50%, #FBC946 75%, #FBD559 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', paddingRight: '0.25em', backgroundOrigin: 'padding-box' }}>CUP</span>
                </motion.h1>
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }} className="font-[family-name:var(--font-display)] text-[clamp(16px,2vw,21px)] font-semibold tracking-[.4px] uppercase text-[#5B4A7A] dark:text-gray-light leading-tight mb-5">
                Torneos de fútbol de la decanatura de<br /><span className="text-gold">Ingeniería de Sistemas</span>
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }} className="text-base leading-relaxed text-[#7A6B99] dark:text-text-muted max-w-[520px] mb-10 max-lg:mx-auto">
                La pagina que conecta talento, pasión y tecnología. Vive la experiencia de representar a tu equipo y dejar tu huella en la cancha.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.5 }} className="flex gap-3.5 flex-wrap max-lg:justify-center">
                <Button onClick={() => navigate('/torneos')} className="rounded-full bg-gold hover:bg-gold-dark text-[#1D0440] font-bold px-7 py-3.5 h-auto text-sm shadow-lg shadow-gold/30 hover:shadow-gold/50 hover:scale-105 transition-all duration-300 group">
                  Inscribe tu equipo <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Texto inferior derecha — encima de todo */}
        <div className="absolute bottom-8 right-8 z-20 max-w-[360px] text-right max-md:hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-md px-6 py-5 shadow-lg">
          <p className="font-[family-name:var(--font-display)] text-4xl uppercase leading-[1.1] text-[#3D1A6B] dark:text-white drop-shadow-lg">
            La pasión nos <span className="text-gold">conecta</span>
          </p>
          <div className="flex items-center gap-3 mt-5 justify-end">
            <div className="w-8 h-[2px] rounded-full bg-gold/20" />
            <div className="w-8 h-[2px] rounded-full bg-purple-mid/40" />
            <div className="w-8 h-[2px] rounded-full bg-gold/60" />
          </div>
        </div>
      </section>

      {/* Features — Carrusel con escenas CSS */}
      <section className="pb-[90px] relative z-[3]">
        <div className="absolute left-[-10%] top-[-20%] w-[700px] h-[700px] rounded-full bg-purple-mid/20 blur-[180px] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-8 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="bg-[#E8DFF5]/70 dark:bg-black/30 backdrop-blur-sm border border-[#D4C8E8]/40 dark:border-white/5 rounded-2xl p-[40px] overflow-hidden">
            <div className="flex gap-8 max-lg:flex-col">
              {/* Imagen grande */}
              <div className="flex-[1.6] relative min-h-[420px] rounded-xl overflow-hidden order-1 lg:order-2">
                <AnimatePresence mode="wait">
                  <motion.div key={activeFeature} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35, ease: 'easeInOut' }} className="absolute inset-0">
                    {activeFeature === 0 ? (
                      <img src="/images/feature-torneos.png" alt="" className="absolute inset-0 w-full h-full object-contain" />
                    ) : activeFeature === 1 ? (
                      <img src="/images/feature-equipos.png" alt="" className="absolute inset-0 w-full h-full object-contain" />
                    ) : activeFeature === 2 ? (
                      <img src="/images/feature-calendario.png" alt="" className="absolute inset-0 w-full h-full object-contain" />
                    ) : (
                      <img src="/images/feature-estadisticas.png" alt="" className="absolute inset-0 w-full h-full object-contain" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-16 z-10 bg-gradient-to-t from-white/90 via-white/55 to-transparent dark:from-black/80 dark:via-black/40 dark:to-transparent backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: featureSlides[activeFeature].color }} />
                        <span className="text-xs font-bold tracking-[1.6px] uppercase text-[#3D1A6B]/70 dark:text-white/70">Funcionalidad</span>
                      </div>
                      <h3 className="font-[family-name:var(--font-display)] text-3xl uppercase text-[#3D1A6B] dark:text-white mb-2">{featureSlides[activeFeature].title}</h3>
                      <p className="text-base text-[#3D1A6B]/70 dark:text-white/70 max-w-[450px]">{featureSlides[activeFeature].desc}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Thumbnails — solo los torneos que no están en primer plano */}
              <div className="flex-[0.8] flex flex-col gap-4 justify-center order-2 lg:order-1">
                <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                {featureSlides
                  .map((f, i) => ({ ...f, i }))
                  .filter(item => item.i !== activeFeature)
                  .map(item => {
                    const Icon = item.icon
                    return (
                    <motion.button
                      key={item.i}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      onClick={() => setActiveFeature(item.i)}
                      className="feature-card relative flex items-center gap-6 p-4 rounded-xl bg-[#F3EEFF] dark:bg-[#130B24] border cursor-pointer overflow-hidden group transition-colors duration-300 border-[#D4C8E8]/60 dark:border-[#2A1A4A]/80 hover:border-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.12)]"
                    >
                      {/* Background subtle highlight */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 to-transparent transition-opacity opacity-0 group-hover:opacity-100" />
                      {/* Icon container */}
                      <div className="relative z-10 w-[84px] h-[84px] flex-shrink-0 rounded-xl flex items-center justify-center border border-white/5" style={{ background: 'linear-gradient(180deg, rgba(30,15,60,1) 0%, rgba(20,10,40,1) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.5)' }}>
                        <Icon className="w-8 h-8 text-[#FFD700]" style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.5))' }} />
                        <div className="absolute -bottom-[2px] left-[20%] w-[60%] h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', opacity: 0.8, filter: 'blur(2px)' }} />
                      </div>
                      {/* Text */}
                      <div className="flex-1 relative z-10 py-1 text-left">
                        <h4 className="text-xl font-semibold mb-1 tracking-wide bg-gradient-to-r from-[#8B5A00] to-[#A5610A] dark:from-[#FFE066] dark:to-[#FFB300] bg-clip-text text-transparent">{item.title}</h4>
                        <p className="text-sm text-[#6B5A94] dark:text-[#A592C4] leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
            </div>
            <div className="flex justify-center gap-2 mt-5">
              {featureSlides.map((_, i) => (
                <button key={i} onClick={() => setActiveFeature(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeFeature ? 'w-8 bg-gold' : 'w-1.5 bg-white/20 hover:bg-white/30'}`} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Torneos — Jugador dinámico + tarjetas con escenas */}
      <section className="py-10 pb-[110px] relative overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[700px] h-[700px] rounded-full bg-purple-deep/20 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[5%] w-[600px] h-[600px] rounded-full bg-purple-mid/20 blur-[150px] pointer-events-none" />
        <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full bg-purple-mid/15 blur-[120px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-8 relative">
          {/* Header section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 rounded-full bg-purple-mid" />
              <div>
                <span className="text-lg font-bold tracking-[1.4px] uppercase text-purple-mid">Torneos</span>
                <h2 className="font-[family-name:var(--font-display)] text-xl uppercase tracking-[.5px] text-[#4B2D7A] dark:text-gray-light">Compite y <span className="text-purple-mid">deja tu huella</span></h2>
              </div>
            </div>
          </div>

          {/* Sub-header removed — está dentro del right column */}

          <div className="max-w-[1100px] mx-auto rounded-2xl bg-gradient-to-br from-purple-mid/25 via-[#E4D6FA] to-purple-mid/15 dark:from-[#2d1b4e]/40 dark:via-[#1a0f2e]/30 dark:to-[#0d0720]/40 backdrop-blur-[2px] border border-purple-mid/30 p-6 md:p-8">
            {/* Carrusel — torneo activo en primer plano */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden border border-purple-mid/30 h-[340px] max-md:h-[300px]">
                  <AnimatePresence initial={false} custom={torneoDir} mode="wait">
                    {(() => {
                      const t = torneosDestacados[activeTorneo]
                      return (
                        <motion.div
                          key={activeTorneo}
                          custom={torneoDir}
                          initial={{ opacity: 0, x: 60 * torneoDir }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -60 * torneoDir }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          className="absolute inset-0"
                        >
                          <img src={t.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0614] via-[#0A0614]/60 to-transparent" />
                          <div className="relative h-full flex flex-col justify-between p-7 z-10">
                            <div>
                              <Badge className={`rounded-full text-[10px] font-bold uppercase tracking-[.4px] px-2.5 py-0.5 h-auto w-fit mb-2 ${t.badgeClass}`}>{t.badgeLabel}</Badge>
                              <span className="block text-[10px] tracking-[1.2px] text-purple-mid font-bold uppercase mb-1">{t.categoria}</span>
                              <h3 className="font-[family-name:var(--font-display)] text-3xl uppercase text-white leading-tight">{t.titulo}</h3>
                              <p className="text-[13px] text-white/60 mt-1">Ingeniería de Sistemas</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-[11px] text-white/50 mb-3">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                {t.fecha}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-white/60"><strong className="text-white/90">{t.equipos}</strong> Equipos</span>
                                  <span className="text-[11px] text-white/60"><strong className="text-white/90">{t.jugadores}</strong> Jugadores</span>
                                  <span className="text-[11px] text-white/60"><strong className="text-white/90">{t.canchas}</strong> Canchas</span>
                                </div>
                                <span className="text-[11px] font-bold text-purple-mid bg-purple-mid/10 border border-purple-mid/30 px-3 py-1 rounded-full hover:bg-purple-mid/20 transition-colors cursor-pointer">Ver detalles</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })()}
                  </AnimatePresence>
                </div>

                {/* Flechas */}
                <button onClick={prevTorneo} aria-label="Torneo anterior" className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 hover:bg-purple-mid text-[#4B2D7A] hover:text-white dark:bg-black/40 dark:text-white flex items-center justify-center backdrop-blur-sm transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextTorneo} aria-label="Siguiente torneo" className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 hover:bg-purple-mid text-[#4B2D7A] hover:text-white dark:bg-black/40 dark:text-white flex items-center justify-center backdrop-blur-sm transition-colors">
                  <ChevronRight size={20} />
                </button>

                {/* Indicadores */}
                <div className="flex justify-center gap-2 mt-4">
                  {torneosDestacados.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setTorneoDir(i > activeTorneo ? 1 : -1); setActiveTorneo(i) }}
                      aria-label={`Ir al torneo ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === activeTorneo ? 'w-8 bg-purple-mid' : 'w-1.5 bg-purple-mid/20 hover:bg-purple-mid/40'}`}
                    />
                  ))}
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Manchas — nuestra mascota */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute right-[10%] top-[-40%] w-[500px] h-[500px] rounded-full bg-gold/15 blur-[150px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-8 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 rounded-full bg-gold" />
              <div>
                <span className="text-lg font-bold tracking-[1.4px] uppercase text-gold">Manchas</span>
                <h2 className="font-[family-name:var(--font-display)] text-xl uppercase tracking-[.5px] text-[#4B2D7A] dark:text-gray-light">Nuestra <span className="text-gold">mascota</span></h2>
              </div>
            </div>
          </div>

          <div className="max-w-[1100px] mx-auto rounded-2xl bg-gradient-to-br from-gold/25 via-[#FBEBC9] to-gold/15 dark:from-[#2d1b4e]/40 dark:via-[#1a0f2e]/30 dark:to-[#0d0720]/40 backdrop-blur-[2px] border border-gold/30 p-6 md:p-8">
            <div className="relative rounded-2xl overflow-hidden border border-gold/30">
              <img src="/images/manchas-mascota.png" alt="Manchas, la mascota de TechCup, junto a la selección de fútbol de Ingeniería de Sistemas" className="w-full h-[340px] max-md:h-[300px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0614] via-[#0A0614]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 z-10">
                <span className="block text-[10px] tracking-[1.2px] text-gold font-bold uppercase mb-1">Mascota oficial</span>
                <h3 className="font-[family-name:var(--font-display)] text-3xl uppercase text-white leading-tight">Manchas</h3>
                <p className="text-[13px] text-white/70 mt-1 max-w-[520px]">La mascota oficial de TECH CUP y de la ECI, un símbolo de innovación, trabajo en equipo y pasión por el fútbol.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Últimos Partidos */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute left-[5%] top-[-60%] w-[400px] h-[400px] rounded-full bg-purple-mid/15 blur-[120px] pointer-events-none" />
        <div className="absolute right-[5%] bottom-[-60%] w-[300px] h-[300px] rounded-full bg-gold/10 blur-[100px] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-8 space-y-8">

          {/* ── Recuadro: Resultados en vivo ── */}
          <div className="relative rounded-2xl bg-gradient-to-br from-gold/25 via-[#FBEBC9] to-gold/15 dark:from-[#2d1b4e]/40 dark:via-[#1a0f2e]/30 dark:to-[#0d0720]/40 backdrop-blur-[2px] border border-gold/30 overflow-hidden p-6 md:p-8">
            <div className="absolute -top-[30%] -left-[10%] w-[250px] h-[250px] rounded-full bg-purple-mid/10 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-[30%] -right-[10%] w-[200px] h-[200px] rounded-full bg-gold/10 blur-[80px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-5 relative z-10">
              <span className="w-1 h-6 rounded-full bg-gold" />
              <div>
                <span className="text-[11px] font-bold tracking-[1.4px] uppercase text-gold">En vivo</span>
                <h2 className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[.5px] text-[#4B2D7A] dark:text-gray-light">Resultados <span className="text-gold">en vivo</span></h2>
              </div>
            </div>

            <div className="relative z-10 overflow-hidden">
              <Marquee speed={22} pauseOnHover={true}>
                {(partidos.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PAUSED').length > 0
                  ? partidos.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PAUSED')
                  : partidos.slice(0, 6)
                ).map((m, i) => ({
                  eq1: m.eq1, eq2: m.eq2,
                  score: m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : 'vs',
                  estado: m.status === 'IN_PROGRESS' ? "42'" : m.status === 'PAUSED' ? 'HT' : `${m.dia} ${m.mes}`,
                  color: ['#3B82F6','#06B6D4','#22C55E','#F59E0B','#8B5CF6','#EC4899'][i % 6],
                })).map((m, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-2xl w-[280px] flex-shrink-0 bg-[#E8DFF5]/70 dark:bg-black/30 backdrop-blur-sm border-2 border-green-500 shadow-sm hover:shadow-[0_10px_28px_rgba(34,197,94,0.25)] hover:-translate-y-1 transition-all duration-300 p-4">
                    <div className="absolute -inset-[50%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(245,166,35,0.06), transparent 60%)' }} />
                    <div className="flex items-center justify-center mb-2.5">
                      <span className="flex items-center gap-1.5 text-[13px] font-black tracking-[.3px] px-3 py-1 rounded-full bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.55)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {m.estado}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: m.color + '20', color: m.color }}>{m.eq1.split(' ').pop()?.substring(0, 3) || m.eq1.substring(0, 3)}</div>
                        <span className="text-[11px] font-semibold text-[#4B2D7A] dark:text-gray-light text-center leading-tight truncate w-full">{m.eq1}</span>
                      </div>
                      <div className="flex flex-col items-center px-1">
                        <span className="text-3xl font-black leading-none text-gold">{m.score}</span>
                        <span className="text-xs text-[#9B8AB5] dark:text-text-faint font-bold uppercase mt-1">VS</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: m.color + '20', color: m.color }}>{m.eq2.split(' ').pop()?.substring(0, 3) || m.eq2.substring(0, 3)}</div>
                        <span className="text-[11px] font-semibold text-[#4B2D7A] dark:text-gray-light text-center leading-tight truncate w-full">{m.eq2}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>

          {/* ── Recuadro: Partidos finalizados ── */}
          <div className="relative rounded-2xl bg-gradient-to-br from-purple-mid/25 via-[#E4D6FA] to-purple-mid/15 dark:from-[#2d1b4e]/40 dark:via-[#1a0f2e]/30 dark:to-[#0d0720]/40 backdrop-blur-[2px] border border-purple-mid/30 overflow-hidden p-6 md:p-8">
            <div className="absolute -top-[30%] -left-[10%] w-[250px] h-[250px] rounded-full bg-purple-mid/10 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-[30%] -right-[10%] w-[200px] h-[200px] rounded-full bg-purple-mid/10 blur-[80px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-5 relative z-10">
              <span className="w-1 h-6 rounded-full bg-purple-mid" />
              <div>
                <span className="text-[11px] font-bold tracking-[1.4px] uppercase text-purple-mid">Finalizados</span>
                <h2 className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[.5px] text-[#4B2D7A] dark:text-gray-light">Últimos <span className="text-purple-mid">resultados</span></h2>
              </div>
            </div>

            <div className="relative z-10 overflow-hidden">
              <Marquee speed={22} pauseOnHover={true}>
                {(partidos.filter(p => p.status === 'FINISHED').length > 0
                  ? partidos.filter(p => p.status === 'FINISHED')
                  : partidos.slice(0, 6)
                ).map((m, i) => ({
                  eq1: m.eq1, eq2: m.eq2,
                  score: m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : 'vs',
                  estado: 'Final',
                  color: ['#8B5CF6','#6D28D9','#7C3AED','#8B5CF6','#6D28D9','#7C3AED'][i % 6],
                })).map((m, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl w-[280px] flex-shrink-0 bg-[#E8DFF5]/70 dark:bg-black/30 backdrop-blur-sm border-2 border-red-500 shadow-sm hover:shadow-[0_10px_28px_rgba(239,68,68,0.25)] hover:-translate-y-1 transition-all duration-300 p-4">
                    <div className="absolute -inset-[50%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.06), transparent 60%)' }} />
                    <div className="flex items-center justify-center mb-2.5">
                      <span className="flex items-center gap-1.5 text-[13px] font-black tracking-[.3px] px-3 py-1 rounded-full bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        {m.estado}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: m.color + '20', color: m.color }}>{m.eq1.split(' ').pop()?.substring(0, 3) || m.eq1.substring(0, 3)}</div>
                        <span className="text-[11px] font-semibold text-[#4B2D7A] dark:text-gray-light text-center leading-tight truncate w-full">{m.eq1}</span>
                      </div>
                      <div className="flex flex-col items-center px-1">
                        <span className="text-3xl font-black leading-none text-[#4B2D7A] dark:text-gray-light">{m.score}</span>
                        <span className="text-xs text-[#9B8AB5] dark:text-text-faint font-bold uppercase mt-1">VS</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: m.color + '20', color: m.color }}>{m.eq2.split(' ').pop()?.substring(0, 3) || m.eq2.substring(0, 3)}</div>
                        <span className="text-[11px] font-semibold text-[#4B2D7A] dark:text-gray-light text-center leading-tight truncate w-full">{m.eq2}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}



