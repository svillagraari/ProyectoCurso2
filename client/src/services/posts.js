import { http, getErrorMessage } from '../api/http.js'

export async function getPosts({ page = 1, limit = 10 } = {}) {
  try {
    const { data } = await http.get('/posts', { params: { page, limit } })
    return data.data.posts
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function createPost({ desc, img }) {
  try {
    const { data } = await http.post('/posts', { desc, img })
    return data.data.post
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function deletePost(postId) {
  try {
    await http.delete(`/posts/${postId}`)
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function getComments(postId, { page = 1, limit = 10 } = {}) {
  try {
    const { data } = await http.get(`/posts/${postId}/comments`, { params: { page, limit } })
    return data.data.comments
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function addComment(postId, { desc }) {
  try {
    const { data } = await http.post(`/posts/${postId}/comments`, { desc })
    return data.data.comment
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function deleteComment(postId, commentId) {
  try {
    await http.delete(`/posts/${postId}/comments/${commentId}`)
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function getLikes(postId) {
  try {
    const { data } = await http.get(`/posts/${postId}/likes`)
    return data.data.likes
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function toggleLike(postId) {
  try {
    const { data } = await http.post(`/posts/${postId}/likes`)
    return data.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}
