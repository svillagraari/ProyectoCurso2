import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { addStory, deleteStory, getStories } from '../services/stories.js'

export default function Stories() {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const limit = 12
  const [selected, setSelected] = useState(null)

  async function load() {
    try {
      const data = await getStories({ page, limit })
      setStories(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { load() }, [page])

  async function onAdd() {
    const url = prompt('URL o dato de imagen (ej. https://... o base64):')
    if (!url) return
    try {
      await addStory({ img: url })
      setError('')
      setPage(1)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function onDelete(id) {
    try {
      await deleteStory(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Historias</h3>
        <button className="btn btn-primary" onClick={onAdd}>Añadir historia</button>
      </div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="row g-3">
        {stories.map((s) => (
          <div key={s.id} className="col-6 col-md-3 col-lg-2">
            <div className="card h-100">
              <img role="button" onClick={() => setSelected(s)} src={s.img} alt="story" className="card-img-top" style={{ height: 160, objectFit: 'cover' }} />
              {s.user_id === user?.id && (
                <div className="card-body py-2 d-grid">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(s.id)}>Eliminar</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <nav className="mt-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
          </li>
          <li className="page-item"><span className="page-link">Página {page}</span></li>
          <li className={`page-item ${stories.length < limit ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage((p) => p + 1)}>Siguiente</button>
          </li>
        </ul>
      </nav>

      {selected && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Historia</h5>
                <button type="button" className="btn-close" onClick={() => setSelected(null)}></button>
              </div>
              <div className="modal-body p-0">
                <img src={selected.img} alt="story" style={{ width: '100%', height: 'auto' }} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
