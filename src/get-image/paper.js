import fetch from 'electron-fetch'
import queryString from 'query-string'

const { imageMinWidth } = require('../utils/config')

let source = null

const { axiosGet } = require('../utils/axios')

export const getCategories = function() {
  return new Promise((resolve, reject) => {
    const url = 'https://service.paper.meiyuan.in/api/v2/columns'
    const request = fetch(url)
    source = request
      .then(res => res.json())
      .then(json => {
        const cates = json.map(item => ({
          id: item._id,
          name: item.langs['zh-Hant']
        }))
        resolve(cates)
      })
      .catch(err => {
        reject()
      })
  })
}

export const getImage = function(data) {
  return new Promise((resolve, reject) => {
    if (!data) {
      resolve([])
      return
    }
    const baseUrl = `https://service.paper.meiyuan.in/api/v2/columns/flow/${
      data.category
    }`

    const params = {
      page: data.page + 1,
      per_page: 50
    }
    const str = queryString.stringify(params)
    const request = fetch(`${baseUrl}?${str}`)

    request
      .then(res => res.json())
      .then(result => {
        source = null
        const urls = []
        result.forEach(item => {
          const obj = {
            width: item.width,
            height: item.height,
            url: item.urls.small,
            downloadUrl: item.urls.raw
          }
          if (parseInt(obj.width, 10) > imageMinWidth) {
            urls.push(obj)
          }
        })
        resolve(urls)
      })
      .catch(error => {
        source = null
        console.log('------------请求失败paper:', baseUrl, data)
        reject()
      })
  })
}

export const cancelImage = function() {
  if (source) {
    // source.cancel()
  }
}
