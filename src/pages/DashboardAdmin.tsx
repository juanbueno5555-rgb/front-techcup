import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '@/components/common/Sidebar'
import AppTopbar from '@/components/common/AppTopbar'
import Footer from '@/components/common/Footer'
import { Button } from '@/components/common/button'
import { SpotlightCard } from '@/components/common/spotlight-card'
import { InteractiveHoverButton } from '@/components/common/interactive-hover-button'
import { Badge } from '@/components/common/badge'
import ManchasFloating from '@/components/common/ManchasFloating'
import { torneos, fetchTorneos } from '@/services/torneos'
import { fetchDashboardMatches, fetchDashboardScorers, getTorneoActivo } from '@/services/dashboard'
import { fetchEventosAuditoria } from '@/services/logistica'
import type { AuditEvent } from '@/api/logistica'
import SoccerField3D from '@/components/employees/SoccerField3D'
import {
  Trophy, CalendarDays, MapPin, Users, Clock, ShieldCheck,
  ClipboardList, Check, X, Search, UserPlus, Settings, Package,
  Filter, MoreHorizontal, AlertCircle, Loader2,
  Shirt, Apple, Truck, RefreshCw, Swords,
  Goal, Medal, Phone, Mail, ChevronRight, Eye,
  ArrowLeft, Activity, Flag, PlusCircle, UserCheck
} from 'lucide-react'

const SIDEBAR_KEY = 'techcup_sidebar_collapsed'
type RolView = 'admin' | 'arbitro' | 'capitan'
type AdminTab = 'dashboard' | 'inscripciones' | 'arbitros' | 'torneos' | 'logistica' | 'reportes'

interface Jugador { id: number; nombre: string; posicion: string; dorsal: number; estaJugando: boolean }
interface TeamDetail {
  id: number; nombre: string; emoji: string; capitan: string
  colorPrimario: string; colorSecundario: string; jugadores: Jugador[]
}
interface MatchEvent {
  id: number; tipo: 'gol' | 'amarilla' | 'roja' | 'sustitucion'
  equipo: string; jugador: string; minuto: number; detalle?: string
}
interface MatchDetail {
  id: number; eq1: string; eq2: string; score1: number; score2: number
  fecha: string; hora: string; lugar: string; estado: 'programado' | 'en_vivo' | 'finalizado'
  eventos: MatchEvent[]; arbitro: string; torneo: string
}
interface PlayerStats {
  id: number; nombre: string; equipo: string; emoji: string; dorsal: number
  posicion: string; goles: number; amarillas: number; rojas: number
  partidosJugados: number; asistencias: number
}
interface Solicitud { id: number; jugador: string; posicion: string; estado: 'pendiente' | 'aceptada' | 'rechazada' }

const POS_ICON: Record<string, string> = { 'Arquero':'🧤', 'Defensor':'🛡️', 'Mediocampista':'🎯', 'Delantero':'⚡' }
const TIPO_EVENTO_ICON: Record<string, { icon:string; color:string }> = {
  'gol': { icon:'⚽', color:'text-green-400' },
  'amarilla': { icon:'🟨', color:'text-yellow-400' },
  'roja': { icon:'🟥', color:'text-red-400' },
  'sustitucion': { icon:'🔄', color:'text-blue-400' },
}

// ─── Mock data ──────────────────────────────────────────────

const equiposDetalle: TeamDetail[] = [
  { id:1, nombre:'Tigres FC', emoji:'🐯', capitan:'Carlos Martínez', colorPrimario:'#EF4444', colorSecundario:'#F97316',
    jugadores:[
      { id:1, nombre:'Carlos Martínez', posicion:'Arquero', dorsal:1, estaJugando:true },
      { id:2, nombre:'Andrés López', posicion:'Defensor', dorsal:4, estaJugando:true },
      { id:3, nombre:'Miguel Ángel Ruiz', posicion:'Defensor', dorsal:2, estaJugando:true },
      { id:4, nombre:'Felipe Torres', posicion:'Defensor', dorsal:3, estaJugando:true },
      { id:5, nombre:'Jorge Hernández', posicion:'Mediocampista', dorsal:5, estaJugando:true },
      { id:6, nombre:'Santiago Pérez', posicion:'Mediocampista', dorsal:8, estaJugando:true },
      { id:7, nombre:'Daniel Castro', posicion:'Mediocampista', dorsal:10, estaJugando:true },
      { id:8, nombre:'Laura Gómez', posicion:'Delantero', dorsal:7, estaJugando:true },
      { id:9, nombre:'Juan Pablo Mora', posicion:'Delantero', dorsal:9, estaJugando:true },
      { id:10, nombre:'Camila Rojas', posicion:'Delantero', dorsal:11, estaJugando:true },
      { id:11, nombre:'Pedro Infante', posicion:'Defensor', dorsal:6, estaJugando:true },
    ]},
  { id:2, nombre:'IA Warriors', emoji:'🦁', capitan:'María López', colorPrimario:'#8B5CF6', colorSecundario:'#A855F7',
    jugadores:[
      { id:12, nombre:'María López', posicion:'Arquero', dorsal:1, estaJugando:true },
      { id:13, nombre:'Carlos Ruiz', posicion:'Defensor', dorsal:4, estaJugando:true },
      { id:14, nombre:'Ana María Gil', posicion:'Defensor', dorsal:2, estaJugando:true },
      { id:15, nombre:'Luis Fernando Díaz', posicion:'Mediocampista', dorsal:5, estaJugando:true },
      { id:16, nombre:'Valentina Orozco', posicion:'Mediocampista', dorsal:8, estaJugando:true },
      { id:17, nombre:'Esteban Quintero', posicion:'Delantero', dorsal:9, estaJugando:true },
      { id:18, nombre:'Manuela Cardona', posicion:'Delantero', dorsal:7, estaJugando:true },
      { id:19, nombre:'David Ocampo', posicion:'Defensor', dorsal:3, estaJugando:true },
      { id:20, nombre:'Sofía Restrepo', posicion:'Mediocampista', dorsal:10, estaJugando:true },
      { id:21, nombre:'Tomás Arango', posicion:'Delantero', dorsal:11, estaJugando:true },
    ]},
  { id:3, nombre:'Code United', emoji:'💻', capitan:'Pedro Sánchez', colorPrimario:'#3B82F6', colorSecundario:'#60A5FA',
    jugadores:[
      { id:22, nombre:'Pedro Sánchez', posicion:'Arquero', dorsal:1, estaJugando:true },
      { id:23, nombre:'Andrés Felipe Marín', posicion:'Defensor', dorsal:4, estaJugando:true },
      { id:24, nombre:'Catalina Jiménez', posicion:'Defensor', dorsal:2, estaJugando:true },
      { id:25, nombre:'Juan Esteban Gil', posicion:'Defensor', dorsal:3, estaJugando:true },
      { id:26, nombre:'Sara Uribe', posicion:'Mediocampista', dorsal:5, estaJugando:true },
      { id:27, nombre:'Daniel Londoño', posicion:'Mediocampista', dorsal:8, estaJugando:true },
      { id:28, nombre:'Andrea Ramírez', posicion:'Delantero', dorsal:9, estaJugando:true },
      { id:29, nombre:'Mateo Zuluaga', posicion:'Delantero', dorsal:7, estaJugando:true },
      { id:30, nombre:'Laura Ceballos', posicion:'Mediocampista', dorsal:10, estaJugando:true },
      { id:31, nombre:'Felipe Jaramillo', posicion:'Defensor', dorsal:6, estaJugando:true },
      { id:32, nombre:'Valeria Osorio', posicion:'Delantero', dorsal:11, estaJugando:true },
      { id:33, nombre:'Samuel Patiño', posicion:'Defensor', dorsal:12, estaJugando:true },
    ]},
  { id:4, nombre:'Dragones FC', emoji:'🐉', capitan:'Ana Torres', colorPrimario:'#F97316', colorSecundario:'#FB923C',
    jugadores:[
      { id:34, nombre:'Ana Torres', posicion:'Arquero', dorsal:1, estaJugando:true },
      { id:35, nombre:'Camilo Andrés Soto', posicion:'Defensor', dorsal:4, estaJugando:true },
      { id:36, nombre:'Mariana Ríos', posicion:'Defensor', dorsal:2, estaJugando:true },
      { id:37, nombre:'Julián Pérez', posicion:'Mediocampista', dorsal:5, estaJugando:true },
      { id:38, nombre:'Gabriela Morales', posicion:'Delantero', dorsal:9, estaJugando:true },
      { id:39, nombre:'Sebastián Cabrera', posicion:'Delantero', dorsal:7, estaJugando:true },
      { id:40, nombre:'Daniela Ortiz', posicion:'Mediocampista', dorsal:8, estaJugando:true },
      { id:41, nombre:'Alejandro Vargas', posicion:'Defensor', dorsal:3, estaJugando:true },
      { id:42, nombre:'Valeria Mejía', posicion:'Mediocampista', dorsal:10, estaJugando:true },
    ]},
  { id:5, nombre:'Sistemas FC', emoji:'⚙️', capitan:'Juan Rangel', colorPrimario:'#22C55E', colorSecundario:'#4ADE80',
    jugadores:[
      { id:43, nombre:'Juan Rangel', posicion:'Arquero', dorsal:1, estaJugando:true },
      { id:44, nombre:'Oscar Medina', posicion:'Defensor', dorsal:4, estaJugando:true },
      { id:45, nombre:'Carolina Páez', posicion:'Defensor', dorsal:2, estaJugando:true },
      { id:46, nombre:'Felipe Arango', posicion:'Defensor', dorsal:3, estaJugando:true },
      { id:47, nombre:'Andrés Gómez', posicion:'Mediocampista', dorsal:5, estaJugando:true },
      { id:48, nombre:'Laura Sánchez', posicion:'Mediocampista', dorsal:8, estaJugando:true },
      { id:49, nombre:'David Rojas', posicion:'Mediocampista', dorsal:10, estaJugando:true },
      { id:50, nombre:'Camila Torres', posicion:'Delantero', dorsal:7, estaJugando:true },
      { id:51, nombre:'Santiago López', posicion:'Delantero', dorsal:9, estaJugando:true },
      { id:52, nombre:'María José Ruiz', posicion:'Delantero', dorsal:11, estaJugando:true },
      { id:53, nombre:'Pedro Pablo Díaz', posicion:'Defensor', dorsal:6, estaJugando:true },
    ]},
]

