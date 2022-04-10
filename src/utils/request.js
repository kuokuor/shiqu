import axios from 'axios'

// 创建axios实例
const instance = axios.create({
  baseURL: 'http://192.168.75.99:4523/mock/814181',
  timeout: 10000 // 十秒就算请求超时
})

// 封装请求函数
export const get = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    instance.get(url, params).then((response) => {
      resolve(response.data)
    }, (err) => {
      reject(err)
    })
  })
}

export const post = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    instance.post(url, data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' // 请求后端数据时，Content-Type类型为json
      }
    }).then((response) => {
      resolve(response.data)
    }, (err) => {
      reject(err)
    })
  })
}
