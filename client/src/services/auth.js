import { http, getErrorMessage } from '../api/http.js'

export async function login({ email, password }) {
  try {
    const { data } = await http.post('/auth/login', { email, password })
    return data.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function register({ username, name, email, password }) {
  try {
    const { data } = await http.post('/auth/register', { username, name, email, password })
    return data.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}
