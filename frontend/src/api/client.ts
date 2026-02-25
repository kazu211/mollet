import axios from 'axios'

const client = axios.create({
  headers: {
    'Content-Type': 'text/plain'
  }
})

// リクエストインターセプター（必要に応じてログなど）
client.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター
client.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default client

