import { http, getErrorMessage } from '../api/http.js'

export async function getFollowersOf(userId, { page = 1, limit = 10 } = {}) {
  try {
    const { data } = await http.get('/relationships', { params: { userId, page, limit } })
    return data.data.relationships
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function follow(followedUserId) {
  try {
    const { data } = await http.post('/relationships', { followedUserId })
    return data.data.relationship
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function unfollow(followedUserId) {
  try {
    await http.delete(`/relationships/${followedUserId}`)
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}
