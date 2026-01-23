import { http, getErrorMessage } from '../api/http.js'

export async function getUser(userId) {
  try {
    const { data } = await http.get(`/users/${userId}`)
    return data.data.user
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function updateUser(payload) {
  try {
    const { data } = await http.put('/users', payload)
    return data.data.user
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function searchUsers({ search, page = 1, limit = 10 }) {
  try {
    const { data } = await http.get('/users', { params: { search, page, limit } })
    return data.data.users
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}
