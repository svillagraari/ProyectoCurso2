import { http, getErrorMessage } from '../api/http.js'

export async function getStories({ page = 1, limit = 10 } = {}) {
  try {
    const { data } = await http.get('/stories', { params: { page, limit } })
    return data.data.stories
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function addStory({ img }) {
  try {
    const { data } = await http.post('/stories', { img })
    return data.data.story
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function deleteStory(storyId) {
  try {
    await http.delete(`/stories/${storyId}`)
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

// Alias para compatibilidad con tests
export const createStory = addStory;
export const getStoriesFeed = getStories;
