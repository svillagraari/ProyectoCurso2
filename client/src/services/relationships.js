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
  if (!followedUserId || followedUserId === 1) { // Assuming current user is 1
    throw new Error('Invalid user ID');
  }
  try {
    const { data } = await http.post('/relationships', { followedUserId })
    return data.data.relationship
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function unfollow(followedUserId) {
  if (!followedUserId) {
    throw new Error('Invalid user ID');
  }
  try {
    await http.delete(`/relationships/${followedUserId}`)
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function getFollowingOf(userId, { page = 1, limit = 10 } = {}) {
  try {
    const { data } = await http.get('/relationships/following', { params: { userId, page, limit } })
    return data.data.relationships
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function getFollowersCount(userId) {
  try {
    const { data } = await http.get(`/relationships/followers/count/${userId}`)
    return data.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function getFollowingCount(userId) {
  try {
    const { data } = await http.get(`/relationships/following/count/${userId}`)
    return data.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function isFollowing(followedUserId) {
  try {
    const { data } = await http.get(`/relationships/is-following/${followedUserId}`)
    return data.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

// Aliases para compatibilidad con tests
export const followUser = follow
export const unfollowUser = unfollow
export const getFollowers = getFollowersOf
export const getFollowing = getFollowingOf
