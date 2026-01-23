import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { createPost, deletePost, getComments, getPosts, toggleLike, addComment, getLikes } from '../services/posts.js'
import { Link } from 'react-router-dom'

function PostComposer({ onCreate }) {
  const [desc, setDesc] = useState('')
  const [img, setImg] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const post = await createPost({ desc, img })
      setDesc('')
      setImg('')
      onCreate(post)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-3">
            <textarea className="form-control" placeholder="¿Qué estás pensando?" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div className="mb-3">
            <input className="form-control" placeholder="URL de imagen (opcional)" value={img} onChange={(e) => setImg(e.target.value)} />
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary" disabled={loading || !desc} type="submit">Publicar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const [likes, setLikes] = useState([])
  const [comments, setComments] = useState([])
  const [commentsPage, setCommentsPage] = useState(1)
  const commentsLimit = 5
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    (async () => {
      setLikes(await getLikes(post.id))
      const first = await getComments(post.id, { page: 1, limit: commentsLimit })
      setComments(first)
      setCommentsPage(1)
    })()
  }, [post.id])

  async function onToggleLike() {
    await toggleLike(post.id)
    setLikes(await getLikes(post.id))
  }

  async function onAddComment(e) {
    e.preventDefault()
    if (!commentText) return
    await addComment(post.id, { desc: commentText })
    setCommentText('')
    const first = await getComments(post.id, { page: 1, limit: commentsLimit })
    setComments(first)
    setCommentsPage(1)
  }

  async function loadMoreComments() {
    const nextPage = commentsPage + 1
    const next = await getComments(post.id, { page: nextPage, limit: commentsLimit })
    setComments((c) => [...c, ...next])
    setCommentsPage(nextPage)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <Link className="text-decoration-none" to={`/profile/${post.user_id}`}>{post.name || `Usuario ${post.user_id}`}</Link>
          <div className="small text-muted">{new Date(post.created_at).toLocaleString()}</div>
        </div>
        {post.user_id === user?.id && (
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(post.id)}>Eliminar</button>
        )}
      </div>
      {post.img && <img className="card-img-top" src={post.img} alt="post" />}
      <div className="card-body">
        <p className="card-text">{post.desc}</p>
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-outline-primary" onClick={onToggleLike}>Me gusta ({likes.length})</button>
        </div>
        <form onSubmit={onAddComment} className="d-flex gap-2">
          <input className="form-control" placeholder="Escribe un comentario…" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
          <button className="btn btn-primary" type="submit">Comentar</button>
        </form>
        <div className="mt-3">
          {comments.map((c) => (
            <div key={c.id} className="mb-2">
              <strong>{c.name}</strong>: {c.desc}
            </div>
          ))}
          {comments.length >= commentsLimit && (
            <div className="d-flex justify-content-center mt-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={loadMoreComments}>Cargar más</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => {
    (async () => {
      try {
        const data = await getPosts({ page, limit })
        setPosts(data)
      } catch (err) {
        setError(err.message)
      }
    })()
  }, [page])

  async function onCreate(post) {
    setPosts((p) => [post, ...p])
  }

  async function onDelete(postId) {
    await deletePost(postId)
    setPosts((p) => p.filter((x) => x.id !== postId))
  }

  return (
    <div className="container py-3">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <PostComposer onCreate={onCreate} />

      <div className="row g-3 mt-2">
        {posts.map((p) => (
          <div key={p.id} className="col-12">
            <PostCard post={p} onDelete={onDelete} />
          </div>
        ))}
      </div>

      <nav className="mt-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
          </li>
          <li className="page-item"><span className="page-link">Página {page}</span></li>
          <li className={`page-item ${posts.length < limit ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage((p) => p + 1)}>Siguiente</button>
          </li>
        </ul>
      </nav>
    </div>
  )
}