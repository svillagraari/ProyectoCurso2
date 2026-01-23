import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getUser, updateUser, searchUsers } from '../services/users.js'
import { follow, getFollowersOf, unfollow } from '../services/relationships.js'
import { addStory, deleteStory, getStories } from '../services/stories.js'

export default function Profile() {
  const { user: me } = useAuth()
  const params = useParams()
  const userId = useMemo(() => {
    return params.userId === 'me' ? me?.id : Number(params.userId)
  }, [params.userId, me])

  const [user, setUser] = useState(null)
  const [followers, setFollowers] = useState([])
  const [stories, setStories] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', email: '', profile_pic: '', cover_pic: '' })
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      try {
        const u = await getUser(userId)
        setUser(u)
        setForm({ name: u.name || '', username: u.username || '', email: u.email || '', profile_pic: u.profile_pic || '', cover_pic: u.cover_pic || '' })
        setFollowers(await getFollowersOf(userId))
        setStories(await getStories({ limit: 20 }))
      } catch (err) {
        setError(err.message)
      }
    })()
  }, [userId])

  async function onFollow() {
    await follow(userId)
    setFollowers(await getFollowersOf(userId))
  }

  async function onUnfollow() {
    await unfollow(userId)
    setFollowers(await getFollowersOf(userId))
  }

  async function onSave() {
    const updated = await updateUser(form)
    setUser((u) => ({ ...u, ...updated }))
    setEditing(false)
  }

  async function onAddStory() {
    const url = prompt('URL de la imagen de tu historia:')
    if (!url) return
    await addStory({ img: url })
    setStories(await getStories({ limit: 20 }))
  }

  async function onDeleteStory(id) {
    await deleteStory(id)
    setStories(await getStories({ limit: 20 }))
  }

  async function onSearch(e) {
    e.preventDefault()
    setResults(await searchUsers({ search }))
  }

  const isMe = userId === me?.id
  const iFollow = followers.some((r) => r.follower_user_id === me?.id)

  return (
    <div className="container py-3">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {user && (
        <div className="row g-3">
          <div className="col-12">
            <div className="card shadow-sm">
              {user.cover_pic && (
                <img src={user.cover_pic} alt="cover" className="card-img-top" style={{ maxHeight: 200, objectFit: 'cover' }} />
              )}
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <img className="rounded-circle" style={{ width: 64, height: 64, objectFit: 'cover' }} src={user.profile_pic || 'https://via.placeholder.com/64'} alt="avatar" />
                    <div>
                      <h4 className="mb-0">{user.name} <small className="text-muted">@{user.username}</small></h4>
                      <div className="text-muted">{user.email}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {!isMe && (
                      iFollow ? (
                        <button className="btn btn-outline-danger" onClick={onUnfollow}>Dejar de seguir</button>
                      ) : (
                        <button className="btn btn-outline-primary" onClick={onFollow}>Seguir</button>
                      )
                    )}
                    {isMe && (
                      <button className="btn btn-secondary" onClick={() => setEditing((v) => !v)}>{editing ? 'Cancelar' : 'Editar perfil'}</button>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="mt-3">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nombre</label>
                        <input className="form-control" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Usuario</label>
                        <input className="form-control" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Email</label>
                        <input className="form-control" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Foto perfil URL</label>
                        <input className="form-control" value={form.profile_pic} onChange={(e) => setForm((f) => ({ ...f, profile_pic: e.target.value }))} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Foto portada URL</label>
                        <input className="form-control" value={form.cover_pic} onChange={(e) => setForm((f) => ({ ...f, cover_pic: e.target.value }))} />
                      </div>
                      <div className="col-12 d-flex justify-content-end">
                        <button className="btn btn-primary" onClick={onSave}>Guardar</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Historias</h5>
              {isMe && <button className="btn btn-outline-primary btn-sm" onClick={onAddStory}>Añadir historia</button>}
            </div>
            <div className="row g-2">
              {stories.map((s) => (
                <div key={s.id} className="col-6 col-md-3">
                  <div className="card">
                    <img src={s.img} alt="story" className="card-img-top" style={{ height: 140, objectFit: 'cover' }} />
                    {isMe && s.user_id === me?.id && (
                      <div className="card-body py-2">
                        <button className="btn btn-outline-danger btn-sm" onClick={() => onDeleteStory(s.id)}>Eliminar</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Buscar usuarios</h5>
                <form onSubmit={onSearch} className="d-flex gap-2">
                  <input className="form-control" placeholder="Nombre o usuario" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <button className="btn btn-primary" type="submit">Buscar</button>
                </form>
                <ul className="list-group list-group-flush mt-3">
                  {results.map((u, idx) => (
                    <li key={idx} className="list-group-item">{u.name} (@{u.username})</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
