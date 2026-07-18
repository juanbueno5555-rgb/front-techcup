import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/common/button'
import { Input } from '@/components/common/input'
import { Label } from '@/components/common/label'
import { mapTipoDoc, registerStudentApi, registerGuestApi } from '@/api/register'
import { validateOtp, resendOtp } from '@/services/auth'
import { setJwt } from '@/api/client'
import { useAuth } from '@/hooks/auth/useAuth'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Camera, Loader2 } from 'lucide-react'

type Position = 'portero' | 'defensa' | 'volante' | 'delantero'

const positions: { id: Position; label: string }[] = [
  { id: 'portero', label: 'Portero' },
  { id: 'defensa', label: 'Defensa' },
  { id: 'volante', label: 'Volante' },
  { id: 'delantero', label: 'Delantero' },
]

type Genero = 'masculino' | 'femenino' | 'otro' | 'no_especifica'

interface FormData {
  userType: 'interno' | 'externo' | null
  nombre: string
  email: string
  tipoDoc: string
  nroDoc: string
  fechaNac: string
  genero: Genero | ''
  telefono: string
  direccion: string
  programa: string
  semestre: string
  password: string
  confirmPassword: string
  posicion: string
  dorsal: string
  foto: File | null
  fotoPreview: string
}

const INITIAL_FORM: FormData = {
  userType: null,
  nombre: '',
  email: '',
  tipoDoc: 'Cédula',
  nroDoc: '',
  fechaNac: '',
  genero: '',
  telefono: '',
  direccion: '',
  programa: 'Ing. Sistemas',
  semestre: '1',
  password: '',
  confirmPassword: '',
  posicion: '',
  dorsal: '',
  foto: null,
  fotoPreview: '',
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [fechaExpedicion, setFechaExpedicion] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [googleVerified, setGoogleVerified] = useState(false)
  const [googleToken, setGoogleToken] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const isExterno = form.userType === 'externo'

  // Validación de documento según tipo y fecha de expedición
  const docInfo = useMemo(() => {
    const expYear = fechaExpedicion ? parseInt(fechaExpedicion.split('-')[0]) : 0
    const expAntes2000 = expYear && expYear < 2000

    switch (form.tipoDoc) {
      case 'Cédula':
        if (expAntes2000) {
          return { placeholder: '3 a 8 dígitos (expedida antes del 2000)', min: 3, max: 8 }
        }
        return { placeholder: '10 dígitos (NUIP)', min: 10, max: 10 }
      case 'Tarjeta de ciudadanía':
        return { placeholder: 'Número de tarjeta', min: 6, max: 15 }
      case 'Tarjeta identidad':
        return { placeholder: '10 dígitos', min: 10, max: 10 }
      case 'Pasaporte':
        return { placeholder: 'Número de pasaporte', min: 5, max: 20 }
      default:
        return { placeholder: 'Número de documento', min: 4, max: 20 }
    }
  }, [form.tipoDoc, fechaExpedicion])

  const docError = useMemo(() => {
    if (!form.nroDoc) return null
    const len = form.nroDoc.length
    if (len < docInfo.min) return `Debe tener al menos ${docInfo.min} dígitos`
    if (len > docInfo.max) return `Debe tener máximo ${docInfo.max} dígitos`
    return null
  }, [form.nroDoc, docInfo])

  const steps = useMemo(() => {
    const base = [
      { id: 1, label: 'Tipo de usuario' },
      { id: 2, label: 'Datos personales' },
      { id: 3, label: 'Credenciales' },
      { id: 4, label: 'Verificación' },
    ]
    if (!isExterno) {
      base.push({ id: 5, label: 'Perfil deportivo' })
    }
    return base
  }, [isExterno])

  const totalSteps = steps.length

  const update = (field: keyof FormData, value: string | File | null) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      update('foto', file)
      const reader = new FileReader()
      reader.onload = () => update('fotoPreview', reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const nextStep = () => {
    if (step === 4 && !isExterno) {
      // Auto-login al verificar OTP
      setShowSuccess(true)
      setJwt('demo-jwt-' + Date.now())
      login(form.email || 'demo@techcup.com', 'jugador')
      setTimeout(() => navigate('/dashboard/jugador', { replace: true }), 1500)
    } else {
      setStep(s => Math.min(s + 1, totalSteps))
    }
  }

  const handleResendOtp = async () => {
    if (!pendingUserId) return
    setIsRegistering(true)
    setRegisterError('')
    try {
      await resendOtp(pendingUserId)
      setRegisterError('✅ Código reenviado. Revisá tu correo.')
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'No se pudo reenviar el código.')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleVerifyOtp = async () => {
    setIsRegistering(true)
    setRegisterError('')
    try {
      const tipoDoc = mapTipoDoc(form.tipoDoc)

      if (!pendingUserId) {
        let usuarioId: string

        try {
          const data = form.userType === 'interno'
            ? await registerStudentApi({
                nombreCompleto: form.nombre,
                correoInstitucional: form.email,
                contrasena: form.password,
                programaAcademico: form.programa,
                semestre: parseInt(form.semestre),
                tipoIdentificacion: tipoDoc,
                numeroIdentificacion: form.nroDoc,
              })
            : await registerGuestApi({
                nombreCompleto: form.nombre,
                correo: form.email,
                contrasena: form.password,
                tipoIdentificacion: tipoDoc,
                numeroIdentificacion: form.nroDoc,
              })
          usuarioId = data.usuarioId
        } catch {
          // Backend no disponible — modo local: generamos un OTP acá mismo
          const mockOtp = String(Math.floor(100000 + Math.random() * 900000))
          usuarioId = `mock-${Date.now()}`
          setGeneratedOtp(mockOtp)
          console.log('[register] MOCK OTP:', mockOtp)
          // Auto-fill + auto-verify
          setOtp(Array(6).fill(''))
          mockOtp.split('').forEach((d, i) => {
            setTimeout(() => {
              setOtp(prev => { const n = [...prev]; n[i] = d; return n })
            }, i * 100)
          })
          // Auto-finalizar después de llenar
          setTimeout(() => {
            setShowSuccess(true)
            setTimeout(() => {
              navigate('/dashboard/jugador', { replace: true })
            }, 1500)
          }, mockOtp.length * 100 + 200)
        }

        if (!usuarioId.startsWith('mock-')) {
          setOtp(Array(6).fill(''))
        }
        setPendingUserId(usuarioId)

        if (!usuarioId.startsWith('mock-')) {
          setTimeout(async () => {
            try {
              const { resendOtp } = await import('@/services/auth')
              await resendOtp(usuarioId)
              console.log('[register] OTP reenviado por identity service')
            } catch (e) {
              console.warn('[register] Error al reenviar OTP:', e)
            }
          }, 5000)
        }
      } else {
        const code = otp.join('')

        if (pendingUserId.startsWith('mock-')) {
          // Modo local: validamos contra el OTP generado
          if (code === generatedOtp) {
            setStep(5)
          } else {
            setRegisterError('Código incorrecto. Intentá de nuevo.')
          }
        } else {
          await validateOtp(pendingUserId, code)
          setStep(5)
        }
      }
    } catch (error) {
      console.error('[register] Error:', error)
      setRegisterError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsRegistering(false)
    }
  }

  const handleFinish = async () => {
    setIsRegistering(true)
    setRegisterError(null)
    try {
      setShowSuccess(true)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Error al finalizar.')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-black/90 via-black/80 to-purple-black/90" />
      <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(rgba(255,255,255,.1) 1px, transparent 1px)',backgroundSize:'30px 30px'}} />
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-purple-mid/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[560px] relative z-10">
        <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-purple-black flex-shrink-0">
            <img src="/assets/logo.png" alt="" className="w-full h-full object-cover" />
          </div>
          <span className="font-[family-name:var(--font-display)] font-bold text-lg tracking-[.5px]">
            TECH<span className="text-gold">CUP</span>
          </span>
        </Link>

        {showSuccess && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark mx-auto mb-6 flex items-center justify-center">
                <Check size={36} className="text-[#1A1206]" />
              </motion.div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase tracking-[.5px] mb-2">
                ¡Registro <span className="text-gold">exitoso!</span>
              </h2>
              <p className="text-text-muted">Bienvenido a TechCup. Redirigiendo al inicio de sesión...</p>
            </div>
          </motion.div>
        )}

        <div className="bg-surface border border-border/60 rounded-2xl p-8 md:p-10">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted font-semibold">Paso {step} de {totalSteps}</span>
              <span className="text-xs text-gold font-semibold">{steps[step - 1]?.label}</span>
            </div>
            <div className="flex gap-1.5">
              {steps.map((s) => (
                <div key={s.id}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                    s.id < step ? 'bg-gold' : s.id === step ? 'bg-purple-mid' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Tipo de usuario */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-[.5px] mb-1">¿Quién eres?</h2>
                <p className="text-sm text-text-muted mb-6">Selecciona tu tipo de usuario para continuar.</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { id: 'interno', label: 'Interno', icon: '🎓', desc: 'Estudiante, graduado o profesor' },
                    { id: 'externo', label: 'Externo', icon: '👤', desc: 'Familiar o invitado' },
                  ].map((t) => (
                    <button key={t.id} onClick={() => update('userType', t.id as 'interno' | 'externo')}
                      className={`p-6 rounded-xl border-2 text-center transition-all ${
                        form.userType === t.id ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'border-border bg-black/50 hover:border-purple-mid/50'
                      }`}>
                      <span className="text-3xl mb-3 block">{t.icon}</span>
                      <p className="font-bold text-base">{t.label}</p>
                      <p className="text-xs text-text-muted mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
                <Button onClick={() => setStep(2)} disabled={!form.userType}
                  className="w-full rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark font-bold h-12 disabled:opacity-40">
                  Siguiente <ArrowRight size={16} />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Datos personales */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-[.5px] mb-1">Datos personales</h2>
                <p className="text-sm text-text-muted mb-6">Completa tu información básica.</p>
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  <div>
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Nombre completo</Label>
                    <Input value={form.nombre} onChange={e => update('nombre', e.target.value)} placeholder="Ej. Juan Camilo Rivera" className="bg-black border-border text-white placeholder:text-text-faint rounded-xl h-11 mt-1.5 focus-visible:border-purple-mid" />
                  </div>
                  <div>
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Correo electrónico</Label>
                    <Input value={form.email} onChange={e => update('email', e.target.value)} type="email" placeholder="correo@escuelaing.edu.co" className="bg-black border-border text-white placeholder:text-text-faint rounded-xl h-11 mt-1.5 focus-visible:border-purple-mid" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Tipo documento</Label>
                      <select value={form.tipoDoc} onChange={e => update('tipoDoc', e.target.value)} className="w-full bg-black border border-border text-white rounded-xl h-11 mt-1.5 px-3 text-sm outline-none focus:border-purple-mid">
                        <option>Cédula</option><option>Tarjeta de ciudadanía</option><option>Tarjeta identidad</option><option>Pasaporte</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Número</Label>
                      <Input value={form.nroDoc} onChange={e => update('nroDoc', e.target.value.replace(/\D/g, ''))} placeholder={docInfo.placeholder} className="bg-black border-border text-white placeholder:text-text-faint rounded-xl h-11 mt-1.5 focus-visible:border-purple-mid" />
                      {docError && <p className="text-xs text-red-400 mt-1">{docError}</p>}
                      <p className="text-[10px] text-text-faint mt-1.5 leading-relaxed">Para poder jugar, deberás presentar tu documento físico en la cancha.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Fecha de expedición</Label>
                      <Input value={fechaExpedicion} onChange={e => setFechaExpedicion(e.target.value)} type="date" className="bg-black border-border text-white rounded-xl h-11 mt-1.5 focus-visible:border-purple-mid [color-scheme:dark]" />
                    </div>
                    <div>
                      <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Fecha de nacimiento</Label>
                      <Input value={form.fechaNac} onChange={e => update('fechaNac', e.target.value)} type="date" className="bg-black border-border text-white rounded-xl h-11 mt-1.5 focus-visible:border-purple-mid [color-scheme:dark]" />
                    </div>
                  </div>
                  {!isExterno && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Programa</Label>
                          <select value={form.programa} onChange={e => update('programa', e.target.value)} className="w-full bg-black border border-border text-white rounded-xl h-11 mt-1.5 px-3 text-sm outline-none focus:border-purple-mid">
                            <option>Ing. Sistemas</option><option>Ing. Industrial</option><option>Ing. Civil</option><option>Ing. Mecánica</option><option>Ing. Electrónica</option><option>Matemáticas</option><option>Administración</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Semestre</Label>
                          <select value={form.semestre} onChange={e => update('semestre', e.target.value)} className="w-full bg-black border border-border text-white rounded-xl h-11 mt-1.5 px-3 text-sm outline-none focus:border-purple-mid">
                            {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}° semestre</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1">
                    <ChevronLeft size={16} /> Anterior
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!form.nombre || !form.email || !form.nroDoc || !!docError} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark font-bold h-12 flex-1 disabled:opacity-40">
                    Siguiente <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Credenciales */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-[.5px] mb-1">Credenciales</h2>
                <p className="text-sm text-text-muted mb-6">Crea tu contraseña segura.</p>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Contraseña</Label>
                    <Input value={form.password} onChange={e => update('password', e.target.value)} type="password" placeholder="Mínimo 8 caracteres" className="bg-black border-border text-white placeholder:text-text-faint rounded-xl h-11 mt-1.5 focus-visible:border-purple-mid" />
                  </div>
                  <div>
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Confirmar contraseña</Label>
                    <Input value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} type="password" placeholder="Repite tu contraseña" className="bg-black border-border text-white placeholder:text-text-faint rounded-xl h-11 mt-1.5 focus-visible:border-purple-mid" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className={`w-2 h-2 rounded-full ${form.password.length >= 8 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    Mínimo 8 caracteres · 1 mayúscula · 1 número
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-400">Las contraseñas no coinciden</p>
                  )}
                </div>
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1">
                    <ChevronLeft size={16} /> Anterior
                  </Button>
                  <Button onClick={() => setStep(4)} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark font-bold h-12 flex-1">
                    Siguiente <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Verificación */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                <span className="text-4xl mb-4 block">🔒</span>
                <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-[.5px] mb-1">Verifica tu identidad</h2>

                {isExterno ? (
                  <>
                    <p className="text-sm text-text-muted mb-6">Autoriza con Google para confirmar tu identidad.</p>
                    {googleVerified ? (
                      <div className="flex items-center justify-center gap-2 mb-6 py-3 px-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <Check size={18} className="text-green-400" />
                        <span className="text-sm text-green-400 font-semibold">Identidad verificada con Google</span>
                      </div>
                    ) : (
                      <div className="mb-6 flex justify-center">
                        {import.meta.env.DEV ? (
                          <button type="button" onClick={() => {
                            // Usuarios conocidos — login directo
                            const knownUsers: Record<string, { role: import('@/hooks/auth/useAuth').UserRole; name: string }> = {
                              'juanbueno5555@gmail.com': { role: 'jugador', name: 'Juan Bueno' },
                              'admin@techcup.com': { role: 'organizador', name: 'Admin TechCup' },
                              'arbitro@techcup.com': { role: 'arbitro', name: 'Árbitro TechCup' },
                            }

                            const known = knownUsers[form.email.toLowerCase()]
                            if (known) {
                              login(form.email, known.role, '', known.name)
                              navigate(`/dashboard/${known.role}`, { replace: true })
                              return
                            }

                            // Nuevo usuario
                            setGoogleVerified(true)
                            setGoogleToken('dev-token')
                          }}
                            className="inline-flex items-center justify-center gap-3 rounded-full border border-gold/30 bg-purple-deep/30 text-gold hover:bg-gold/10 hover:text-white h-12 px-6 text-sm font-semibold transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Continuar con Google (Dev)
                          </button>
                        ) : import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                          <GoogleLogin
                            onSuccess={(response: CredentialResponse) => {
                              setGoogleVerified(true)
                              setGoogleToken(response.credential || '')
                            }}
                            onError={() => console.error('Google registration failed')}
                            text="signup_with"
                            shape="pill"
                            size="large"
                            theme="outline"
                          />
                        ) : (
                          <button type="button" className="inline-flex items-center justify-center gap-3 rounded-full border border-gold/30 bg-purple-deep/30 text-gold hover:bg-gold/10 hover:text-white h-12 px-6 text-sm font-semibold transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Continuar con Google
                          </button>
                        )}
                      </div>
                    )}
                    {registerError && (
                      <p className="text-sm text-red-400 mb-4 text-center">{registerError}</p>
                    )}
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(3)} disabled={isRegistering} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1">
                        <ChevronLeft size={16} /> Anterior
                      </Button>
                      <Button onClick={nextStep} disabled={!googleVerified || isRegistering} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark font-bold h-12 flex-1 disabled:opacity-40">
                        {isRegistering ? <><Loader2 size={16} className="animate-spin" /> Creando cuenta</> : <>Finalizar <ArrowRight size={16} /></>}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {!pendingUserId ? (
                      // Fase 1: enviar código
                      <>
                        <p className="text-sm text-text-muted mb-6">
                          Te enviaremos un código de verificación a <strong className="text-gold">{form.email.replace(/(.{3}).+(?=@)/, '$1***')}</strong> para confirmar tu identidad.
                        </p>
                        {generatedOtp && (
                          <div className="mb-4 py-3 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
                            <p className="text-xs text-yellow-400 font-semibold mb-1">Modo desarrollo — servidor no disponible</p>
                            <p className="text-2xl font-bold text-yellow-300 tracking-[8px] font-mono">{generatedOtp}</p>
                            <p className="text-xs text-yellow-400/70 mt-1">Usá este código para verificar</p>
                          </div>
                        )}
                        {registerError && !generatedOtp && (
                          <p className="text-xs text-red-400 mb-4 text-center">{registerError}</p>
                        )}
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setStep(3)} disabled={isRegistering} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1">
                            <ChevronLeft size={16} /> Anterior
                          </Button>
                          <Button onClick={handleVerifyOtp} disabled={isRegistering} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark font-bold h-12 flex-1 disabled:opacity-40">
                            {isRegistering ? <><Loader2 size={16} className="animate-spin" /> Enviando código</> : <>Enviar código <ArrowRight size={16} /></>}
                          </Button>
                        </div>
                      </>
                    ) : (
                      // Fase 2: verificar código
                      <>
                        <p className="text-sm text-text-muted mb-6">
                          Ingresa el código de 6 dígitos enviado a <strong className="text-gold">{form.email.replace(/(.{3}).+(?=@)/, '$1***')}</strong>
                        </p>
                        {generatedOtp && (
                          <div className="mb-4 py-2 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
                            <p className="text-lg font-bold text-yellow-300 tracking-[8px] font-mono">{generatedOtp}</p>
                          </div>
                        )}
                        <div className="flex justify-center gap-2 mb-4">
                          {otp.map((digit, i) => (
                            <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              className="w-12 h-14 bg-black border border-border text-white text-center text-xl font-bold rounded-xl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                              autoFocus={i === 0} />
                          ))}
                        </div>
                        {registerError && (
                          <p className="text-xs text-red-400 mb-4 text-center">{registerError}</p>
                        )}
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={handleResendOtp} disabled={isRegistering} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1">
                            <ChevronLeft size={16} /> Reenviar código
                          </Button>
                          <Button onClick={handleVerifyOtp} disabled={otp.join('').length !== 6 || isRegistering} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark font-bold h-12 flex-1 disabled:opacity-40">
                            {isRegistering ? <><Loader2 size={16} className="animate-spin" /> Verificando</> : <>Verificar <ArrowRight size={16} /></>}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Step 5: Perfil deportivo (solo Interno) */}
            {step === 5 && !isExterno && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-[.5px] mb-1">Perfil deportivo</h2>
                <p className="text-sm text-text-muted mb-6">Cuéntanos sobre tu experiencia en la cancha.</p>
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Posición de juego</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {positions.map((p) => (
                        <button key={p.id} onClick={() => update('posicion', p.id)}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                            form.posicion === p.id ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-black/50 hover:border-purple-mid/50 hover:bg-purple-mid/10'
                          }`}>{p.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Número dorsal</Label>
                    <Input value={form.dorsal} onChange={e => update('dorsal', e.target.value)} type="number" min={1} max={99} placeholder="Ej. 10" className="bg-black border-border text-white placeholder:text-text-faint rounded-xl h-11 mt-1.5 focus-visible:border-purple-mid" />
                  </div>
                  <div>
                    <Label className="text-xs text-text-faint font-semibold uppercase tracking-[.4px]">Foto de perfil</Label>
                    <label className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-purple-mid/50 transition-all cursor-pointer block">
                      {form.fotoPreview ? (
                        <div className="flex flex-col items-center gap-2">
                          <img src={form.fotoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover ring-2 ring-gold/40" />
                          <p className="text-xs text-gold font-semibold">{form.foto?.name}</p>
                        </div>
                      ) : (
                        <><Camera size={32} className="mx-auto text-text-faint mb-2" />
                          <p className="text-sm text-text-muted">Click para subir tu foto</p>
                          <p className="text-xs text-text-faint mt-1">PNG, JPG · Max 5MB</p></>
                      )}
                      <input type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={handleFoto} />
                    </label>
                  </div>
                </div>
                {registerError && (
                  <p className="text-sm text-red-400 mt-4 text-center">{registerError}</p>
                )}
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={() => setStep(4)} disabled={isRegistering} className="rounded-full border-border text-gray-light hover:bg-white/5 h-12 flex-1">
                    <ChevronLeft size={16} /> Anterior
                  </Button>
                  <Button onClick={handleFinish} disabled={!form.posicion || isRegistering} className="rounded-full bg-gold text-[#1A1206] hover:bg-gold-dark font-bold h-12 flex-1 disabled:opacity-40">
                    {isRegistering ? <><Loader2 size={16} className="animate-spin" /> Creando cuenta</> : <>Finalizar <Check size={16} /></>}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-text-muted hover:text-gold transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
