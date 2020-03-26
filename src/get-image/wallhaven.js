/** *
 * https://wallhaven.cc
 *
 *
 * 获取壁纸
 * https://wallhaven.cc/latest?
 * page=2
 *
 *
 * 搜索
 * https://wallhaven.cc/search?q=cat&categories=111&purity=100&sorting=date_added&order=desc
 * page=2
 *
 */

import fetch from 'electron-fetch'
import queryString from 'query-string'

const cheerio = require('cheerio')
const { imageMinWidth } = require('../utils/config')

let source = null

export const getImage = function(data) {
  return new Promise((resolve, reject) => {
    if (!data) {
      resolve([])
    }
    let baseUrl = 'https://wallhaven.cc/latest'
    let params = {}
    if (data.page > 0) {
      params.page = data.page + 1
    }
    if (data.searchKey) {
      baseUrl = 'https://wallhaven.cc/search'
      params = {
        ...params,
        q: data.searchKey,
        categories: 111,
        purity: 100,
        sorting: 'date_added',
        order: 'desc'
      }
    }
    const str = queryString.stringify(params)
    const request = fetch(`${baseUrl}?${str}`)

    request
      .then(res => res.text())
      .then(result => {
        source = null
        const urls = []
        const $ = cheerio.load(result)
        $('figure').each((index, node) => {
          const wallpaperId = node.attribs['data-wallpaper-id']
          const url = $(node)
            .find('img')
            .attr('data-src')
          const isPng = Boolean($(node).find('.png').length)
          const [width, height] = $(node)
            .find('.wall-res')
            .html()
            .split('x')
          const downloadUrl = `https://w.wallhaven.cc/full/${wallpaperId.slice(
            0,
            2
          )}/wallhaven-${wallpaperId}.${isPng ? 'png' : 'jpg'}`
          const obj = {
            width: width.trim(),
            height: height.trim(),
            url,
            downloadUrl
          }
          if (parseInt(obj.width, 10) > imageMinWidth) {
            urls.push(obj)
          }
        })
        resolve(urls)
      })
      .catch(error => {
        source = null
        console.log('------------请求失败wallhaven:', baseUrl, error)
        reject()
      })
  })
}

export const cancelImage = function() {
  if (source) {
    // source.cancel()
  }
}