const partidosDetalle: MatchDetail[] = [
  { id:1, eq1:'Tigres FC', eq2:'IA Warriors', score1:3, score2:1, fecha:'24 MAY', hora:'8:00 PM', lugar:'Cancha Principal Sede Norte', estado:'finalizado', arbitro:'Roberto Gómez', torneo:'TechCup 2026-I',
    eventos:[
      { id:1, tipo:'gol', equipo:'Tigres FC', jugador:'Laura Gómez', minuto:12 },
      { id:2, tipo:'gol', equipo:'IA Warriors', jugador:'Esteban Quintero', minuto:28 },
      { id:3, tipo:'amarilla', equipo:'IA Warriors', jugador:'Carlos Ruiz', minuto:35 },
      { id:4, tipo:'gol', equipo:'Tigres FC', jugador:'Juan Pablo Mora', minuto:52 },
      { id:5, tipo:'sustitucion', equipo:'Tigres FC', jugador:'Santiago Pérez', minuto:60, detalle:'Sale: Jorge Hernández' },
      { id:6, tipo:'roja', equipo:'IA Warriors', jugador:'David Ocampo', minuto:72 },
      { id:7, tipo:'gol', equipo:'Tigres FC', jugador:'Daniel Castro', minuto:85 },
    ]},
  { id:2, eq1:'Code United', eq2:'Sistemas FC', score1:2, score2:2, fecha:'24 MAY', hora:'9:30 PM', lugar:'Cancha Principal Sede Norte', estado:'finalizado', arbitro:'Laura Medina', torneo:'TechCup 2026-I',
    eventos:[
      { id:8, tipo:'gol', equipo:'Code United', jugador:'Andrea Ramírez', minuto:15 },
      { id:9, tipo:'gol', equipo:'Sistemas FC', jugador:'David Rojas', minuto:33 },
      { id:10, tipo:'amarilla', equipo:'Code United', jugador:'Daniel Londoño', minuto:40 },
      { id:11, tipo:'gol', equipo:'Code United', jugador:'Mateo Zuluaga', minuto:67 },
      { id:12, tipo:'gol', equipo:'Sistemas FC', jugador:'Camila Torres', minuto:82 },
    ]},
  { id:3, eq1:'Dragones FC', eq2:'Los Bits', score1:0, score2:0, fecha:'25 MAY', hora:'5:00 PM', lugar:'Auditorio Principal Sede Norte', estado:'programado', arbitro:'Andrés Ruiz', torneo:'TechCup 2026-I', eventos:[]},
]

const playersStats: PlayerStats[] = [
  { id:1, nombre:'Laura Gómez', equipo:'Tigres FC', emoji:'🐯', dorsal:7, posicion:'Delantero', goles:5, amarillas:1, rojas:0, partidosJugados:4, asistencias:2 },
  { id:2, nombre:'Juan Pablo Mora', equipo:'Tigres FC', emoji:'🐯', dorsal:9, posicion:'Delantero', goles:4, amarillas:0, rojas:0, partidosJugados:4, asistencias:3 },
  { id:3, nombre:'Daniel Castro', equipo:'Tigres FC', emoji:'🐯', dorsal:10, posicion:'Mediocampista', goles:3, amarillas:2, rojas:0, partidosJugados:3, asistencias:4 },
  { id:4, nombre:'Esteban Quintero', equipo:'IA Warriors', emoji:'🦁', dorsal:9, posicion:'Delantero', goles:3, amarillas:1, rojas:0, partidosJugados:4, asistencias:1 },
  { id:5, nombre:'Andrea Ramírez', equipo:'Code United', emoji:'💻', dorsal:9, posicion:'Delantero', goles:2, amarillas:0, rojas:0, partidosJugados:3, asistencias:2 },
  { id:6, nombre:'David Rojas', equipo:'Sistemas FC', emoji:'⚙️', dorsal:10, posicion:'Mediocampista', goles:2, amarillas:1, rojas:0, partidosJugados:3, asistencias:1 },
]

