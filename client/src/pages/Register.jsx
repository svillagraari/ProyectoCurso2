import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      nav('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="mb-4 text-center">Crear cuenta</h2>
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label">Usuario</label>
                  <input className="form-control" value={form.username} onChange={(e) => setField('username', e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input className="form-control" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input className="form-control" type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} required />
                </div>
                <button className="btn btn-primary w-100" disabled={loading} type="submit">{loading ? 'Creando…' : 'Registrarse'}</button>
              </form>
              <p className="mt-3 text-center">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
