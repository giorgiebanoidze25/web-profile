import config from 'src/config'

function api(baseUrl) {
  async function request(url, payload) {
    const response = await fetch(url, payload)
    if (!response.ok || (response.status >= 200 && response.status < 300)) {
      throw Error(response.statusText)
    } else {
      return response
    }
  }

  async function post(path, body) {
    try {
      return request(`${baseUrl}${path}`, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      })
    } catch (err) {
      console.warn('api.post ', { err })
      throw err
    }
  }

  return { post }
}

export default api(config.API_URL)