// ─── Main Component ──────────────────────────────────────────

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY)
    return stored ? JSON.parse(stored) : false
  })
  const [rolActivo, setRolActivo] = useState<RolView>('admin')
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard')
  const [teamModal, setTeamModal] = useState<TeamDetail | null>(null)
  const [matchModal, setMatchModal] = useState<MatchDetail | null>(null)
  const [playerModal, setPlayerModal] = useState<PlayerStats | null>(null)
  const [lineupModal, setLineupModal] = useState<TeamDetail | null>(null)
  const [posExpandida, setPosExpandida] = useState(false)

  const [listaInscripciones, setListaInscripciones] = useState([
    { id:1, equipo:'Tigres FC', emoji:'🐯', capitan:'Carlos Martínez', torneo:'TechCup 2026-II', fecha:'10/07/2026', comprobante:'comprobante_001.pdf', estado:'pending' as const, jugadores:11 },
    { id:2, equipo:'IA Warriors', emoji:'🦁', capitan:'María López', torneo:'TechCup 2026-II', fecha:'09/07/2026', comprobante:'pago_warriors.jpg', estado:'pending' as const, jugadores:10 },
    { id:3, equipo:'Code United', emoji:'💻', capitan:'Pedro Sánchez', torneo:'TechCup 2026-II', fecha:'08/07/2026', comprobante:'recibo_code.pdf', estado:'approved' as const, jugadores:12 },
    { id:4, equipo:'Dragones FC', emoji:'🐉', capitan:'Ana Torres', torneo:'TechCup 2026-II', fecha:'07/07/2026', comprobante:'voucher_dragones.pdf', estado:'rejected' as const, jugadores:9 },
    { id:5, equipo:'Sistemas FC', emoji:'⚙️', capitan:'Juan Rangel', torneo:'TechCup 2026-II', fecha:'06/07/2026', comprobante:'pago_sistemas.jpg', estado:'pending' as const, jugadores:11 },
  ])
  const [arbitros] = useState([
    { id:1, nombre:'Roberto Gómez', email:'roberto.gomez@gmail.com', telefono:'3001234567', estado:'activo' as const, partidosAsignados:3 },
    { id:2, nombre:'Laura Medina', email:'laura.medina@gmail.com', telefono:'3007654321', estado:'activo' as const, partidosAsignados:2 },
    { id:3, nombre:'Andrés Ruiz', email:'andres.ruiz@gmail.com', telefono:'3009876543', estado:'inactivo' as const, partidosAsignados:0 },
  ])
  type EquipoLog = { id:number; nombre:string; emoji:string; refrigerio:'entregado'|'pendiente'|'no-asignado'; kit:'entregado'|'pendiente'|'no-asignado'; cancha:string }
  const [listaEquiposLog, setListaEquiposLog] = useState<EquipoLog[]>([
    { id:1, nombre:'Tigres FC', emoji:'🐯', refrigerio:'entregado', kit:'entregado', cancha:'Cancha Principal Sede Norte' },
    { id:2, nombre:'IA Warriors', emoji:'🦁', refrigerio:'entregado', kit:'pendiente', cancha:'Cancha Principal Sede Norte' },
    { id:3, nombre:'Code United', emoji:'💻', refrigerio:'pendiente', kit:'pendiente', cancha:'Cancha Principal Sede Norte 2' },
    { id:4, nombre:'Sistemas FC', emoji:'⚙️', refrigerio:'no-asignado', kit:'no-asignado', cancha:'Cancha Principal Sede Norte 2' },
    { id:5, nombre:'Dragones FC', emoji:'🐉', refrigerio:'pendiente', kit:'entregado', cancha:'Auditorio Principal Sede Norte' },
  ])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
    { id:1, jugador:'Jorge Hernández', posicion:'Defensor', estado:'pendiente' },
    { id:2, jugador:'Valentina Orozco', posicion:'Mediocampista', estado:'pendiente' },
    { id:3, jugador:'Sofía Restrepo', posicion:'Mediocampista', estado:'aceptada' },
    { id:4, jugador:'Tomás Arango', posicion:'Delantero', estado:'rechazada' },
  ])
  const [eventosAuditoria, setEventosAuditoria] = useState<AuditEvent[]>([])
  const [logisticaLoading, setLogisticaLoading] = useState(false)
  const [arbitroMatch, setArbitroMatch] = useState(partidosDetalle[0])
  const [eventosTemp, setEventosTemp] = useState<MatchEvent[]>(partidosDetalle[0].eventos)

  const handleCollapse = (val: boolean) => { setSidebarCollapsed(val); localStorage.setItem(SIDEBAR_KEY, JSON.stringify(val)) }
  const sidebarWidth = sidebarOpen ? (sidebarCollapsed ? '72px' : '260px') : '0px'
  const torneoActivo = torneos.find(t => t.estado === 'live') || torneos.find(t => t.estado === 'upcoming') || torneos[0] || {
    id: '', nombre: 'Sin torneo activo', estado: 'upcoming' as const, semestre: '', categoria: '',
    equipos: 0, jugadores: 0, canchas: 0, fecha: '', tag: '', imagen: '',
  }

  useEffect(() => { fetchTorneos() }, [])

  useEffect(() => {
    // Cargar partidos reales del API
    fetchDashboardMatches().then(data => {
      if (data && data.length > 0) {
        partidosDetalle.splice(0, partidosDetalle.length, ...data.map((m, i) => ({
          id: i + 1,
          eq1: m.eq1, eq2: m.eq2,
          score1: m.score1, score2: m.score2,
          fecha: m.fecha, hora: m.hora, lugar: m.lugar,
          estado: m.estado,
          arbitro: '—', torneo: 'TechCup',
          eventos: [] as MatchEvent[],
        })))
      }
    })
    // Cargar goleadores reales del API
    fetchDashboardScorers().then(data => {
      if (data && data.length > 0) {
        playersStats.splice(0, playersStats.length, ...data.map((s, i) => ({
          id: i + 1,
          nombre: s.nombre, equipo: s.equipo,
          emoji: '⚽', dorsal: 0,
          posicion: '',
          goles: s.goles, amarillas: 0, rojas: 0,
          partidosJugados: 0, asistencias: 0,
        })))
      }
    })
  }, [])

  useEffect(() => {
    if (adminTab === 'logistica') {
      setLogisticaLoading(true)
      fetchEventosAuditoria()
        .then(setEventosAuditoria)
        .catch(() => setEventosAuditoria([]))
        .finally(() => setLogisticaLoading(false))
    }
  }, [adminTab])

  const handleAprobar = (id: number) => setListaInscripciones(prev => prev.map(i => i.id === id ? { ...i, estado:'approved' } : i))
  const handleRechazar = (id: number) => setListaInscripciones(prev => prev.map(i => i.id === id ? { ...i, estado:'rejected' } : i))
  const handleSolicitud = (id: number, action: 'aceptada' | 'rechazada') => setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: action } : s))

  const toggleRefrigerio = (id: number) => setListaEquiposLog(prev => prev.map(e => {
    if (e.id !== id) return e
    const map = { pendiente:'entregado' as const, entregado:'no-asignado' as const, 'no-asignado':'pendiente' as const }
    return { ...e, refrigerio: map[e.refrigerio] }
  }))
  const toggleKit = (id: number) => setListaEquiposLog(prev => prev.map(e => {
    if (e.id !== id) return e
    const map = { pendiente:'entregado' as const, entregado:'no-asignado' as const, 'no-asignado':'pendiente' as const }
    return { ...e, kit: map[e.kit] }
  }))

  const openTeamModal = (nombre: string) => {
    setPlayerModal(null); const found = equiposDetalle.find(e => e.nombre === nombre)
    if (found) setTeamModal(found)
  }

  const openPlayerStats = (nombre: string, equipo: string) => {
    const existing = playersStats.find(p => p.nombre === nombre && p.equipo === equipo)
    if (existing) { setPlayerModal(existing); return }
    const eq = equiposDetalle.find(e => e.nombre === equipo)
    const player = eq?.jugadores.find(j => j.nombre === nombre)
    if (player) {
      setPlayerModal({
        id: player.id, nombre: player.nombre, equipo,
        emoji: eq?.emoji || '⚽', dorsal: player.dorsal,
        posicion: player.posicion, goles: 0, amarillas: 0, rojas: 0,
        partidosJugados: 0, asistencias: 0,
      })
    }
  }
  const getEmoji = (nombre: string) => equiposDetalle.find(e => e.nombre === nombre)?.emoji || '⚽'

  // ─── MODALS ─────────────────────────────────────────────

  const renderTeamModal = () => {
    if (!teamModal) return null
    const t = teamModal
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setTeamModal(null)} style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}>
        <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0A0A14] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="relative h-[140px] rounded-t-2xl overflow-hidden">
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.colorPrimario}33, ${t.colorSecundario}22)` }} />
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(at 70% 30%, ${t.colorPrimario} 0%, transparent 60%)` }} />
            <button onClick={() => setTeamModal(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-gray-900 dark:text-white flex items-center justify-center hover:bg-gold transition-colors"><X size={16} /></button>
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
              <span className="text-5xl">{t.emoji}</span>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase text-gray-900 dark:text-white leading-tight">{t.nombre}</h2>
                <div className="flex items-center gap-3 text-[12px] text-gray-600 dark:text-white/60 mt-1">
                  <span className="flex items-center gap-1"><Medal size={12} /> Capitán: {t.capitan}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1"><Users size={12} /> {t.jugadores.length} jugadores</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 px-6 py-4 bg-white/[0.02] border-b border-white/5">
            {[
              { label:'Total', value:t.jugadores.length, color:'text-gray-900 dark:text-white' },
              { label:'🧤 Arqueros', value:t.jugadores.filter(j => j.posicion === 'Arquero').length, color:'text-blue-400' },
              { label:'🛡️ Defensas', value:t.jugadores.filter(j => j.posicion === 'Defensor').length, color:'text-yellow-400' },
              { label:'⚡ Ofensiva', value:t.jugadores.filter(j => j.posicion === 'Mediocampista' || j.posicion === 'Delantero').length, color:'text-green-400' },
            ].map((s, i) => (
              <div key={i} className="text-center p-2 rounded-lg bg-black/30">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="p-6">
            <h3 className="text-[13px] font-semibold text-white/70 uppercase tracking-[.5px] mb-4">Plantilla de jugadores</h3>
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
              {t.jugadores.map(j => {
                const stats = playersStats.find(p => p.nombre === j.nombre && p.equipo === t.nombre)
                return (
                  <button key={j.id} onClick={() => openPlayerStats(j.nombre, t.nombre)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-gold/20 hover:bg-gold/5 transition-all text-left">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-gray-900 dark:text-white flex-shrink-0" style={{ backgroundColor: t.colorPrimario + '44' }}>{j.dorsal}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] font-semibold">{j.nombre}</span>
                        {j.nombre === t.capitan && <Medal size={10} className="text-gold" />}
                      </div>
                      <span className="text-[10px] text-text-muted">{POS_ICON[j.posicion] || '⚽'} {j.posicion} • #{j.dorsal}</span>
                    </div>
                    <ChevronRight size={14} className="text-text-faint" />
                  </button>
                )
              })}
            </div>
            {/* Botón alineación */}
            <div className="px-6 pb-6">
              <button onClick={() => { setTeamModal(null); setLineupModal(t) }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold/10 border border-gold/30 text-gold font-bold text-[12px] hover:bg-gold/20 transition-all">
                <Swords size={16} /> Ver alineación táctica
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMatchModal = () => {
    if (!matchModal) return null
    const eq1 = equiposDetalle.find(e => e.nombre === matchModal.eq1)
    const eq2 = equiposDetalle.find(e => e.nombre === matchModal.eq2)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setMatchModal(null)} style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}>
        <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0A0A14] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="relative h-[140px] rounded-t-2xl overflow-hidden">
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${eq1?.colorPrimario || '#333'}33, ${eq2?.colorPrimario || '#333'}22)` }} />
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(at 50% 40%, rgb(200, 133, 26) 0%, transparent 60%)' }} />
            <button onClick={() => setMatchModal(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-gray-900 dark:text-white flex items-center justify-center hover:bg-gold"><X size={16} /></button>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1"><span className="text-3xl">{eq1?.emoji || '⚽'}</span><p className="text-sm font-semibold mt-1">{matchModal.eq1}</p></div>
                <div className="text-center px-6">
                  <div className="text-4xl font-bold font-[family-name:var(--font-display)]">
                    {matchModal.estado === 'programado' ? <span className="text-white/40">vs</span> : <><span className="text-gold">{matchModal.score1}</span><span className="text-white/40 mx-2">-</span><span className="text-gold">{matchModal.score2}</span></>}
                  </div>
                  <Badge className={`mt-1 rounded-full text-[9px] px-2 py-0.5 h-auto ${matchModal.estado === 'finalizado' ? 'bg-green-500/20 text-green-400 border-green-500/30' : matchModal.estado === 'en_vivo' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                    {matchModal.estado === 'finalizado' ? 'Finalizado' : matchModal.estado === 'en_vivo' ? '🔴 En vivo' : 'Programado'}
                  </Badge>
                </div>
                <div className="text-center flex-1"><span className="text-3xl">{eq2?.emoji || '⚽'}</span><p className="text-sm font-semibold mt-1">{matchModal.eq2}</p></div>
              </div>
              <div className="flex items-center justify-center gap-3 text-[10px] text-gray-500 dark:text-white/50 mt-3">
                <span>📅 {matchModal.fecha}</span><span>⏰ {matchModal.hora}</span><span>📍 {matchModal.lugar}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] border-b border-white/5 text-[11px] text-text-muted">
            <ShieldCheck size={12} className="text-gold" /> Árbitro: {matchModal.arbitro}
            <span className="w-1 h-1 rounded-full bg-white/20" /> 🏆 {matchModal.torneo}
          </div>
          <div className="p-6">
            <h3 className="text-[13px] font-semibold text-white/70 uppercase tracking-[.5px] mb-4">
              <Activity size={14} className="inline mr-1.5 text-gold" /> Cronología del partido
            </h3>
            {matchModal.eventos.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-[13px]">No hay eventos registrados</div>
            ) : (
              <div className="space-y-1 relative before:absolute before:left-[18px] before:top-0 before:bottom-0 before:w-[2px] before:bg-white/10">
                {matchModal.eventos.map(ev => (
                  <div key={ev.id} className="flex items-start gap-3 py-2 relative">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 border border-white/10 flex-shrink-0 z-10 text-sm">
                      {TIPO_EVENTO_ICON[ev.tipo]?.icon || '⚽'}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openPlayerStats(ev.jugador, ev.equipo)}
                          className="text-[13px] font-semibold hover:text-gold transition-colors text-left">
                          {ev.jugador}
                        </button>
                        <span className="text-[10px] text-text-muted">{getEmoji(ev.equipo)} {ev.equipo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <span className={TIPO_EVENTO_ICON[ev.tipo]?.color || ''}>
                          {ev.tipo === 'gol' ? '⚽ Gol' : ev.tipo === 'amarilla' ? '🟨 Amarilla' : ev.tipo === 'roja' ? '🟥 Roja' : '🔄 Sustitución'}
                        </span>
                        <span>• Min {ev.minuto}'</span>
                        {ev.detalle && <span>• {ev.detalle}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <Button onClick={() => { setMatchModal(null); openTeamModal(matchModal.eq1) }} className="flex-1 rounded-full bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 text-[11px] h-9 font-semibold">
              <Users size={13} className="mr-1" /> {matchModal.eq1}
            </Button>
            <Button onClick={() => { setMatchModal(null); openTeamModal(matchModal.eq2) }} className="flex-1 rounded-full bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 text-[11px] h-9 font-semibold">
              <Users size={13} className="mr-1" /> {matchModal.eq2}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderPlayerModal = () => {
    if (!playerModal) return null
    const p = playerModal
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setPlayerModal(null)} style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}>
        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A14] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="relative h-[120px] rounded-t-2xl overflow-hidden bg-gradient-to-br from-purple-deep2 to-purple-black">
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(at 50% 40%, rgb(200, 133, 26) 0%, transparent 60%)' }} />
            <button onClick={() => setPlayerModal(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-gray-900 dark:text-white flex items-center justify-center hover:bg-gold"><X size={16} /></button>
            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end gap-4">
              <div className="w-14 h-14 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center text-xl font-bold text-gold flex-shrink-0">{p.dorsal}</div>
              <div>
                <h2 className="text-lg font-bold">{p.nombre}</h2>
                <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-white/60">
                  <span>{p.emoji} {p.equipo}</span><span>•</span><span>{POS_ICON[p.posicion] || '⚽'} {p.posicion}</span><span>•</span><span>#{p.dorsal}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 p-5 bg-white/[0.02] border-b border-white/5">
            {[
              { label:'Goles', value:p.goles, color:'text-green-400' },
              { label:'Asistencias', value:p.asistencias, color:'text-blue-400' },
              { label:'Amarillas', value:p.amarillas, color:'text-yellow-400' },
              { label:'Rojas', value:p.rojas, color:'text-red-400' },
            ].map((s, i) => (
              <div key={i} className="text-center p-2 rounded-lg bg-black/30">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="p-5 space-y-3">
            <h3 className="text-[12px] font-semibold text-gray-600 dark:text-white/60 uppercase tracking-[.5px]">Estadísticas generales</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-black/30 border border-white/5"><div className="text-lg font-bold text-gray-900 dark:text-white">{p.partidosJugados}</div><div className="text-[10px] text-text-muted">Partidos jugados</div></div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5"><div className="text-lg font-bold text-gray-900 dark:text-white">{p.goles + p.asistencias}</div><div className="text-[10px] text-text-muted">G+A (contribución)</div></div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5"><div className="text-lg font-bold text-gold">{p.partidosJugados > 0 ? (p.goles / p.partidosJugados).toFixed(2) : '0'}</div><div className="text-[10px] text-text-muted">Goles por partido</div></div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5"><div className="text-lg font-bold text-gold">{p.partidosJugados > 0 ? (p.asistencias / p.partidosJugados).toFixed(2) : '0'}</div><div className="text-[10px] text-text-muted">Asistencias por partido</div></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── MODAL: Alineación 3D ─────────────────────────────
  const renderLineupModal = () => {
    if (!lineupModal) return null
    const t = lineupModal
    const homePlayers = t.jugadores.map((j, i) => ({
      name: j.nombre, number: j.dorsal, posicion: j.posicion,
      img: '/images/jugador.png', x: 0, z: -100 + i * 30,
    }))
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setLineupModal(null)}
        style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}>
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl" onClick={e => e.stopPropagation()}>
          <button onClick={() => setLineupModal(null)} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-gray-900 dark:text-white flex items-center justify-center hover:bg-gold transition-colors"><X size={16} /></button>
          <SoccerField3D
            homePlayers={homePlayers}
            awayPlayers={homePlayers.map((p, i) => ({ ...p, x: -p.x, z: -p.z }))}
            homeColor={t.colorPrimario}
            awayColor={t.colorSecundario}
          />
        </div>
      </div>
    )
  }

  // ─── RENDER ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onCollapse={handleCollapse} />
      <div className="min-w-0 transition-all duration-300" style={{ marginLeft: sidebarWidth }}>
        <AppTopbar title="Panel Admin" sidebarOpen={sidebarOpen} sidebarCollapsed={sidebarCollapsed} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-8 pb-[60px] max-md:p-5 relative">
          <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-mid/15 blur-[150px] pointer-events-none" />

          {/* Hero */}
          <section className="relative rounded-2xl overflow-hidden mb-5 border border-white/10">
            <img src="/cancha-juego.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-black/95 via-purple-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-purple-black/40" />
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(at 60% 40%, rgb(200, 133, 26) 0%, transparent 60%)' }} />
            <div className="relative z-10 p-8 max-md:p-5">
              <h2 className="font-[family-name:var(--font-display)] uppercase text-2xl leading-tight mb-1">Panel de <span className="text-gold">Administración</span></h2>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-3">Gestión completa: torneos, equipos, partidos, jugadores y logística.</p>
              <div className="flex items-center gap-2">
                {([['admin','Admin', ShieldCheck] as const, ['arbitro','Árbitro', Flag] as const, ['capitan','Capitán', Medal] as const]).map(([id, label, Icon]) => (
                  <button key={id} onClick={() => setRolActivo(id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                      rolActivo === id ? 'bg-gold text-[#1A1206] border-gold' : 'bg-white/5 text-gray-600 dark:text-white/60 border-white/10 hover:text-gray-900 dark:text-white'
                    }`}><Icon size={13} /> {label}</button>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════ ADMIN ═══════════════ */}
          {rolActivo === 'admin' && (
            <>
              <div className="flex items-center gap-1 mb-6 bg-white/5 border border-white/10 rounded-xl p-1 overflow-x-auto">
                {(['dashboard','inscripciones','arbitros','torneos','logistica','reportes'] as AdminTab[]).map(id => (
                  <button key={id} onClick={() => setAdminTab(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap ${
                      adminTab === id ? 'bg-purple-mid text-white shadow-lg shadow-purple-mid/25' : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:text-white hover:bg-white/5'
                    }`}>
                    {id === 'dashboard' ? <Trophy size={16} /> : id === 'inscripciones' ? <ClipboardList size={16} /> : id === 'arbitros' ? <UserPlus size={16} /> : id === 'torneos' ? <CalendarDays size={16} /> : id === 'logistica' ? <Package size={16} /> : <Activity size={16} />}
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </button>
                ))}
              </div>

              {adminTab === 'dashboard' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-4 max-lg:grid-cols-2 gap-[18px]">
                    {[
                      { icon:'🏆', num:(torneoActivo?.equipos ?? 0).toString(), label:'Equipos', accent:'purple' },
                      { icon:'📅', num:'48', label:'Partidos totales', accent:'gold' },
                      { icon:'⚽', num:'12', label:'Jugados', accent:'purple' },
                      { icon:'📋', num:listaInscripciones.filter(i => i.estado === 'pending').length.toString(), label:'Pendientes', accent:'gold' },
                    ].map((s, i) => (
                      <SpotlightCard key={i} accent={s.accent as 'gold'|'purple'} className="p-5 flex gap-3.5 items-center bg-surface border-border rounded-2xl">
                        <span className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center flex-shrink-0 ${s.accent === 'purple' ? 'bg-purple-mid/20 text-[#b39ef2]' : 'bg-gold/15 text-gold'}`}>{s.icon}</span>
                        <div><div className="font-[family-name:var(--font-display)] text-[26px] leading-none">{s.num}</div><div className="text-xs text-text-muted mt-1">{s.label}</div></div>
                      </SpotlightCard>
                    ))}
                  </div>

                  <SpotlightCard accent="purple" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                    <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4">
                      <CalendarDays size={16} className="text-gold" /> Partidos — click para detalle
                    </h3>
                    {partidosDetalle.map(m => (
                      <button key={m.id} onClick={() => setMatchModal(m)}
                        className="w-full flex items-center gap-4 py-3 px-3 border-b border-border last:border-b-0 hover:bg-white/[0.03] transition-all rounded-lg text-left">
                        <span className="text-xl w-8 text-center">{getEmoji(m.eq1)}</span>
                        <div className="flex-1 text-[13px]">
                          <span className="font-semibold">{m.eq1}</span><span className="text-text-faint mx-2">vs</span><span className="font-semibold">{m.eq2}</span>
                          <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                            <span>{m.fecha}</span><span>•</span><span>{m.hora}</span>
                            {m.estado === 'finalizado' && <span className="text-green-400 font-bold">• {m.score1}-{m.score2}</span>}
                          </div>
                        </div>
                        {m.estado === 'finalizado' && <span className="text-sm font-bold text-gold">{m.score1}-{m.score2}</span>}
                        {m.estado === 'en_vivo' && <span className="text-[10px] text-red-400 font-bold animate-pulse">🔴 EN VIVO</span>}
                        {m.estado === 'programado' && <Badge className="rounded-full text-[9px] bg-blue-500/20 text-blue-400 border-blue-500/30 px-2 py-0.5 h-auto">Programado</Badge>}
                        <ChevronRight size={14} className="text-text-faint" />
                      </button>
                    ))}
                  </SpotlightCard>

                  <SpotlightCard accent="gold" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                    <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4">
                      <Users size={16} className="text-gold" /> Equipos — click para ver plantilla
                    </h3>
                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
                      {equiposDetalle.map(eq => (
                        <button key={eq.id} onClick={() => openTeamModal(eq.nombre)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left">
                          <span className="text-2xl">{eq.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-[13px]">{eq.nombre}</span>
                            <div className="flex items-center gap-2 text-[10px] text-text-muted">
                              <Medal size={10} className="text-gold" /> {eq.capitan} • {eq.jugadores.length} jug.
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-text-faint" />
                        </button>
                      ))}
                    </div>
                  </SpotlightCard>

                  <SpotlightCard accent="purple" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                    <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4">
                      <Goal size={16} className="text-gold" /> Goleadores — click para stats
                    </h3>
                    {[...playersStats].sort((a, b) => b.goles - a.goles).slice(0, 5).map((p, i) => (
                      <button key={p.id} onClick={() => setPlayerModal(p)}
                        className="w-full flex items-center gap-3 py-2.5 px-3 border-b border-border last:border-b-0 hover:bg-white/[0.03] transition-all rounded-lg text-left">
                        <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-gold' : 'text-text-muted'}`}>{i + 1}º</span>
                        <span className="text-lg">{p.emoji}</span>
                        <div className="flex-1 text-[13px]"><span className="font-semibold">{p.nombre}</span><span className="text-text-muted ml-2">{p.equipo}</span></div>
                        <span className="text-sm font-bold text-gold">{p.goles} ⚽</span>
                      </button>
                    ))}
                  </SpotlightCard>
                </div>
              )}

              {adminTab === 'inscripciones' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-[family-name:var(--font-display)] uppercase text-lg tracking-[.5px]">Solicitudes de <span className="text-gold">inscripción</span></h3>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input type="text" placeholder="Buscar..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-[12px] text-gray-900 dark:text-white w-[180px] outline-none focus:border-gold/50" />
                    </div>
                  </div>
                  {listaInscripciones.map(ins => (
                    <div key={ins.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all">
                      <button onClick={() => openTeamModal(ins.equipo)} className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center text-xl flex-shrink-0 hover:bg-gold/25">{ins.emoji}</button>
                      <button onClick={() => openTeamModal(ins.equipo)} className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[14px]">{ins.equipo}</span>
                          <Badge className={`rounded-full text-[9px] px-2 py-0.5 h-auto font-bold ${
                            ins.estado === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : ins.estado === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>{ins.estado === 'pending' ? 'Pendiente' : ins.estado === 'approved' ? 'Aprobado' : 'Rechazado'}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1">
                          <span>👤 {ins.capitan}</span><span>🏆 {ins.torneo}</span><span>📅 {ins.fecha}</span><span>👥 {ins.jugadores} jug.</span>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-full border-white/20 text-gray-900 dark:text-white hover:bg-white/10 text-xs h-8 px-3"><Eye size={12} className="mr-1" /> Comprobante</Button>
                        {ins.estado === 'pending' && (
                          <>
                            <Button onClick={() => handleAprobar(ins.id)} size="sm" className="rounded-full bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 text-xs h-8 px-3"><Check size={12} className="mr-1" /> Aprobar</Button>
                            <Button onClick={() => handleRechazar(ins.id)} size="sm" className="rounded-full bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 text-xs h-8 px-3"><X size={12} className="mr-1" /> Rechazar</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'arbitros' && (
                <div className="space-y-3">
                  <h3 className="font-[family-name:var(--font-display)] uppercase text-lg tracking-[.5px] mb-4">Gestión de <span className="text-gold">árbitros</span></h3>
                  {arbitros.map(a => (
                    <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-mid to-gold flex items-center justify-center text-gray-900 dark:text-white font-bold text-lg flex-shrink-0">
                        {a.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[14px]">{a.nombre}</span>
                          <Badge className={`rounded-full text-[9px] px-2 py-0.5 h-auto ${a.estado === 'activo' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{a.estado === 'activo' ? 'Activo' : 'Inactivo'}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1">
                          <Mail size={10} /> {a.email} <Phone size={10} /> {a.telefono} ⚽ {a.partidosAsignados} partidos
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full border-white/20 text-gray-900 dark:text-white hover:bg-white/10 text-xs h-8 px-3"><ShieldCheck size={12} className="mr-1" /> Asignar</Button>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'torneos' && (
                <div className="space-y-3">
                  <h3 className="font-[family-name:var(--font-display)] uppercase text-lg tracking-[.5px] mb-4">Gestión de <span className="text-gold">torneos</span></h3>
                  {torneos.filter(t => t.estado !== 'closed').map(t => (
                    <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0"><Trophy size={22} className="text-gold" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[14px]">{t.nombre}</span>
                          <Badge className={`rounded-full text-[9px] px-2 py-0.5 h-auto font-bold ${t.estado === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                            {t.estado === 'live' ? 'En curso' : 'Próximo'}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-text-muted mt-1">🏟️ {t.categoria} 📅 {t.fecha} 👥 {t.equipos} equipos</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/torneo/${t.id}`)} className="rounded-full border-white/20 text-gray-900 dark:text-white hover:bg-white/10 text-xs h-8 px-3"><Settings size={12} className="mr-1" /> Configurar</Button>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'logistica' && (
                <div className="space-y-6">
                  {/* ─── Resumen por equipo (mock → API eventual) ─── */}
                  <div className="space-y-3">
                    <h3 className="font-[family-name:var(--font-display)] uppercase text-lg tracking-[.5px]">Refrigerios y <span className="text-gold">kits</span></h3>
                    <p className="text-xs text-text-muted mb-3">Estado por equipo. Los datos mock serán reemplazados cuando el API de Logística exponga un endpoint de resumen agregado.</p>
                    {listaEquiposLog.map(eq => (
                      <div key={eq.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-xl w-8 text-center">{eq.emoji}</span>
                        <div className="flex-1"><span className="font-semibold text-[13.5px]">{eq.nombre}</span><span className="text-[10px] text-text-muted ml-2">📍 {eq.cancha}</span></div>
                        <button onClick={() => toggleRefrigerio(eq.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${eq.refrigerio === 'entregado' ? 'bg-green-500/20 text-green-400 border-green-500/30' : eq.refrigerio === 'pendiente' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-white/5 text-text-muted border-white/10'}`}>
                          <Apple size={12} /> {eq.refrigerio === 'entregado' ? 'Entregado' : eq.refrigerio === 'pendiente' ? 'Pendiente' : 'No asignado'}
                        </button>
                        <button onClick={() => toggleKit(eq.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${eq.kit === 'entregado' ? 'bg-green-500/20 text-green-400 border-green-500/30' : eq.kit === 'pendiente' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-white/5 text-text-muted border-white/10'}`}>
                          <Shirt size={12} /> {eq.kit === 'entregado' ? 'Entregado' : eq.kit === 'pendiente' ? 'Pendiente' : 'No asignado'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ─── Feed de auditoría (real API) ─── */}
                  <div className="space-y-3">
                    <h3 className="font-[family-name:var(--font-display)] uppercase text-lg tracking-[.5px]">
                      <RefreshCw size={14} className="inline mr-1.5 text-gold" />
                      Actividad reciente <span className="text-gold">· Logística</span>
                    </h3>
                    {logisticaLoading ? (
                      <div className="flex items-center gap-2 text-sm text-text-muted py-4">
                        <Loader2 size={14} className="animate-spin" /> Cargando actividad…
                      </div>
                    ) : eventosAuditoria.length > 0 ? (
                      <div className="space-y-2">
                        {eventosAuditoria.map((ev, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                            <span className="text-sm mt-0.5">
                              {ev.tipo.startsWith('DEFINICION') ? '📝' : ev.tipo.startsWith('ENTREGA') || ev.tipo === 'DOTACION_ENTREGADA' ? '✅' : ev.tipo === 'DOTACION_DEVUELTA' ? '↩️' : '📦'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium truncate">{ev.detalle || ev.tipo}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">
                                {new Date(ev.timestamp).toLocaleString('es-CO', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted py-4">No hay eventos de auditoría disponibles. El API requiere rol ADMIN u ORGANIZADOR.</p>
                    )}
                  </div>
                </div>
              )}

              {adminTab === 'reportes' && (
                <div className="space-y-5">
                  <h3 className="font-[family-name:var(--font-display)] uppercase text-lg tracking-[.5px] mb-2">Reportes y <span className="text-gold">estadísticas</span></h3>
                  <p className="text-sm text-text-muted mb-4">Vista general de métricas, rendimiento y actividad del torneo.</p>

                  <div className="grid grid-cols-4 max-lg:grid-cols-2 gap-[18px]">
                    {[
                      { icon: '🏆', num: partidosDetalle.filter(m => m.estado === 'finalizado').length.toString(), label: 'Partidos finalizados', accent: 'gold' },
                      { icon: '⚽', num: partidosDetalle.reduce((sum, m) => sum + (m.score1 || 0) + (m.score2 || 0), 0).toString(), label: 'Goles totales', accent: 'purple' },
                      { icon: '🟨', num: partidosDetalle.reduce((sum, m) => sum + m.eventos.filter(e => e.tipo === 'amarilla').length, 0).toString(), label: 'Tarjetas amarillas', accent: 'gold' },
                      { icon: '🟥', num: partidosDetalle.reduce((sum, m) => sum + m.eventos.filter(e => e.tipo === 'roja').length, 0).toString(), label: 'Tarjetas rojas', accent: 'purple' },
                      { icon: '👥', num: equiposDetalle.length.toString(), label: 'Equipos registrados', accent: 'gold' },
                      { icon: '🧑‍🤝‍🧑', num: equiposDetalle.reduce((sum, e) => sum + e.jugadores.length, 0).toString(), label: 'Jugadores totales', accent: 'purple' },
                      { icon: '📊', num: playersStats.filter(p => p.goles > 0).length.toString(), label: 'Goleadores distintos', accent: 'gold' },
                      { icon: '✅', num: listaInscripciones.filter(i => i.estado === 'approved').length.toString(), label: 'Inscripciones aprobadas', accent: 'purple' },
                    ].map((s, i) => (
                      <SpotlightCard key={i} accent={s.accent as 'gold'|'purple'} className="p-5 flex gap-3.5 items-center bg-surface border-border rounded-2xl">
                        <span className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center flex-shrink-0 ${s.accent === 'purple' ? 'bg-purple-mid/20 text-[#b39ef2]' : 'bg-gold/15 text-gold'}`}>{s.icon}</span>
                        <div><div className="font-[family-name:var(--font-display)] text-[26px] leading-none">{s.num}</div><div className="text-xs text-text-muted mt-1">{s.label}</div></div>
                      </SpotlightCard>
                    ))}
                  </div>

                  <SpotlightCard accent="gold" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                    <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4">
                      <Goal size={16} className="text-gold" /> Tabla de goleadores completa
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-white/10 text-text-muted text-[11px] uppercase tracking-[.5px]">
                            <th className="text-left py-2 pr-2">#</th>
                            <th className="text-left py-2 pr-2">Jugador</th>
                            <th className="text-left py-2 pr-2">Equipo</th>
                            <th className="text-center py-2 pr-2">Goles</th>
                            <th className="text-center py-2 pr-2">Asistencias</th>
                            <th className="text-center py-2 pr-2">Amarillas</th>
                            <th className="text-center py-2 pr-2">Rojas</th>
                            <th className="text-center py-2">PJ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...playersStats].sort((a, b) => b.goles - a.goles).map((p, i) => (
                            <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-2.5 pr-2 font-bold text-gold">{i + 1}º</td>
                              <td className="py-2.5 pr-2 font-semibold">{p.nombre}</td>
                              <td className="py-2.5 pr-2 text-text-muted">{p.emoji} {p.equipo}</td>
                              <td className="py-2.5 pr-2 text-center font-bold text-gold">{p.goles}</td>
                              <td className="py-2.5 pr-2 text-center text-blue-400">{p.asistencias}</td>
                              <td className="py-2.5 pr-2 text-center text-yellow-400">{p.amarillas}</td>
                              <td className="py-2.5 pr-2 text-center text-red-400">{p.rojas}</td>
                              <td className="py-2.5 text-center">{p.partidosJugados}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SpotlightCard>

                  <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-4">
                    <SpotlightCard accent="purple" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                      <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4">
                        <CalendarDays size={16} className="text-gold" /> Partidos por estado
                      </h3>
                      {[
                        { label: 'Finalizados', count: partidosDetalle.filter(m => m.estado === 'finalizado').length, color: 'bg-green-500' },
                        { label: 'En vivo', count: partidosDetalle.filter(m => m.estado === 'en_vivo').length, color: 'bg-red-500' },
                        { label: 'Programados', count: partidosDetalle.filter(m => m.estado === 'programado').length, color: 'bg-blue-500' },
                      ].map((s, i) => {
                        const total = partidosDetalle.length || 1
                        const pct = Math.round((s.count / total) * 100)
                        return (
                          <div key={i} className="flex items-center gap-3 py-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                            <span className="flex-1 text-[13px]">{s.label}</span>
                            <span className="text-sm font-bold">{s.count}</span>
                            <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
                              <div className={`h-full rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] text-text-muted w-8 text-right">{pct}%</span>
                          </div>
                        )
                      })}
                    </SpotlightCard>

                    <SpotlightCard accent="gold" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                      <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4">
                        <Users size={16} className="text-gold" /> Equipos con más jugadores
                      </h3>
                      {[...equiposDetalle].sort((a, b) => b.jugadores.length - a.jugadores.length).map((eq, i) => (
                        <div key={eq.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-b-0">
                          <span className="w-5 text-center text-sm font-bold text-text-muted">{i + 1}º</span>
                          <span className="text-lg">{eq.emoji}</span>
                          <span className="flex-1 text-[13px] font-semibold">{eq.nombre}</span>
                          <span className="text-sm font-bold text-gold">{eq.jugadores.length} jug.</span>
                        </div>
                      ))}
                    </SpotlightCard>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════ ÁRBITRO ═══════════════ */}
          {rolActivo === 'arbitro' && (
            <div className="grid grid-cols-[1.2fr_1fr] gap-5 items-start max-lg:grid-cols-1">
              <SpotlightCard accent="purple" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4"><Flag size={16} className="text-gold" /> Panel del Árbitro</h3>
                <div className="flex gap-2 mb-4">
                  {partidosDetalle.map(m => (
                    <button key={m.id} onClick={() => { setArbitroMatch(m); setEventosTemp(m.eventos) }}
                      className={`flex-1 p-2.5 rounded-xl text-center text-[11px] font-semibold border transition-all ${arbitroMatch.id === m.id ? 'bg-gold/20 text-gold border-gold/40' : 'bg-black/30 text-gray-600 dark:text-white/60 border-white/10'}`}>
                      {m.eq1} vs {m.eq2}
                    </button>
                  ))}
                </div>
                <div className="text-center py-4 mb-4 bg-black/30 rounded-xl border border-white/5">
                  <div className="text-3xl font-bold font-[family-name:var(--font-display)]">
                    <span className="text-gold">{arbitroMatch.score1}</span><span className="text-white/30 mx-3">-</span><span className="text-gold">{arbitroMatch.score2}</span>
                  </div>
                  <div className="text-xs text-text-muted mt-1">{arbitroMatch.eq1} vs {arbitroMatch.eq2}</div>
                </div>
                {/* Registrar evento */}
                <EventoRegistro
                  match={arbitroMatch}
                  onRegistrar={(ev) => setEventosTemp(prev => [...prev, ev])}
                />
              </SpotlightCard>

              <SpotlightCard accent="gold" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-gold" /> Eventos del partido
                </h3>
                <div className="space-y-1 relative before:absolute before:left-[18px] before:top-0 before:bottom-0 before:w-[2px] before:bg-white/10">
                  {eventosTemp.length === 0 ? (
                    <div className="text-center py-8 text-text-muted text-[13px]">Sin eventos aún</div>
                  ) : [...eventosTemp].reverse().map(ev => (
                    <div key={ev.id} className="flex items-start gap-3 py-1.5 relative">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 border border-white/10 flex-shrink-0 z-10 text-sm">
                        {TIPO_EVENTO_ICON[ev.tipo]?.icon || '⚽'}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <button onClick={() => openPlayerStats(ev.jugador, ev.equipo)}
                          className="text-[12.5px] font-semibold hover:text-gold transition-colors text-left">
                          {ev.jugador}
                        </button>
                        <div className="text-[10px] text-text-muted">
                          <span className={TIPO_EVENTO_ICON[ev.tipo]?.color || ''}>{ev.tipo === 'gol' ? 'Gol' : ev.tipo === 'amarilla' ? 'Amarilla' : 'Roja'}</span>
                          <span> • Min {ev.minuto}'</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setEventosTemp([])} variant="outline" size="sm" className="w-full mt-4 rounded-full border-white/10 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:text-white text-xs h-8">
                  <RefreshCw size={12} className="mr-1" /> Finalizar partido
                </Button>
              </SpotlightCard>
            </div>
          )}

          {/* ═══════════════ CAPITÁN ═══════════════ */}
          {rolActivo === 'capitan' && (
            <div className="grid grid-cols-[1.2fr_1fr] gap-5 items-start max-lg:grid-cols-1">
              <SpotlightCard accent="gold" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4">
                  <Medal size={16} className="text-gold" /> {equiposDetalle[0].emoji} {equiposDetalle[0].nombre}
                </h3>
                <div className="space-y-1.5">
                  {equiposDetalle[0].jugadores.map(j => {
                    return (
                      <button key={j.id} onClick={() => openPlayerStats(j.nombre, equiposDetalle[0].nombre)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-black/30 border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-gray-900 dark:text-white flex-shrink-0" style={{ backgroundColor: equiposDetalle[0].colorPrimario + '44' }}>{j.dorsal}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[12.5px] font-semibold">{j.nombre}</span>
                            {j.nombre === equiposDetalle[0].capitan && <Medal size={9} className="text-gold" />}
                          </div>
                          <span className="text-[9.5px] text-text-muted">{POS_ICON[j.posicion] || '⚽'} {j.posicion}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <Button className="flex-1 rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark text-[11px] h-8 font-bold">
                    <Swords size={13} className="mr-1" /> Elegir alineación
                  </Button>
                  <Button variant="outline" className="rounded-full border-white/20 text-gray-900 dark:text-white hover:bg-white/10 text-[11px] h-8">
                    <UserCheck size={13} className="mr-1" /> Invitar
                  </Button>
                </div>
              </SpotlightCard>

              <SpotlightCard accent="purple" className="p-[22px_24px] bg-surface border-border rounded-2xl">
                <h3 className="text-[14.5px] font-semibold tracking-[.3px] flex items-center gap-2 mb-4">
                  <ClipboardList size={16} className="text-gold" /> Solicitudes
                </h3>
                {solicitudes.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-sm">{POS_ICON[s.posicion] || '⚽'}</div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12.5px] font-semibold">{s.jugador}</span>
                      <span className="text-[10px] text-text-muted ml-2">{s.posicion}</span>
                    </div>
                    {s.estado === 'pendiente' ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleSolicitud(s.id, 'aceptada')} className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30"><Check size={13} /></button>
                        <button onClick={() => handleSolicitud(s.id, 'rechazada')} className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30"><X size={13} /></button>
                      </div>
                    ) : (
                      <Badge className={`rounded-full text-[9px] px-2 py-0.5 h-auto ${s.estado === 'aceptada' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {s.estado === 'aceptada' ? 'Aceptada' : 'Rechazada'}
                      </Badge>
                    )}
                  </div>
                ))}
              </SpotlightCard>
            </div>
          )}

          {/* CTA */}
          <section className="flex items-center justify-between gap-5 p-[26px_30px] rounded-[18px] bg-black/60 backdrop-blur-sm border border-white/10 mt-6 max-md:flex-col max-md:items-start">
            <div>
              <h3 className="font-[family-name:var(--font-display)] uppercase text-xl leading-tight mb-1 text-white dark:text-white">Configuración del sistema</h3>
              <p className="text-[13px] text-white/70 dark:text-text-muted">Roles, permisos, categorías y parámetros generales.</p>
            </div>
            <InteractiveHoverButton onClick={() => navigate('/torneos')}>Ir a configuración</InteractiveHoverButton>
          </section>
        </main>
        <Footer />
      </div>
      <ManchasFloating />
      {renderTeamModal()}
      {renderMatchModal()}
      {renderPlayerModal()}
      {renderLineupModal()}
    </div>
  )
}

// ─── EventoRegistro sub-component ────────────────────────────

function EventoRegistro({ match, onRegistrar }: { match: MatchDetail; onRegistrar: (ev: MatchEvent) => void }) {
  const [tipo, setTipo] = useState<'gol' | 'amarilla' | 'roja'>('gol')
  const [jugador, setJugador] = useState('')
  const [minuto, setMinuto] = useState(0)
  const [equipo, setEquipo] = useState(match.eq1)

  const allPlayers = [
    ...(equiposDetalle.find(e => e.nombre === match.eq1)?.jugadores.map(j => ({ ...j, eq: match.eq1 })) || []),
    ...(equiposDetalle.find(e => e.nombre === match.eq2)?.jugadores.map(j => ({ ...j, eq: match.eq2 })) || []),
  ]

  const handleRegister = () => {
    if (!jugador || minuto < 0) return
    onRegistrar({ id: Date.now(), tipo, equipo, jugador, minuto })
    setJugador(''); setMinuto(0)
  }

  return (
    <div className="space-y-3">
      <h4 className="text-[12px] font-semibold text-gray-600 dark:text-white/60 uppercase tracking-[.5px]">Registrar evento</h4>
      <div className="grid grid-cols-3 gap-2">
        {(['gol','amarilla','roja'] as const).map(t => (
          <button key={t} onClick={() => setTipo(t)}
            className={`p-2.5 rounded-xl text-center text-[10px] font-bold border transition-all ${
              tipo === t ? (t === 'gol' ? 'bg-green-500/20 text-green-400 border-green-500/30' : t === 'amarilla' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30')
              : 'bg-black/30 text-gray-600 dark:text-white/60 border-white/10'
            }`}>{t === 'gol' ? '⚽ Gol' : t === 'amarilla' ? '🟨 Amarilla' : '🟥 Roja'}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <select value={equipo} onChange={e => setEquipo(e.target.value)}
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-gray-900 dark:text-white outline-none focus:border-gold/50">
          <option value={match.eq1}>{match.eq1}</option>
          <option value={match.eq2}>{match.eq2}</option>
        </select>
      </div>
      <select value={jugador} onChange={e => setJugador(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-gray-900 dark:text-white outline-none focus:border-gold/50">
        <option value="">Seleccionar jugador...</option>
        {allPlayers.filter(j => j.eq === equipo).map(j => (
          <option key={j.id} value={j.nombre}>{j.nombre} (#{j.dorsal})</option>
        ))}
      </select>
      <div className="flex gap-2">
        <input type="number" placeholder="Minuto" value={minuto || ''} onChange={e => setMinuto(parseInt(e.target.value) || 0)}
          className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-gray-900 dark:text-white outline-none focus:border-gold/50 placeholder:text-white/20" />
        <Button onClick={handleRegister} className="flex-1 rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark font-bold text-xs h-9">
          <PlusCircle size={14} className="mr-1" /> Registrar
        </Button>
      </div>
    </div>
  )
}
